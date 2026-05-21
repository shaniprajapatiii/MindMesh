import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/ai/mentor - AI Mentor chat
router.post('/mentor', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { message, history = [], hintLevel, problem } = req.body;

    let systemPrompt = `You are an expert DSA (Data Structures & Algorithms) mentor named "DSA Guru". Your goal is to help students learn, NOT just give answers.

Rules:
- Be encouraging, warm, and pedagogical
- Guide students to discover solutions themselves
- Use the Socratic method when possible
- Format code with proper markdown code blocks
- Keep responses concise but complete`;

    if (hintLevel === 1) {
      systemPrompt += `\n\nIMPORTANT: Give ONLY a thinking direction hint. Just 2-3 sentences that guide their thinking WITHOUT revealing the approach or algorithm. Ask a guiding question.`;
    } else if (hintLevel === 2) {
      systemPrompt += `\n\nIMPORTANT: Give an approach hint. Describe the algorithm approach in plain English WITHOUT writing any code. Explain the pattern.`;
    } else if (hintLevel === 3) {
      systemPrompt += `\n\nIMPORTANT: Give pseudocode only. Show the algorithm as numbered steps in plain language. No actual code syntax.`;
    }

    if (problem) systemPrompt += `\n\nCurrent problem the student is working on: ${problem}`;

    const messages: any[] = [
      ...history.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content.find(c => c.type === 'text')?.text || '';
    res.json({ response: text, type: hintLevel ? 'hint' : 'explanation' });
  } catch (e: any) {
    console.error('AI mentor error:', e);
    res.status(500).json({ message: 'AI service unavailable', response: 'Sorry, I\'m having trouble right now. Please try again in a moment.' });
  }
});

// POST /api/ai/generate-notes - Generate AI notes for a problem/topic
router.post('/generate-notes', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ message: 'Topic required' });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Generate comprehensive DSA study notes for: "${topic}"

Format as Markdown with these sections:
# ${topic}

## 🧠 Problem Understanding
[Explain what the problem is asking]

## 💡 Approach 1: Brute Force
**Idea:** [Explain the brute force approach]
**Time:** O(?) **Space:** O(?)

\`\`\`python
# Brute force code
\`\`\`

## ⚡ Approach 2: Optimal Solution
**Pattern:** [What pattern does this use - e.g. HashMap, Two Pointer, Sliding Window]
**Idea:** [Explain the optimal approach step by step]
**Time:** O(?) **Space:** O(?)

\`\`\`python
# Optimal code
\`\`\`

## 🎯 How to Think About This
[Walk through the thought process - how to arrive at the optimal solution]

## 🔗 Similar Problems
- Problem 1
- Problem 2
- Problem 3

## 📌 Key Takeaways
- [Key insight 1]
- [Key insight 2]`
      }],
    });

    const content = response.content.find(c => c.type === 'text')?.text || '';
    const suggestedTags = extractTags(topic, content);

    res.json({ content, tags: suggestedTags });
  } catch (e) {
    console.error('Note generation error:', e);
    res.status(500).json({ message: 'Failed to generate notes' });
  }
});

// POST /api/ai/explain-code - Explain code line by line
router.post('/explain-code', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, language } = req.body;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Explain this ${language} code line by line in a clear, educational way. Also give time & space complexity analysis.\n\n\`\`\`${language}\n${code}\n\`\`\``
      }],
    });

    res.json({ explanation: response.content.find(c => c.type === 'text')?.text || '' });
  } catch { res.status(500).json({ message: 'Failed to explain code' }); }
});

// POST /api/ai/optimize-code - Suggest code optimizations
router.post('/optimize-code', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, language } = req.body;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Analyze this ${language} code and suggest optimizations for better time/space complexity. Show the improved version.\n\n\`\`\`${language}\n${code}\n\`\`\``
      }],
    });

    res.json({ suggestions: response.content.find(c => c.type === 'text')?.text || '' });
  } catch { res.status(500).json({ message: 'Failed to optimize code' }); }
});

// POST /api/ai/generate-tests - Generate test cases
router.post('/generate-tests', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { problemDescription, code } = req.body;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Generate 5 comprehensive test cases (including edge cases) for this problem:\n\n${problemDescription}\n\nReturn ONLY a JSON array like: [{"input": "...", "expected": "...", "description": "..."}]`
      }],
    });

    const text = response.content.find(c => c.type === 'text')?.text || '[]';
    try {
      const tests = JSON.parse(text.replace(/```json?|```/g, '').trim());
      res.json({ tests });
    } catch { res.json({ tests: [] }); }
  } catch { res.status(500).json({ message: 'Failed to generate tests' }); }
});

// POST /api/ai/dry-run - Generate a step-by-step dry run trace
router.post('/dry-run', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { problem, code, language, input, approach } = req.body;

    const prompt = `Create a dry run visualization for this DSA solution.

Problem: ${problem || 'Unknown problem'}
Language: ${language || 'javascript'}
Approach: ${approach || 'not provided'}
Input: ${input || 'not provided'}

Code:
\`\`\`${language || 'text'}
${code || ''}
\`\`\`

Return ONLY valid JSON in this shape:
{
  "title": "Short title",
  "summary": "1-2 sentence summary",
  "pattern": "Pattern name",
  "complexity": { "time": "...", "space": "..." },
  "variables": [{ "name": "i", "value": "0", "note": "index pointer" }],
  "steps": [
    {
      "step": 1,
      "title": "Initialization",
      "explanation": "What happens here",
      "state": { "pointer": "0", "result": "[]" },
      "highlight": ["nums[0]", "map"]
    }
  ],
  "takeaways": ["...", "..."]
}`;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json(getFallbackDryRun(problem, input, approach));
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((c: any) => c.type === 'text')?.text || '';
    try {
      const parsed = JSON.parse(text.replace(/```json?|```/g, '').trim());
      res.json(parsed);
    } catch {
      res.json(getFallbackDryRun(problem, input, approach));
    }
  } catch (e) {
    console.error('Dry run generation error:', e);
    res.status(500).json({ message: 'Failed to generate dry run' });
  }
});

// POST /api/ai/roadmap - Generate personalized DSA roadmap
router.post('/roadmap', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { goal, currentLevel, timeAvailable } = req.body;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Create a detailed DSA learning roadmap for someone who wants to: "${goal}". Current level: ${currentLevel}. Available time: ${timeAvailable} hours/week.

Format as JSON: {"weeks": [{"week": 1, "title": "...", "topics": [...], "problems": [...], "goal": "..."}], "totalWeeks": N, "resources": [...]}`
      }],
    });

    const text = response.content.find(c => c.type === 'text')?.text || '';
    try {
      const roadmap = JSON.parse(text.replace(/```json?|```/g, '').trim());
      res.json(roadmap);
    } catch { res.json({ raw: text }); }
  } catch { res.status(500).json({ message: 'Failed to generate roadmap' }); }
});

function extractTags(topic: string, content: string): string[] {
  const tags: string[] = [];
  const topicLower = topic.toLowerCase();

  if (topicLower.includes('sum') || topicLower.includes('array')) tags.push('arrays');
  if (topicLower.includes('tree') || topicLower.includes('bst')) tags.push('trees');
  if (topicLower.includes('graph') || topicLower.includes('bfs') || topicLower.includes('dfs')) tags.push('graphs');
  if (topicLower.includes('dp') || topicLower.includes('dynamic')) tags.push('dp');
  if (topicLower.includes('string')) tags.push('strings');
  if (content.includes('HashMap') || content.includes('dictionary')) tags.push('hashmap');
  if (content.includes('Two Pointer')) tags.push('two-pointer');
  if (content.includes('Sliding Window')) tags.push('sliding-window');

  tags.push('ai-generated');
  return [...new Set(tags)];
}

function getFallbackDryRun(problem?: string, input?: string, approach?: string) {
  return {
    title: problem || 'Dry Run Trace',
    summary: `A guided trace for ${problem || 'the selected problem'} using ${approach || 'your current approach'}.`,
    pattern: approach || 'HashMap + Iteration',
    complexity: { time: 'O(n)', space: 'O(n)' },
    variables: [
      { name: 'i', value: '0', note: 'Traversal index' },
      { name: 'seen', value: '{}', note: 'Tracked values' },
      { name: 'answer', value: '[]', note: 'Result container' },
    ],
    steps: [
      { step: 1, title: 'Read the input', explanation: `Start with ${input || 'the provided input'} and initialize your working state.`, state: { i: '0', seen: '{}', answer: '[]' }, highlight: ['input'] },
      { step: 2, title: 'Check complement', explanation: 'For each element, compute what value you still need and look it up in the tracked structure.', state: { i: '1', seen: '{ value: index }', answer: '[]' }, highlight: ['complement', 'hash map'] },
      { step: 3, title: 'Return the answer', explanation: 'When the matching pair is found, stop the trace and return the indices.', state: { i: 'done', seen: 'final', answer: '[left, right]' }, highlight: ['return'] },
    ],
    takeaways: ['Track the state after each iteration.', 'Highlight the key invariant that makes the approach work.', 'Use this trace to explain the algorithm in interviews.'],
  };
}

export default router;
