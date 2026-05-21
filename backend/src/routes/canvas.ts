import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

router.post('/ai-draw', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt required' });
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 2000,
      messages: [{ role: 'user', content: `Generate canvas drawing JSON for: "${prompt}". Return ONLY valid JSON (no markdown) with: {"shapes":[{"id":"n0","type":"circle","x":300,"y":150,"r":35,"fill":"#1e1e2d","stroke":"#6366f1","value":"50"}],"lines":[{"id":"a0","isArrow":true,"points":[280,160,200,200],"color":"#6366f1","strokeWidth":2}]}. Use x:50-750, y:50-500. Circles for nodes(r:30-40), Rects for arrays(width:70-90,height:50). Space 80-120px apart.` }],
    });
    const text = response.content.find((c: any) => c.type === 'text')?.text || '';
    try { res.json(JSON.parse(text.replace(/```json?|```/g,'').trim())); }
    catch { res.status(500).json({ message: 'AI response parse failed' }); }
  } catch (e) { console.error(e); res.status(500).json({ message: 'AI drawing failed' }); }
});

router.post('/save', authenticate, async (_req: AuthRequest, res: Response) => {
  res.json({ saved: true });
});

export default router;
