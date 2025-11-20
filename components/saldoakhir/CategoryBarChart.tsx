
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { BreakdownData } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CategoryBarChartProps {
    title: string;
    data: BreakdownData[];
    barColor: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
        <p className="label text-white font-bold">{`${payload[0].payload.category}`}</p>
        <p style={{ color: payload[0].fill }}>{`Total : ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};


const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ title, data, barColor }) => {
    return (
        <div className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-800 h-[350px] flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-white flex-shrink-0">{title}</h3>
            {data.length === 0 ? (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500">Tidak ada data untuk ditampilkan.</p>
                </div>
            ) : (
                <div className="flex-grow w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="category"
                                stroke="#A0AEC0"
                                fontSize={12}
                                width={120}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(113, 128, 150, 0.1)' }} />
                            <Bar dataKey="total" fill={barColor} radius={[0, 4, 4, 0]} barSize={25}>
                               <LabelList 
                                 dataKey="total" 
                                 position="right" 
                                 style={{ fill: 'white', fontSize: 12 }}
                                 formatter={(value: number) => formatCurrency(value)}
                               />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default CategoryBarChart;
