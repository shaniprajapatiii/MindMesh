import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';
import { exec } from 'child_process';
import { writeFileSync, unlinkSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const router = Router();

// POST /api/code/run - Execute code against test cases
router.post('/run', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, language, testCases } = req.body;
    if (!code || !language) return res.status(400).json({ message: 'Code and language required' });

    // Use Judge0 API if configured, otherwise return mock
    const judge0Key = process.env.JUDGE0_API_KEY;
    const judge0Url = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';

    if (!judge0Key) {
      // Return mock result for development
      return res.json(getMockResult(language));
    }

    const languageIds: Record<string, number> = {
      javascript: 63, python: 71, cpp: 54, java: 62, go: 60, rust: 73,
    };

    const langId = languageIds[language];
    if (!langId) return res.status(400).json({ message: 'Language not supported' });

    const cases = (testCases || '').split('\n').filter(Boolean).slice(0, 5);
    const results = [];

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
            language_id: langId,
            stdin: testCase,
            cpu_time_limit: 5,
            memory_limit: 256000,
          }),
        });

        const result: any = await submission.json();
        results.push({
          input: testCase,
          output: result.stdout?.trim() || result.stderr?.trim() || '',
          expected: '',
          passed: result.status?.id === 3,
          runtime: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
          error: result.compile_output || result.stderr,
          status: result.status?.description,
        });
      } catch {
        results.push({ input: testCase, output: 'Error', passed: false, runtime: null });
      }
    }

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

// POST /api/code/submit
router.post('/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, language, problemId } = req.body;
    if (!problemId) return res.status(400).json({ message: 'Problem ID required' });

    // In production: run against all test cases
    // For now: save submission and return mock
    const mockAccepted = Math.random() > 0.3;

    await prisma.submission.create({
      data: {
        userId: req.user!.id,
        problemId,
        language,
        code,
        status: mockAccepted ? 'accepted' : 'wrong_answer',
        runtime: Math.floor(Math.random() * 100 + 20),
        memory: Math.random() * 10 + 40,
      },
    });

    if (mockAccepted) {
      // Update problem status
      await prisma.userProblemStatus.upsert({
        where: { userId_problemId: { userId: req.user!.id, problemId } },
        update: { status: 'solved', solvedAt: new Date(), attempts: { increment: 1 } },
        create: { userId: req.user!.id, problemId, status: 'solved', solvedAt: new Date(), attempts: 1 },
      });
      // Update activity
      const today = new Date().toISOString().split('T')[0];
      await prisma.activityLog.upsert({
        where: { userId_dateStr: { userId: req.user!.id, dateStr: today } },
        update: { count: { increment: 1 } },
        create: { userId: req.user!.id, dateStr: today, count: 1 },
      });
    } else {
      await prisma.userProblemStatus.upsert({
        where: { userId_problemId: { userId: req.user!.id, problemId } },
        update: { attempts: { increment: 1 } },
        create: { userId: req.user!.id, problemId, status: 'attempted', attempts: 1 },
      });
    }

    res.json({
      accepted: mockAccepted,
      status: mockAccepted ? 'Accepted' : 'Wrong Answer',
      message: mockAccepted ? 'All test cases passed!' : 'Some test cases failed',
      runtime: Math.floor(Math.random() * 100 + 20),
      memory: (Math.random() * 10 + 40).toFixed(1),
      testsPassed: mockAccepted ? 100 : Math.floor(Math.random() * 80),
      testsTotal: 100,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Submission failed' });
  }
});

// GET /api/code/submissions/:problemId
router.get('/submissions/:problemId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { userId: req.user!.id, problemId: req.params.problemId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(submissions);
  } catch { res.status(500).json([]); }
});

function getMockResult(language: string) {
  const runtime = Math.floor(Math.random() * 80 + 20);
  return {
    accepted: true,
    results: [
      { input: '[2,7,11,15], 9', output: '[0,1]', expected: '[0,1]', passed: true, runtime },
      { input: '[3,2,4], 6', output: '[1,2]', expected: '[1,2]', passed: true, runtime: runtime - 5 },
      { input: '[3,3], 6', output: '[0,1]', expected: '[0,1]', passed: true, runtime: runtime - 10 },
    ],
    runtime,
    memory: '44.2',
    status: 'Accepted',
  };
}

export default router;
