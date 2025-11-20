

import React from 'react';
import { ReconciliationHistoryEntry } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle, AlertTriangle, Circle } from 'lucide-react';

interface LraTableProps {
  data: ReconciliationHistoryEntry[];
}

const LraTable: React.FC<LraTableProps> = ({ data }) => {

  const getStatusBadge = (status: 'Terekonsiliasi' | 'Selisih' | 'Belum Dilakukan') => {
    switch (status) {
      case 'Terekonsiliasi':
        return <span className="flex items-center justify-center gap-2 px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-300"><CheckCircle size={14}/> Terekonsiliasi</span>;
      case 'Selisih':
        return <span className="flex items-center justify-center gap-2 px-3 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-300"><AlertTriangle size={14}/> Selisih</span>;
      case 'Belum Dilakukan':
        return <span className="flex items-center justify-center gap-2 px-3 py-1 text-xs font-bold rounded-full bg-gray-500/20 text-gray-300"><Circle size={14}/> Belum Dilakukan</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-400">
        <thead className="text-xs text-gray-300 uppercase bg-gray-800">
          <tr>
            <th scope="col" className="px-4 py-3">Bulan</th>
            <th scope="col" className="px-4 py-3 text-right">Saldo Akhir Buku</th>
            <th scope="col" className="px-4 py-3 text-right">Saldo Akhir BKP</th>
            <th scope="col" className="px-4 py-3 text-right">Selisih</th>
            <th scope="col" className="px-4 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50 align-top">
              <td className="px-4 py-4 font-medium text-white">{new Date(0, parseInt(item.month) - 1).toLocaleString('id-ID', { month: 'long' })}</td>
              <td className="px-4 py-4 text-right">{formatCurrency(item.saldoAkhirBuku)}</td>
              <td className="px-4 py-4 text-right">{formatCurrency(item.saldoAkhirBank)}</td>
              <td className={`px-4 py-4 text-right font-medium ${item.selisih !== 0 ? 'text-red-400' : ''}`}>{formatCurrency(item.selisih)}</td>
              <td className="px-4 py-4 text-center">{getStatusBadge(item.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LraTable;