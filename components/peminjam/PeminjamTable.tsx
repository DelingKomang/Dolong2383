

import React from 'react';
import { PeminjamData } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Pencil, Trash2 } from 'lucide-react';

interface PeminjamTableProps {
  data: PeminjamData[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PeminjamTable: React.FC<PeminjamTableProps> = ({ data, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-400">
        <thead className="text-xs text-gray-300 uppercase bg-gray-800">
          <tr>
            <th scope="col" className="px-4 py-3">Tanggal</th>
            <th scope="col" className="px-4 py-3">Kode Transaksi</th>
            <th scope="col" className="px-4 py-3">Nama Peminjam</th>
            <th scope="col" className="px-4 py-3 text-right">Jumlah Pinjaman</th>
            <th scope="col" className="px-4 py-3 text-right">Bunga</th>
            <th scope="col" className="px-4 py-3 text-center">Status</th>
            <th scope="col" className="px-4 py-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50 align-top">
              <td className="px-4 py-4 whitespace-nowrap">{formatDate(item.tanggal)}</td>
              <td className="px-4 py-4">{item.kodeRekening}</td>
              <td className="px-4 py-4 font-medium text-white" style={{ wordBreak: 'break-word', minWidth: '200px', whiteSpace: 'normal' }}>{item.nama}</td>
              <td className="px-4 py-4 text-right text-yellow-400">{formatCurrency(item.jumlahPinjaman)}</td>
              <td className="px-4 py-4 text-right text-orange-400">{formatCurrency(item.bunga)}</td>
              <td className="px-4 py-4 text-center">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full w-24 text-center inline-block ${
                    item.status === 'Lunas'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}
                >
                  {item.status}
                </span>
              </td>
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
              <td colSpan={7} className="text-center py-8 text-gray-500">
                Tidak ada data peminjam.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PeminjamTable;