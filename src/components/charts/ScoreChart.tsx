'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { formatScore, getScoreColorRaw } from '@/lib/utils';

interface ScoreChartProps {
  data: Array<{
    name: string;
    score: number;
    category?: string;
    change?: number;
  }>;
  type?: 'bar' | 'line' | 'pie';
  height?: number;
  showChange?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export function ScoreChart({ data, type = 'bar', height = 300, showChange = false }: ScoreChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Score: {formatScore(payload[0].value)}
          </p>
          {showChange && data.change !== undefined && (
            <p className={`text-sm ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Change: {data.change > 0 ? '+' : ''}{formatScore(data.change)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${formatScore(value)}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="score"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [formatScore(Number(value)), 'Score']} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Default: bar chart
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          stroke="#666"
          fontSize={12}
        />
        <YAxis 
          stroke="#666"
          fontSize={12}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="score" 
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}