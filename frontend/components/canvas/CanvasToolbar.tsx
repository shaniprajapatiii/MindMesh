'use client';
import { Pencil, Square, Circle, ArrowRight, Minus, Type, Eraser, Move, Trash2, Undo2, Redo2, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Tooltip } from '@/components/ui';
import { cn } from '@/lib/utils';

export type CanvasTool = 'select' | 'pen' | 'rect' | 'circle' | 'arrow' | 'line' | 'text' | 'eraser';

const TOOLS: { id: CanvasTool; icon: typeof Pencil; label: string }[] = [
  { id: 'select', icon: Move, label: 'Select / Move' },
  { id: 'pen', icon: Pencil, label: 'Free Draw' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
];

export const CANVAS_COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#ffffff','#94a3b8','#374151'];

interface CanvasToolbarProps {
  tool: CanvasTool;
  color: string;
  strokeWidth: number;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onToolChange: (t: CanvasTool) => void;
  onColorChange: (c: string) => void;
  onStrokeWidthChange: (w: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function CanvasToolbar({ tool, color, strokeWidth, canUndo, canRedo, zoom, onToolChange, onColorChange, onStrokeWidthChange, onUndo, onRedo, onClear, onExport, onZoomIn, onZoomOut }: CanvasToolbarProps) {
  return (
    <div className="w-14 bg-[#111118] border-r border-white/5 flex flex-col items-center py-3 gap-1 flex-shrink-0">
      {TOOLS.map(t => (
        <Tooltip key={t.id} text={t.label}>
          <button onClick={() => onToolChange(t.id)}
            className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              tool === t.id ? 'bg-indigo-500/20 text-indigo-300 shadow-glow-sm' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5')}>
            <t.icon className="w-4 h-4" />
          </button>
        </Tooltip>
      ))}
      <div className="flex-1" />
      <Tooltip text="Undo"><button onClick={onUndo} disabled={!canUndo} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-30"><Undo2 className="w-4 h-4" /></button></Tooltip>
      <Tooltip text="Redo"><button onClick={onRedo} disabled={!canRedo} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-30"><Redo2 className="w-4 h-4" /></button></Tooltip>
      <Tooltip text="Clear All"><button onClick={onClear} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-white/5"><Trash2 className="w-4 h-4" /></button></Tooltip>
      <Tooltip text="Export PNG"><button onClick={onExport} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:bg-white/5"><Download className="w-4 h-4" /></button></Tooltip>
      <Tooltip text="Zoom In"><button onClick={onZoomIn} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5"><ZoomIn className="w-4 h-4" /></button></Tooltip>
      <Tooltip text="Zoom Out"><button onClick={onZoomOut} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5"><ZoomOut className="w-4 h-4" /></button></Tooltip>
    </div>
  );
}
