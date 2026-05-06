import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SensorChart = ({ data, dataKey, color, unit }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-surface-card)', 
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
            itemStyle={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}
            formatter={(value) => [`${value} ${unit}`, 'Valeur']}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3} 
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: 'var(--color-surface-card)' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;
