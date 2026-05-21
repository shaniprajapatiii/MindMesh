'use client';
import { useMemo } from 'react';

interface HeatmapProps {
  data: Record<string, number>;
  weeks?: number;
}

const LEVELS = [
  'rgba(255,255,255,0.04)',
  'rgba(99,102,241,0.25)',
  'rgba(99,102,241,0.45)',
  'rgba(99,102,241,0.65)',
  'rgba(99,102,241,0.9)',
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export function ActivityHeatmap({ data, weeks = 26 }: HeatmapProps) {
  const cells = useMemo(() => {
    const today = new Date();
    const grid: Array<Array<{ date: string; count: number; level: number }>> = [];
    for (let w = weeks - 1; w >= 0; w--) {
      const week: typeof grid[0] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (w * 7 + (6 - d)));
        const dateStr = date.toISOString().split('T')[0];
        const count = data[dateStr] || 0;
        const level = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 7 ? 3 : 4;
        week.push({ date: dateStr, count, level });
      }
      grid.push(week);
    }
    return grid;
  }, [data, weeks]);

  const totalSolved = Object.values(data).reduce((a, b) => a + b, 0);
  const maxInDay = Math.max(...Object.values(data), 1);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    cells.forEach((week, wi) => {
      const month = new Date(week[6]?.date || '').getMonth();
      if (month !== lastMonth) { labels.push({ label: MONTHS[month], col: wi }); lastMonth = month; }
    });
    return labels;
  }, [cells]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{totalSolved} contributions in the last year</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {LEVELS.map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />)}
          <span>More</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="relative" style={{ minWidth: cells.length * 14 + 30 }}>
          {/* Month labels */}
          <div className="flex gap-0 mb-1 pl-7">
            {monthLabels.map(({ label, col }) => (
              <span key={`${label}-${col}`} className="text-[10px] text-gray-600 absolute" style={{ left: col * 14 + 28 }}>
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-0 mt-4">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1.5">
              {DAYS.map((d, i) => (
                <span key={d} className="text-[9px] text-gray-700 h-2.5 leading-none flex items-center" style={{ display: i % 2 === 1 ? 'flex' : 'none' }}>
                  {d}
                </span>
              ))}
            </div>
            {/* Cells */}
            {cells.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className="w-2.5 h-2.5 rounded-sm transition-all hover:scale-125 cursor-pointer"
                    style={{ background: LEVELS[cell.level] }}
                    title={`${cell.date}: ${cell.count} problem${cell.count !== 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
