
import React from 'react';
import type { BreakdownData } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface BreakdownTableProps {
    title: string;
    data: BreakdownData[];
    icon: React.ElementType;
    header1: string;
    header2: string;
    colorClass: string;
}

const BreakdownTable: React.FC<BreakdownTableProps> = ({ title, data, icon: Icon, header1, header2, colorClass }) => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-800 h-full">
        <div className="flex items-center gap-3 mb-4">
            <Icon className={`h-6 w-6 ${colorClass}`} />
            <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="overflow-auto max-h-96">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-800 sticky top-0">
                    <tr>
                        <th scope="col" className="px-4 py-3">{header1}</th>
                        <th scope="col" className="px-4 py-3 text-right">{header2}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="px-4 py-3 text-white">{item.category}</td>
                            <td className={`px-4 py-3 text-right font-medium ${colorClass}`}>{formatCurrency(item.total)}</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                         <tr>
                            <td colSpan={2} className="text-center py-8 text-gray-500">
                                Tidak ada data untuk ditampilkan.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default BreakdownTable;