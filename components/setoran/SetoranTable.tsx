

import React from 'react';
import { SetoranData } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Pencil, Trash2 } from 'lucide-react';

interface SetoranTableProps {
  data: SetoranData[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const SetoranTable: React.FC<SetoranTableProps> = ({ data, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-400">
        <thead className="text-xs text-gray-300 uppercase bg-gray-800">
          <tr>
            <th scope="col" className="px-4 py-3">Tanggal</th>
            <th scope="col" className="px-4 py-3">Kode Transaksi</th>
            <th scope="col" className="px-4 py-3">Nama Peminjam</th>
            <th scope="col" className="px-4 py-3 text-right">Jumlah Pinjaman</th>
            <th scope="col" className="px-4 py-3 text-right">Jumlah Setoran</th>
            <th scope="col" className="px-4 py-3 text-right">Bunga</th>
            <th scope="col" className="px-4 py-3 text-right">Pokok</th>
            <th scope="col" className="px-4 py-3">Uraian</th>
            <th scope="col" className="px-4 py-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50 align-top">
              <td className="px-4 py-4 whitespace-nowrap">{formatDate(item.tanggal)}</td>
              <td className="px-4 py-4">{item.kodeRekening}</td>
              <td className="px-4 py-4 font-medium text-white">{item.namaPeminjam}</td>
              <td className="px-4 py-4 text-right">{formatCurrency(item.jumlahPinjaman)}</td>
              <td className="px-4 py-4 text-right text-green-400 font-semibold">{formatCurrency(item.jumlahSetoran)}</td>
              <td className="px-4 py-4 text-right text-orange-400">{formatCurrency(item.bunga)}</td>
              <td className="px-4 py-4 text-right text-sky-400">{formatCurrency(item.pokok)}</td>
              <td className="px-4 py-4" style={{ wordBreak: 'break-word', minWidth: '200px', whiteSpace: 'normal' }}>{item.uraian}</td>
              <td className="px-4 py-4 text-center">
                 <div className="flex justify-center items-center gap-2">
                    <button onClick={() => onEdit(item.id)} className="text-sky-400 hover:text-sky-300 p-1 rounded-md hover:bg-sky-500/10 transition-colors" title="Edit">
                        <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-red-500/10 transition-colors" title="Hapus">
                        <Trash2 size={16} />
                    </button>
                 </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center py-8 text-gray-500">
                Tidak ada data setoran.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SetoranTable;