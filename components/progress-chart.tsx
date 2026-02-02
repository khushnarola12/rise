'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProgressChartProps {
  data: Array<{
    date: string;
    weight: number;
    bmi?: number;
    bodyFat?: number;
  }>;
  height?: number;
}

export function ProgressChart({ data, height = 200 }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Reverse for chronological order
  const sortedData = [...data].reverse();
  
  // Get min/max for scaling
  const weights = sortedData.map(d => d.weight);
  const minWeight = Math.min(...weights) - 2;
  const maxWeight = Math.max(...weights) + 2;
  const range = maxWeight - minWeight;

  // Calculate trend
  const firstWeight = sortedData[0]?.weight;
  const lastWeight = sortedData[sortedData.length - 1]?.weight;
  const weightChange = lastWeight - firstWeight;
  const isGain = weightChange > 0;

  // Create SVG path points
  const chartWidth = 300;
  const chartHeight = height - 40;
  const padding = 20;
  
  const points = sortedData.map((d, i) => {
    const x = padding + (i / (sortedData.length - 1 || 1)) * (chartWidth - padding * 2);
    const y = chartHeight - ((d.weight - minWeight) / range) * (chartHeight - padding);
    return `${x},${y}`;
  }).join(' ');

  const areaPath = sortedData.map((d, i) => {
    const x = padding + (i / (sortedData.length - 1 || 1)) * (chartWidth - padding * 2);
    const y = chartHeight - ((d.weight - minWeight) / range) * (chartHeight - padding);
    return `${x},${y}`;
  });
  
  const areaPoints = `${padding},${chartHeight} ${areaPath.join(' ')} ${chartWidth - padding},${chartHeight}`;

  return (
    <div className="w-full">
      {/* Summary Stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Latest Weight</p>
          <p className="text-2xl font-bold text-foreground">{lastWeight} kg</p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
          isGain ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
        }`}>
          {isGain ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(weightChange).toFixed(1)} kg
        </div>
      </div>

      {/* Chart */}
      <div className="relative bg-muted/30 rounded-lg p-4">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} 
          className="w-full"
          style={{ height: `${height}px` }}
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1={padding}
              y1={chartHeight - (i / 4) * (chartHeight - padding)}
              x2={chartWidth - padding}
              y2={chartHeight - (i / 4) * (chartHeight - padding)}
              stroke="currentColor"
              strokeOpacity={0.1}
            />
          ))}

          {/* Area gradient */}
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <polygon
            points={areaPoints}
            fill="url(#progressGradient)"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {sortedData.map((d, i) => {
            const x = padding + (i / (sortedData.length - 1 || 1)) * (chartWidth - padding * 2);
            const y = chartHeight - ((d.weight - minWeight) / range) * (chartHeight - padding);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={4}
                fill="hsl(var(--background))"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
            );
          })}

          {/* Y-axis labels */}
          <text x={5} y={20} fontSize="10" fill="currentColor" opacity={0.5}>
            {maxWeight.toFixed(0)}
          </text>
          <text x={5} y={chartHeight} fontSize="10" fill="currentColor" opacity={0.5}>
            {minWeight.toFixed(0)}
          </text>
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{sortedData[0]?.date}</span>
          <span>{sortedData[sortedData.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
}

// Simple stat card with trend
interface TrendStatProps {
  title: string;
  value: string | number;
  previousValue?: number;
  currentValue?: number;
  unit?: string;
  positive?: 'up' | 'down';
}

export function TrendStat({ title, value, previousValue, currentValue, unit = '', positive = 'down' }: TrendStatProps) {
  const change = previousValue && currentValue ? currentValue - previousValue : null;
  const isPositive = change !== null && (positive === 'up' ? change > 0 : change < 0);

  return (
    <div className="p-4 bg-muted/30 rounded-lg">
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{value}{unit}</span>
        {change !== null && (
          <span className={`text-sm font-medium flex items-center gap-0.5 ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}{unit}
          </span>
        )}
      </div>
    </div>
  );
}
