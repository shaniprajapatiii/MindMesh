import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { mongoDb } from '../lib/db';

const router = Router();
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
  go: 60,
  rust: 73,
};

type ExecutionCase = {
  input: string;
  expected?: string;
  label?: string;
};

// POST /api/code/run - Execute code against test cases
router.post('/run', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, language, testCases } = req.body;
    if (!code || !language) return res.status(400).json({ message: 'Code and language required' });

    const judge0Key = process.env.JUDGE0_API_KEY;
    const judge0Url = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    if (!judge0Key) return res.status(503).json({ message: 'Code execution is unavailable until Judge0 is configured.' });

    const langId = JUDGE0_LANGUAGE_IDS[language];
    if (!langId) return res.status(400).json({ message: 'Language not supported' });

    const cases = parseExecutionCases(testCases).slice(0, 5);
    const results = await executeCasesWithJudge0({
      code,
      languageId: langId,
      cases,
      judge0Key,
      judge0Url,
    });

    const allPassed = results.every(r => r.passed);
    res.json({
      accepted: allPassed,
      results,
      runtime: results[0]?.runtime,
      memory: '12.4',
      status: allPassed ? 'Accepted' : 'Wrong Answer',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Code execution failed. Please try again.' });
  }
});

// POST /api/code/execute - Execute a single stdin/stdout program run
router.post('/execute', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, language, stdin = '' } = req.body;
    if (!code || !language) return res.status(400).json({ message: 'Code and language required' });

    const judge0Key = process.env.JUDGE0_API_KEY;
    const judge0Url = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    if (!judge0Key) return res.status(503).json({ message: 'Code execution is unavailable until Judge0 is configured.' });

    const langId = JUDGE0_LANGUAGE_IDS[language];
    if (!langId) return res.status(400).json({ message: 'Language not supported' });

    const submission = await fetch(`${judge0Url}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': judge0Key,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        source_code: code,
        language_id: langId,
        stdin,
        cpu_time_limit: 5,
        memory_limit: 256000,
      }),
    });

    const result: any = await submission.json();
    const stdout = normalizeText(result.stdout || '');
    const stderr = normalizeText(result.stderr || result.compile_output || '');

    res.json({
      stdout,
      stderr,
      status: result.status?.description || 'Completed',
      statusId: result.status?.id ?? null,
      runtime: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
      memory: result.memory ? Number((parseFloat(result.memory) / 1024).toFixed(1)) : null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Code execution failed. Please try again.' });
  }
});

// POST /api/code/compile - Compile source and return compiler output/errors
router.post('/compile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) return res.status(400).json({ message: 'Code and language required' });

    const judge0Key = process.env.JUDGE0_API_KEY;
    const judge0Url = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    if (!judge0Key) return res.status(503).json({ message: 'Code compilation is unavailable until Judge0 is configured.' });

    const langId = JUDGE0_LANGUAGE_IDS[language];
    if (!langId) return res.status(400).json({ message: 'Language not supported' });

    const submission = await fetch(`${judge0Url}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': judge0Key,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        source_code: code,
        language_id: langId,
        stdin: '',
        cpu_time_limit: 3,
        memory_limit: 256000,
      }),
    });

    const result: any = await submission.json();
    const compileOutput = normalizeText(result.compile_output || '');
    const stderr = normalizeText(result.stderr || '');

    res.json({
      compileOutput,
      stderr,
      status: result.status?.description || 'Completed',
      statusId: result.status?.id ?? null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Compilation failed. Please try again.' });
  }
});

// POST /api/code/submit
router.post('/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, language, problemId } = req.body;
    if (!problemId) return res.status(400).json({ message: 'Problem ID required' });

    const problem = await mongoDb.problem.findUnique({
      where: { id: problemId },
      select: { id: true, title: true, examples: true },
    });

    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const judge0Key = process.env.JUDGE0_API_KEY;
    const judge0Url = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    const langId = JUDGE0_LANGUAGE_IDS[language];

    if (!judge0Key) return res.status(503).json({ message: 'Code submission is unavailable until Judge0 is configured.' });
    if (!langId) return res.status(400).json({ message: 'Language not supported' });

    const executionCases = normalizeProblemExamples(problem.examples);
    if (executionCases.length === 0) return res.status(400).json({ message: 'Problem examples are required for submission validation' });

    let submissionStatus = 'attempted';
    let runtime: number | null = null;
    let memory: number | null = null;
    let testsPassed = 0;
    let testsTotal = executionCases.length;
    let accepted = false;

    const results = await executeCasesWithJudge0({
      code,
      languageId: langId,
      cases: executionCases,
      judge0Key,
      judge0Url,
    });

    testsPassed = results.filter(result => result.passed).length;
    testsTotal = results.length;
    accepted = results.length > 0 && testsPassed === testsTotal;
    runtime = results.length ? Math.round(results.reduce((sum, item) => sum + (item.runtime || 0), 0) / results.length) : null;
    memory = results.length ? Number((results.reduce((sum, item) => sum + (item.memory || 0), 0) / results.length).toFixed(1)) : null;
    submissionStatus = accepted ? 'accepted' : results.some(r => r.status?.toLowerCase().includes('compile')) ? 'compile_error' : 'wrong_answer';

    await mongoDb.submission.create({
      data: {
        userId: req.user!.id,
        problemId,
        language,
        code,
        status: submissionStatus,
        runtime,
        memory,
        testsPassed,
        testsTotal,
      },
    });

    if (accepted) {
      // Update problem status
      await mongoDb.userProblemStatus.upsert({
        where: { userId_problemId: { userId: req.user!.id, problemId } },
        update: { status: 'solved', solvedAt: new Date(), attempts: { increment: 1 } },
        create: { userId: req.user!.id, problemId, status: 'solved', solvedAt: new Date(), attempts: 1 },
      });
      // Update activity
      const today = new Date().toISOString().split('T')[0];
      await mongoDb.activityLog.upsert({
        where: { userId_dateStr: { userId: req.user!.id, dateStr: today } },
        update: { count: { increment: 1 } },
        create: { userId: req.user!.id, dateStr: today, count: 1 },
      });
    } else {
      await mongoDb.userProblemStatus.upsert({
        where: { userId_problemId: { userId: req.user!.id, problemId } },
        update: { attempts: { increment: 1 } },
        create: { userId: req.user!.id, problemId, status: 'attempted', attempts: 1 },
      });
    }

    res.json({
      accepted,
      status: accepted ? 'Accepted' : submissionStatus === 'compile_error' ? 'Compile Error' : 'Wrong Answer',
      message: accepted ? 'All test cases passed!' : submissionStatus === 'compile_error' ? 'Compilation failed' : 'Some test cases failed',
      runtime: runtime ?? null,
      memory: memory ?? null,
      testsPassed,
      testsTotal,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Submission failed' });
  }
});

// GET /api/code/submissions/:problemId
router.get('/submissions/:problemId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await mongoDb.submission.findMany({
      where: { userId: req.user!.id, problemId: req.params.problemId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(submissions);
  } catch { res.status(500).json([]); }
});

// GET /api/code/submissions
router.get('/submissions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { problemId, status, language, limit = '50' } = req.query as Record<string, string>;
    const where: Record<string, any> = { userId: req.user!.id };
    if (problemId) where.problemId = problemId;
    if (status) where.status = status;
    if (language) where.language = language;

    const submissions = await mongoDb.submission.findMany({
      where,
      include: { problem: { select: { title: true, difficulty: true, platform: true, topic: true } } },
      orderBy: { createdAt: 'desc' },
      take: Math.min(parseInt(limit, 10) || 50, 100),
    });

    res.json(submissions);
  } catch {
    res.status(500).json([]);
  }
});

async function executeCasesWithJudge0(params: {
  code: string;
  languageId: number;
  cases: ExecutionCase[];
  judge0Key: string;
  judge0Url: string;
}) {
  const { code, languageId, cases, judge0Key, judge0Url } = params;
  const results: Array<{
    input: string;
    output: string;
    expected: string;
    passed: boolean;
    runtime: number | null;
    memory: number | null;
    error?: string;
    status?: string;
  }> = [];

  for (const testCase of cases) {
    try {
      const submission = await fetch(`${judge0Url}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': judge0Key,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin: testCase.input,
          cpu_time_limit: 5,
          memory_limit: 256000,
        }),
      });

      const result: any = await submission.json();
      const output = normalizeText(result.stdout?.trim() || result.stderr?.trim() || '');
      const expected = normalizeText(testCase.expected || '');
      const passed = result.status?.id === 3 && (expected ? output === expected : true);

      results.push({
        input: testCase.input,
        output,
        expected,
        passed,
        runtime: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
        memory: result.memory ? Number((parseFloat(result.memory) / 1024).toFixed(1)) : null,
        error: result.compile_output || result.stderr,
        status: result.status?.description,
      });
    } catch {
      results.push({ input: testCase.input, output: 'Error', expected: normalizeText(testCase.expected || ''), passed: false, runtime: null, memory: null, status: 'Execution failed' });
    }
  }

  return results;
}

function parseExecutionCases(rawCases: any): ExecutionCase[] {
  if (Array.isArray(rawCases)) {
    return rawCases
      .map(item => {
        if (typeof item === 'string') return parseExecutionCaseLine(item);
        if (item && typeof item === 'object') {
          const input = typeof item.input === 'string' ? item.input : '';
          const expected = typeof item.expected === 'string' ? item.expected : '';
          if (!input) return null;
          return { input, expected, label: typeof item.label === 'string' ? item.label : undefined };
        }
        return null;
      })
      .filter(Boolean) as ExecutionCase[];
  }

  if (typeof rawCases !== 'string') return [];
  return rawCases
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(parseExecutionCaseLine)
    .filter(Boolean) as ExecutionCase[];
}

function parseExecutionCaseLine(line: string): ExecutionCase | null {
  const separators = ['=>', '|', '::'];
  for (const separator of separators) {
    const index = line.indexOf(separator);
    if (index > -1) {
      const input = line.slice(0, index).trim();
      const expected = line.slice(index + separator.length).trim();
      if (input) return { input, expected };
    }
  }
  return line ? { input: line.trim() } : null;
}

function normalizeProblemExamples(examples: any): ExecutionCase[] {
  if (!examples) return [];

  let parsed: any = examples;
  if (typeof examples === 'string') {
    try {
      parsed = JSON.parse(examples);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .map(item => {
      if (!item) return null;
      if (typeof item === 'string') return parseExecutionCaseLine(item);
      const input = typeof item.input === 'string' ? item.input : '';
      const expected = typeof item.output === 'string' ? item.output : typeof item.expected === 'string' ? item.expected : '';
      if (!input) return null;
      return { input, expected };
    })
    .filter(Boolean) as ExecutionCase[];
}

function normalizeText(value: string) {
  return value.replace(/\r\n/g, '\n').trim();
}

export default router;
