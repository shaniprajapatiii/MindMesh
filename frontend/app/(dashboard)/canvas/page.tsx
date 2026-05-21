'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Pencil, Square, Circle, ArrowRight, Trash2, Undo2, Redo2,
  Download, Type, Minus, Plus, Eraser, RotateCcw, Layers,
  Brain, Play, ZoomIn, ZoomOut, Move
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSocket } from '@/lib/socket';

// Dynamically import to avoid SSR issues
const Stage = dynamic(() => import('react-konva').then(m => m.Stage), { ssr: false });
const Layer = dynamic(() => import('react-konva').then(m => m.Layer), { ssr: false });
const Rect = dynamic(() => import('react-konva').then(m => m.Rect), { ssr: false });
const CircleShape: any = dynamic(() => import('react-konva').then(m => m.Circle), { ssr: false });
const Line = dynamic(() => import('react-konva').then(m => m.Line), { ssr: false });
const Text = dynamic(() => import('react-konva').then(m => m.Text), { ssr: false });
const Arrow = dynamic(() => import('react-konva').then(m => m.Arrow), { ssr: false });
const Group = dynamic(() => import('react-konva').then(m => m.Group), { ssr: false });

const DS_TEMPLATES = [
  {
    id: 'linkedlist',
    label: 'Linked List',
    icon: '⛓',
    generate: (n = 5) => {
      const nodes = [];
      const arrows = [];
      for (let i = 0; i < n; i++) {
        nodes.push({ id: `n${i}`, type: 'rect', x: 80 + i * 120, y: 200, width: 80, height: 50, fill: '#1e1e2d', stroke: '#6366f1', value: String(i * 10 + 1), label: '' });
        if (i < n - 1) arrows.push({ id: `a${i}`, from: { x: 160 + i * 120, y: 225 }, to: { x: 200 + i * 120, y: 225 } });
      }
      nodes.push({ id: 'null', type: 'text', x: 80 + n * 120, y: 210, text: 'NULL', fill: '#ef4444', fontSize: 16 });
      return { nodes, arrows };
    }
  },
  {
    id: 'bst',
    label: 'Binary Tree',
    icon: '🌳',
    generate: () => {
      const nodes = [
        { id: 'r', type: 'circle', x: 400, y: 80, r: 30, fill: '#1e1e2d', stroke: '#6366f1', value: '50' },
        { id: 'l', type: 'circle', x: 250, y: 170, r: 30, fill: '#1e1e2d', stroke: '#8b5cf6', value: '30' },
        { id: 'ri', type: 'circle', x: 550, y: 170, r: 30, fill: '#1e1e2d', stroke: '#8b5cf6', value: '70' },
        { id: 'll', type: 'circle', x: 160, y: 270, r: 30, fill: '#1e1e2d', stroke: '#06b6d4', value: '20' },
        { id: 'lr', type: 'circle', x: 340, y: 270, r: 30, fill: '#1e1e2d', stroke: '#06b6d4', value: '40' },
        { id: 'rl', type: 'circle', x: 460, y: 270, r: 30, fill: '#1e1e2d', stroke: '#06b6d4', value: '60' },
        { id: 'rr', type: 'circle', x: 640, y: 270, r: 30, fill: '#1e1e2d', stroke: '#06b6d4', value: '80' },
      ];
      const arrows = [
        { id: 'a1', from: { x: 376, y: 100 }, to: { x: 274, y: 148 } },
        { id: 'a2', from: { x: 424, y: 100 }, to: { x: 526, y: 148 } },
        { id: 'a3', from: { x: 226, y: 190 }, to: { x: 184, y: 248 } },
        { id: 'a4', from: { x: 274, y: 190 }, to: { x: 316, y: 248 } },
        { id: 'a5', from: { x: 526, y: 190 }, to: { x: 484, y: 248 } },
        { id: 'a6', from: { x: 574, y: 190 }, to: { x: 616, y: 248 } },
      ];
      return { nodes, arrows };
    }
  },
  {
    id: 'stack',
    label: 'Stack',
    icon: '📚',
    generate: (n = 5) => {
      const nodes = [];
      const labels = ['TOP →', '', '', '', 'BOTTOM'];
      for (let i = 0; i < n; i++) {
        nodes.push({ id: `s${i}`, type: 'rect', x: 300, y: 80 + i * 60, width: 160, height: 50, fill: i === 0 ? 'rgba(99,102,241,0.2)' : '#1e1e2d', stroke: i === 0 ? '#6366f1' : '#374151', value: String((n - i) * 10), label: labels[i] });
      }
      return { nodes, arrows: [] };
    }
  },
  {
    id: 'queue',
    label: 'Queue',
    icon: '🔄',
    generate: (n = 5) => {
      const nodes = [];
      const arrows = [];
      for (let i = 0; i < n; i++) {
        nodes.push({ id: `q${i}`, type: 'rect', x: 100 + i * 110, y: 200, width: 90, height: 60, fill: '#1e1e2d', stroke: i === 0 ? '#10b981' : i === n - 1 ? '#ef4444' : '#374151', value: String(i + 1), label: i === 0 ? 'FRONT' : i === n - 1 ? 'REAR' : '' });
        if (i < n - 1) arrows.push({ id: `aq${i}`, from: { x: 190 + i * 110, y: 230 }, to: { x: 210 + i * 110, y: 230 } });
      }
      return { nodes, arrows };
    }
  },
  {
    id: 'graph',
    label: 'Graph',
    icon: '🕸',
    generate: () => {
      const nodes = [
        { id: 'g0', type: 'circle', x: 350, y: 150, r: 32, fill: '#1e1e2d', stroke: '#6366f1', value: 'A' },
        { id: 'g1', type: 'circle', x: 200, y: 280, r: 32, fill: '#1e1e2d', stroke: '#8b5cf6', value: 'B' },
        { id: 'g2', type: 'circle', x: 500, y: 280, r: 32, fill: '#1e1e2d', stroke: '#8b5cf6', value: 'C' },
        { id: 'g3', type: 'circle', x: 120, y: 410, r: 32, fill: '#1e1e2d', stroke: '#06b6d4', value: 'D' },
        { id: 'g4', type: 'circle', x: 350, y: 410, r: 32, fill: '#1e1e2d', stroke: '#06b6d4', value: 'E' },
        { id: 'g5', type: 'circle', x: 580, y: 410, r: 32, fill: '#1e1e2d', stroke: '#10b981', value: 'F' },
      ];
      const arrows = [
        { id: 'ag1', from: { x: 322, y: 172 }, to: { x: 228, y: 258 }, bidirect: true },
        { id: 'ag2', from: { x: 378, y: 172 }, to: { x: 472, y: 258 }, bidirect: true },
        { id: 'ag3', from: { x: 172, y: 302 }, to: { x: 148, y: 388 } },
        { id: 'ag4', from: { x: 228, y: 302 }, to: { x: 318, y: 388 } },
        { id: 'ag5', from: { x: 472, y: 302 }, to: { x: 378, y: 388 } },
        { id: 'ag6', from: { x: 528, y: 302 }, to: { x: 552, y: 388 } },
      ];
      return { nodes, arrows };
    }
  },
  {
    id: 'array',
    label: 'Array',
    icon: '▦',
    generate: (n = 8) => {
      const vals = [4, 2, 7, 1, 9, 3, 6, 5];
      const nodes = vals.slice(0, n).map((v, i) => ({
        id: `arr${i}`, type: 'rect', x: 80 + i * 80, y: 200, width: 70, height: 60,
        fill: '#1e1e2d', stroke: '#374151', value: String(v), indexLabel: String(i)
      }));
      return { nodes, arrows: [] };
    }
  },
];

const TOOLS = [
  { id: 'select', icon: Move, label: 'Select / Move' },
  { id: 'pen', icon: Pencil, label: 'Free Draw' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
];

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#ffffff', '#94a3b8', '#374151'];

export default function CanvasPage() {
  const [tool, setTool] = useState('select');
  const [color, setColor] = useState('#6366f1');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [shapes, setShapes] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<any[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dsCount, setDsCount] = useState(5);
  const [roomId, setRoomId] = useState('mindmesh-canvas');
  const stageRef = useRef<any>(null);
  const containerRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const currentLine = useRef<number[]>([]);
  const socketRef = useRef<any>(null);
  const roomIdRef = useRef('mindmesh-canvas');
  const syncingRemoteRef = useRef(false);

  const applyBoardState = (newShapes: any[], newLines: any[]) => {
    syncingRemoteRef.current = true;
    setShapes(newShapes);
    setLines(newLines);
    saveHistory(newShapes, newLines);
    window.setTimeout(() => { syncingRemoteRef.current = false; }, 0);
  };

  const broadcastBoardState = (newShapes: any[], newLines: any[]) => {
    const socket = socketRef.current;
    if (!socket || syncingRemoteRef.current) return;
    socket.emit('canvas-update', { roomId: roomIdRef.current, shapes: newShapes, lines: newLines });
  };

  useEffect(() => {
    const room = new URLSearchParams(window.location.search).get('room') || 'mindmesh-canvas';
    roomIdRef.current = room;
    setRoomId(room);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (socket) {
      socket.emit('join-room', roomIdRef.current);
      const handleRemoteCanvas = (payload: any) => {
        if (!payload || payload.roomId !== roomIdRef.current) return;
        applyBoardState(Array.isArray(payload.shapes) ? payload.shapes : [], Array.isArray(payload.lines) ? payload.lines : []);
      };
      socket.on('canvas-update', handleRemoteCanvas);
      return () => {
        socket.emit('leave-room', roomIdRef.current);
        socket.off('canvas-update', handleRemoteCanvas);
      };
    }
    return undefined;
  }, [roomId]);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setStageSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const saveHistory = (newShapes: any[], newLines: any[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newShapes, ...newLines.map(l => ({ ...l, isLine: true }))]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(h => h - 1);
      const prev = history[historyIndex - 1];
      setShapes(prev.filter(s => !s.isLine));
      setLines(prev.filter(s => s.isLine));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(h => h + 1);
      const next = history[historyIndex + 1];
      setShapes(next.filter(s => !s.isLine));
      setLines(next.filter(s => s.isLine));
    }
  };

  const clearCanvas = () => {
    applyBoardState([], []);
    broadcastBoardState([], []);
  };

  const loadTemplate = (template: typeof DS_TEMPLATES[0]) => {
    const { nodes, arrows } = template.generate(dsCount);
    const newShapes = nodes.map(n => ({ ...n, color }));
    const newArrows = arrows.map(a => ({ ...a, isLine: false, isArrow: true, points: [a.from.x, a.from.y, a.to.x, a.to.y], color }));
    applyBoardState(newShapes, newArrows);
    broadcastBoardState(newShapes, newArrows);
    toast.success(`${template.label} loaded!`);
  };

  const handleMouseDown = (e: any) => {
    if (tool === 'select') return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    setIsDrawing(true);

    if (tool === 'pen' || tool === 'eraser') {
      currentLine.current = [pos.x, pos.y];
      const newLine = { id: Date.now().toString(), isLine: true, isPen: true, points: [pos.x, pos.y], color: tool === 'eraser' ? '#0a0a0f' : color, strokeWidth: tool === 'eraser' ? strokeWidth * 5 : strokeWidth };
      setLines(prev => [...prev, newLine]);
    } else if (tool === 'rect') {
      setShapes(prev => [...prev, { id: Date.now().toString(), type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0, fill: color + '22', stroke: color, strokeWidth, drawing: true }]);
    } else if (tool === 'circle') {
      setShapes(prev => [...prev, { id: Date.now().toString(), type: 'circle', x: pos.x, y: pos.y, r: 0, fill: color + '22', stroke: color, strokeWidth, drawing: true }]);
    } else if (tool === 'arrow' || tool === 'line') {
      setLines(prev => [...prev, { id: Date.now().toString(), isLine: true, isArrow: tool === 'arrow', points: [pos.x, pos.y, pos.x, pos.y], color, strokeWidth, drawing: true }]);
    } else if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newShape = { id: Date.now().toString(), type: 'text', x: pos.x, y: pos.y, text, color, fontSize: 16 };
        const s = [...shapes, newShape];
        setShapes(s);
        saveHistory(s, lines);
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    if (tool === 'pen' || tool === 'eraser') {
      setLines(prev => prev.map((l, i) => i === prev.length - 1 ? { ...l, points: [...l.points, pos.x, pos.y] } : l));
    } else if (tool === 'rect') {
      setShapes(prev => prev.map((s, i) => i === prev.length - 1 ? { ...s, width: pos.x - s.x, height: pos.y - s.y } : s));
    } else if (tool === 'circle') {
      setShapes(prev => prev.map((s, i) => i === prev.length - 1 ? { ...s, r: Math.sqrt(Math.pow(pos.x - s.x, 2) + Math.pow(pos.y - s.y, 2)) } : s));
    } else if (tool === 'arrow' || tool === 'line') {
      setLines(prev => prev.map((l, i) => i === prev.length - 1 ? { ...l, points: [l.points[0], l.points[1], pos.x, pos.y] } : l));
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const cleanShapes = shapes.map(s => ({ ...s, drawing: false }));
    const cleanLines = lines.map(l => ({ ...l, drawing: false }));
    setShapes(cleanShapes);
    setLines(cleanLines);
    saveHistory(cleanShapes, cleanLines);
    broadcastBoardState(cleanShapes, cleanLines);
  };

  const exportCanvas = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'ds-diagram.png';
      link.href = uri;
      link.click();
      toast.success('Exported!');
    }
  };

  const handleAiDraw = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/canvas/ai-draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.shapes) {
        applyBoardState(data.shapes, data.lines || []);
        broadcastBoardState(data.shapes, data.lines || []);
        toast.success('AI diagram generated!');
      }
    } catch {
      toast.error('AI drawing failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0a0a0f]">
      {/* Left toolbar */}
      <div className="w-14 bg-[#111118] border-r border-white/5 flex flex-col items-center py-3 gap-1 flex-shrink-0">
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            title={t.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              tool === t.id ? 'bg-indigo-500/20 text-indigo-300 shadow-glow-sm' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <t.icon className="w-4 h-4" />
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={undo} disabled={historyIndex === 0} title="Undo" className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-30">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={redo} disabled={historyIndex === history.length - 1} title="Redo" className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-30">
          <Redo2 className="w-4 h-4" />
        </button>
        <button onClick={clearCanvas} title="Clear all" className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-white/5">
          <Trash2 className="w-4 h-4" />
        </button>
        <button onClick={exportCanvas} title="Export PNG" className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:bg-white/5">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Main canvas area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5 bg-[#111118] flex-shrink-0 flex-wrap">
          {/* DS Templates */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Insert:</span>
            <div className="flex gap-1">
              {DS_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => loadTemplate(t)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-xs text-gray-300 hover:text-white transition-all">
                  <span>{t.icon}</span>
                  <span className="hidden md:inline">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Colors */}
          <div className="flex items-center gap-1">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-[#111118] scale-110' : 'hover:scale-105'}`}
                style={{ background: c }}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Stroke width */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Size:</span>
            <input type="range" min="1" max="12" value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} className="w-20" />
            <span className="text-white w-4">{strokeWidth}</span>
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* DS Count */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Nodes:</span>
            <button onClick={() => setDsCount(c => Math.max(2, c - 1))} className="w-5 h-5 rounded bg-white/8 text-white flex items-center justify-center">-</button>
            <span className="text-white w-4 text-center">{dsCount}</span>
            <button onClick={() => setDsCount(c => Math.min(10, c + 1))} className="w-5 h-5 rounded bg-white/8 text-white flex items-center justify-center">+</button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/8 text-xs text-gray-400">
              Live room: <span className="text-white">{roomId}</span>
            </span>
            <button onClick={() => setShowAiPanel(!showAiPanel)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showAiPanel ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-gray-400 hover:text-white border border-white/8'}`}>
              <Brain className="w-3.5 h-3.5" />
              AI Draw
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-gray-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* AI panel */}
        {showAiPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-4 py-3 bg-violet-500/5 border-b border-violet-500/15 flex items-center gap-3 flex-shrink-0"
          >
            <Brain className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiDraw()}
              placeholder='Describe what to draw: "binary search tree with values 1-7" or "linked list with 5 nodes"'
              className="flex-1 bg-transparent border-0 text-sm text-gray-200 outline-none placeholder-gray-600"
            />
            <button onClick={handleAiDraw} disabled={aiLoading} className="btn btn-primary text-xs px-3 py-1.5 flex-shrink-0">
              {aiLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Play className="w-3.5 h-3.5" /> Generate</>}
            </button>
          </motion.div>
        )}

        {/* Canvas */}
        <div ref={containerRef} className="flex-1 overflow-hidden cursor-crosshair" style={{ background: '#0d0d14' }}>
          <div className="grid-bg w-full h-full absolute inset-0 opacity-30 pointer-events-none" />
          {typeof window !== 'undefined' && (
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              scaleX={zoom}
              scaleY={zoom}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ cursor: tool === 'select' ? 'default' : tool === 'eraser' ? 'cell' : 'crosshair' }}
            >
              <Layer>
                {/* Render shapes */}
                {shapes.map(shape => {
                  if (shape.type === 'rect') {
                    return (
                      <Group key={shape.id} draggable={tool === 'select'}>
                        <Rect
                          x={shape.x} y={shape.y}
                          width={Math.max(1, shape.width || 80)}
                          height={Math.max(1, shape.height || 50)}
                          fill={shape.fill || '#1e1e2d'}
                          stroke={shape.stroke || color}
                          strokeWidth={shape.strokeWidth || strokeWidth}
                          cornerRadius={6}
                        />
                        {shape.value && (
                          <Text
                            x={shape.x} y={shape.y + (shape.height || 50) / 2 - 8}
                            width={shape.width || 80}
                            text={shape.value}
                            fill="#ffffff"
                            fontSize={16}
                            fontFamily="JetBrains Mono"
                            align="center"
                            fontStyle="bold"
                          />
                        )}
                        {shape.indexLabel !== undefined && (
                          <Text
                            x={shape.x} y={shape.y + (shape.height || 50) + 4}
                            width={shape.width || 80}
                            text={`[${shape.indexLabel}]`}
                            fill="#6b7280"
                            fontSize={11}
                            align="center"
                          />
                        )}
                        {shape.label && (
                          <Text
                            x={shape.x - 80} y={shape.y + (shape.height || 50) / 2 - 8}
                            width={75}
                            text={shape.label}
                            fill="#9ca3af"
                            fontSize={11}
                            align="right"
                            fontStyle="bold"
                          />
                        )}
                      </Group>
                    );
                  }
                  if (shape.type === 'circle') {
                    return (
                      <Group key={shape.id} draggable={tool === 'select'}>
                        <CircleShape
                          x={shape.x} y={shape.y}
                          radius={Math.max(1, shape.r || 30)}
                          fill={shape.fill || '#1e1e2d'}
                          stroke={shape.stroke || color}
                          strokeWidth={shape.strokeWidth || strokeWidth}
                        />
                        {shape.value && (
                          <Text
                            x={shape.x - (shape.r || 30)}
                            y={shape.y - 10}
                            width={(shape.r || 30) * 2}
                            text={shape.value}
                            fill="#ffffff"
                            fontSize={16}
                            fontFamily="JetBrains Mono"
                            align="center"
                            fontStyle="bold"
                          />
                        )}
                      </Group>
                    );
                  }
                  if (shape.type === 'text') {
                    return (
                      <Text
                        key={shape.id}
                        x={shape.x} y={shape.y}
                        text={shape.text}
                        fill={shape.color || color}
                        fontSize={shape.fontSize || 16}
                        draggable={tool === 'select'}
                      />
                    );
                  }
                  return null;
                })}

                {/* Render lines/arrows */}
                {lines.map(line => {
                  if (line.isArrow) {
                    return (
                      <Arrow
                        key={line.id}
                        points={line.points}
                        stroke={line.color || color}
                        strokeWidth={line.strokeWidth || strokeWidth}
                        fill={line.color || color}
                        pointerLength={10}
                        pointerWidth={8}
                      />
                    );
                  }
                  return (
                    <Line
                      key={line.id}
                      points={line.points}
                      stroke={line.color || color}
                      strokeWidth={line.strokeWidth || strokeWidth}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation={line.strokeWidth > 10 ? 'destination-out' : 'source-over'}
                    />
                  );
                })}
              </Layer>
            </Stage>
          )}
        </div>
      </div>

      {/* Right panel - dry run visualizer */}
      <div className="w-56 bg-[#111118] border-l border-white/5 flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-white/5">
          <div className="text-xs font-semibold text-white mb-1">Dry Run Visualizer</div>
          <div className="text-xs text-gray-500">Step through algorithm</div>
        </div>
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          <select className="w-full text-xs" defaultValue="">
            <option value="">Select Algorithm</option>
            <option value="bfs">BFS Traversal</option>
            <option value="dfs">DFS Traversal</option>
            <option value="inorder">Inorder Traversal</option>
            <option value="preorder">Preorder Traversal</option>
            <option value="postorder">Postorder Traversal</option>
            <option value="bubble">Bubble Sort</option>
            <option value="binary_search">Binary Search</option>
          </select>
          <div className="flex gap-1">
            <button className="flex-1 btn btn-secondary text-xs py-1.5">⏮</button>
            <button className="flex-1 btn btn-primary text-xs py-1.5"><Play className="w-3 h-3" /></button>
            <button className="flex-1 btn btn-secondary text-xs py-1.5">⏭</button>
          </div>
          <div className="bg-white/4 rounded-lg p-2 text-xs text-gray-500 text-center">
            Load a template and select algorithm to start dry run
          </div>
        </div>
      </div>
    </div>
  );
}
