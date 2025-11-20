import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { MonthlyData } from '../../types';

interface MonthlyLineChartProps {
  data: MonthlyData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const format = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    const surplusDefisit = payload[0].value;
    const color = surplusDefisit >= 0 ? 'text-green-400' : 'text-red-400';
    return (
      <div className="p-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
        <p className="label text-white font-bold">{`${label}`}</p>
        <p className={color}>{`Surplus/Defisit : ${format(surplusDefisit)}`}</p>
      </div>
    );
  }
  return null;
};


const MonthlyLineChart: React.FC<MonthlyLineChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      surplusDefisit: item.penerimaan - item.realisasi,
    }));
  }, [data]);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: 30,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="name" stroke="#A0AEC0" fontSize={12} />
          <YAxis 
            stroke="#A0AEC0" 
            fontSize={12} 
            tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(value as number)}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#A0AEC0', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{fontSize: "14px"}} />
          <ReferenceLine y={0} stroke="#A0AEC0" strokeDasharray="2 2" />
          <Line 
            type="monotone" 
            dataKey="surplusDefisit" 
            name="Surplus / Defisit" 
            stroke="#4299E1" 
            strokeWidth={2} 
            dot={{ r: 4, fill: '#4299E1' }}
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyLineChart;
