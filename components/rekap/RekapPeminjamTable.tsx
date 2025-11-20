
import React from 'react';
import { RekapData } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface RekapPeminjamTableProps {
  data: RekapData[];
  onShowMissedMonths: (rekap: RekapData) => void;
  onShowPaidMonths: (rekap: RekapData) => void;
}

const RekapPeminjamTable: React.FC<RekapPeminjamTableProps> = ({ data, onShowMissedMonths, onShowPaidMonths }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-400">
        <thead className="text-xs text-gray-300 uppercase bg-gray-800">
          <tr>
            <th scope="col" className="px-4 py-3">Nama Peminjam</th>
            <th scope="col" className="px-4 py-3 text-right">Jumlah Pokok</th>
            <th scope="col" className="px-4 py-3 text-right">Sisa Hutang</th>
            <th scope="col" className="px-4 py-3 text-right">Jumlah Setoran</th>
            <th scope="col" className="px-4 py-3 text-right">Jumlah Bunga</th>
            <th scope="col" className="px-4 py-3 text-center">Jumlah Transaksi</th>
            <th scope="col" className="px-4 py-3 text-center">Bulan Tidak Bayar</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.peminjamId} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50 align-top">
              <td className="px-4 py-4 font-medium text-white">{item.namaPeminjam}</td>
              <td className="px-4 py-4 text-right text-sky-400">{formatCurrency(item.totalPokok)}</td>
              <td className="px-4 py-4 text-right text-yellow-400 font-bold">{formatCurrency(item.sisaHutang)}</td>
              <td className="px-4 py-4 text-right text-green-400 font-semibold">{formatCurrency(item.totalSetoran)}</td>
              <td className="px-4 py-4 text-right text-orange-400">{formatCurrency(item.totalBunga)}</td>
              <td className="px-4 py-4 text-center">
                 {item.jumlahTransaksi > 0 ? (
                  <button
                    onClick={() => onShowPaidMonths(item)}
                    className="font-medium text-teal-400 hover:text-teal-300 hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    {item.jumlahTransaksi} kali
                  </button>
                ) : (
                  <span className="text-gray-400">0 kali</span>
                )}
              </td>
              <td className="px-4 py-4 text-center">
                {item.jumlahTidakBayar > 0 ? (
                  <button
                    onClick={() => onShowMissedMonths(item)}
                    className="font-bold text-red-400 hover:text-red-300 hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    {item.jumlahTidakBayar} bulan
                  </button>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                Tidak ada data rekapitulasi.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RekapPeminjamTable;
