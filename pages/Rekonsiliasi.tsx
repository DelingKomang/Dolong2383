
import React, { useState, useMemo } from 'react';
import type { BkuData, BkpData, ReconciliationHistoryEntry, PeminjamData } from '../types';
import { formatCurrency, numberToWords } from '../../utils/formatters';
import { Repeat, CheckCircle, AlertCircle, BookOpen, BookCopy, Save } from 'lucide-react';
import Notification from '../components/shared/Notification';

interface RekonsiliasiProps {
  bkuData: BkuData[];
  bkpData: BkpData[];
  peminjamData: PeminjamData[];
  onSaveReconciliation: (entry: Omit<ReconciliationHistoryEntry, 'id'>) => void;
}

const Rekonsiliasi: React.FC<RekonsiliasiProps> = ({ bkuData, bkpData, peminjamData, onSaveReconciliation }) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [cashOnHand, setCashOnHand] = useState<number | string>('');
  const [cashInBank, setCashInBank] = useState<number | string>('');

  const { saldoAkhirBku, saldoAkhirBkp, selisih } = useMemo(() => {
    const periodStartDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1);
    
    // --- BKU Calculation ---
    const bkuBeforePeriod = bkuData.filter(d => new Date(d.tanggal) < periodStartDate);
    const saldoAwalBku = bkuBeforePeriod.length > 0 ? bkuBeforePeriod[0].saldo : 0;
    
    const bkuInPeriod = bkuData.filter(d => {
        const date = new Date(d.tanggal);
        return date.getFullYear().toString() === selectedYear && (date.getMonth() + 1).toString() === selectedMonth;
    });
    const totalPenerimaanBku = bkuInPeriod.reduce((acc, item) => acc + item.penerimaan, 0);
    const totalPengeluaranBku = bkuInPeriod.reduce((acc, item) => acc + item.pengeluaran, 0);
    
    // --- BKP Calculation ---
    const bkpBeforePeriod = bkpData.filter(d => new Date(d.tanggal) < periodStartDate);
    const saldoAwalBkp = bkpBeforePeriod.length > 0 ? bkpBeforePeriod[0].saldo : 0;

    const bkpInPeriod = bkpData.filter(d => {
        const date = new Date(d.tanggal);
        return date.getFullYear().toString() === selectedYear && (date.getMonth() + 1).toString() === selectedMonth;
    });
    
    const totalPenerimaanBkp = bkpInPeriod.reduce((acc, item) => acc + item.debet, 0);
    const totalPengeluaranBkp = bkpInPeriod.reduce((acc, item) => acc + item.kredit, 0);
    
    // FIX: Correctly calculate Saldo Akhir BKU using its own Pengeluaran, not BKP's.
    const saldoAkhirBku = saldoAwalBku + totalPenerimaanBku - totalPengeluaranBku;
    const saldoAkhirBkp = saldoAwalBkp + totalPenerimaanBkp - totalPengeluaranBkp;
    
    const selisih = saldoAkhirBku - saldoAkhirBkp;
    
    return { saldoAkhirBku, saldoAkhirBkp, selisih };
  }, [bkuData, bkpData, selectedMonth, selectedYear]);
  
  const { cashTotal, totalPinjaman, totalCashKeseluruhan, suggestedCashOnHand, selisihKasFisik } = useMemo(() => {
    const hand = Number(cashOnHand) || 0;
    const bank = Number(cashInBank) || 0;
    const cashTotal = hand + bank;

    const totalPinjaman = peminjamData.reduce((acc, item) => 
        item.status === 'Belum Lunas' ? acc + item.jumlahPinjaman : acc, 
    0);

    const totalCashKeseluruhan = cashTotal + totalPinjaman;
    
    const suggestedCashOnHand = saldoAkhirBku - bank;
    const selisihKasFisik = cashTotal - saldoAkhirBku;

    return { cashTotal, totalPinjaman, totalCashKeseluruhan, suggestedCashOnHand, selisihKasFisik };
  }, [cashOnHand, cashInBank, peminjamData, saldoAkhirBku]);
  
  const isMismatch = cashTotal !== saldoAkhirBku && (cashOnHand !== '' || cashInBank !== '');
  const isMatch = cashTotal === saldoAkhirBku && (cashOnHand !== '' || cashInBank !== '');


  const handleSave = () => {
    // Fix: Explicitly type the 'status' variable to ensure it matches the union type in ReconciliationHistoryEntry.
    // This prevents TypeScript from widening the type to a generic 'string'.
    const status: 'Terekonsiliasi' | 'Selisih' = selisih === 0 ? 'Terekonsiliasi' : 'Selisih';
    const entry = {
      year: selectedYear,
      month: selectedMonth.toString().padStart(2, '0'),
      saldoAkhirBuku: saldoAkhirBku,
      saldoAkhirBank: saldoAkhirBkp, // Map BKP to Bank for LRA
      selisih: selisih,
      status: status,
    };
    onSaveReconciliation(entry);
    setShowSuccessNotification(true);
  };


  return (
    <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-800 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Repeat className="h-8 w-8 text-teal-400" />
          <h2 className="text-xl font-semibold text-white">Rekonsiliasi Buku Kas</h2>
        </div>
         <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
             <label htmlFor="month-filter" className="text-sm text-gray-400">Bulan:</label>
             <select 
                  id="month-filter"
                  value={selectedMonth} 
                  onChange={e => setSelectedMonth(e.target.value)} 
                  className="bg-gray-800 border border-gray-700 rounded-md py-1 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                  {Array.from({length: 12}, (_, i) => {
                      const monthVal = (i+1).toString();
                      return <option key={monthVal} value={monthVal}>{new Date(0, i).toLocaleString('id-ID', {month: 'long'})}</option>
                  })}
             </select>
           </div>
           <div className="flex items-center gap-2">
             <label htmlFor="year-filter" className="text-sm text-gray-400">Tahun:</label>
             <select 
                  id="year-filter"
                  value={selectedYear} 
                  onChange={e => setSelectedYear(e.target.value)} 
                  className="bg-gray-800 border border-gray-700 rounded-md py-1 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                 {[...new Set([new Date().getFullYear().toString(), ...bkuData.map(d => new Date(d.tanggal).getFullYear().toString())])].sort((a,b)=> Number(b)-Number(a)).map(year => <option key={year} value={year}>{year}</option>)}
             </select>
           </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* BKU Side */}
         <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg space-y-4">
            <div className="flex items-center gap-3 text-lg font-semibold text-white">
                <BookOpen className="text-sky-400" />
                <h3>Menurut Buku Kas Umum</h3>
            </div>
            <p className="text-sm text-gray-400">Saldo Awal BKU + Penerimaan BKU - Pengeluaran BKU</p>
            <div className="text-center bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-gray-300">Saldo Akhir Menurut BKU</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(saldoAkhirBku)}</p>
            </div>
         </div>

         {/* BKP Side */}
         <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg space-y-4">
            <div className="flex items-center gap-3 text-lg font-semibold text-white">
                <BookCopy className="text-indigo-400" />
                <h3>Menurut Buku Kas Pembantu</h3>
            </div>
            <p className="text-sm text-gray-400">Saldo Awal BKP + Penerimaan BKP - Pengeluaran BKP</p>
            <div className="text-center bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-gray-300">Saldo Akhir Menurut BKP</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(saldoAkhirBkp)}</p>
            </div>
         </div>
      </div>

       {/* Result */}
       <div className={`p-6 rounded-lg flex flex-col justify-center items-center text-center transition-colors duration-300 ${selisih === 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            {selisih !== 0 ? (
                 <>
                    <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-1">Terdapat Selisih</h3>
                    <p className="text-gray-300">Perbedaan antara BKU dan BKP sebesar <span className="font-bold text-red-400">{formatCurrency(selisih)}</span>.</p>
                 </>
            ) : (
                <>
                    <CheckCircle className="h-12 w-12 text-green-400 mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-1">Terekonsiliasi</h3>
                     <p className="text-gray-300">Saldo akhir antara BKU dan BKP sudah sesuai.</p>
                </>
            )}
       </div>
       
      <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-white">Rekonsiliasi Kas Fisik vs. Buku</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <tbody>
              <tr className="border-b border-gray-700/50">
                <td className="px-4 py-3 font-medium text-amber-300 italic">COHand must be</td>
                <td className="px-4 py-3 text-right font-semibold text-amber-300">{formatCurrency(suggestedCashOnHand)}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="px-4 py-3 font-medium text-white">Cash on hand</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-4">
                      <span className="text-xs italic text-gray-400 capitalize min-w-[250px] text-left">
                          {cashOnHand ? `${numberToWords(Number(cashOnHand))} Rupiah` : ''}
                      </span>
                      <input
                          type="number"
                          value={cashOnHand}
                          onChange={(e) => setCashOnHand(e.target.value)}
                          placeholder="Masukkan jumlah"
                          className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-right w-48 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="px-4 py-3 font-medium text-white">Cash di LPD/Bank</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-4">
                      <span className="text-xs italic text-gray-400 capitalize min-w-[250px] text-left">
                          {cashInBank ? `${numberToWords(Number(cashInBank))} Rupiah` : ''}
                      </span>
                      <input
                          type="number"
                          value={cashInBank}
                          onChange={(e) => setCashInBank(e.target.value)}
                          placeholder="Masukkan jumlah"
                          className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-right w-48 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-700 bg-gray-900/50">
                <td className="px-4 py-3 font-bold text-lg text-white">Cash Total</td>
                <td className="px-4 py-3 text-right font-bold text-lg text-teal-400">{formatCurrency(cashTotal)}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="px-4 py-3 font-medium text-white">Total cash di pinjam</td>
                <td className="px-4 py-3 text-right font-semibold text-yellow-400">{formatCurrency(totalPinjaman)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-white">Total Cash Keseluruhan</td>
                <td className="px-4 py-3 text-right font-semibold text-sky-400">{formatCurrency(totalCashKeseluruhan)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {isMatch && (
        <div className="p-4 rounded-lg flex items-center gap-3 text-green-300 bg-green-500/10 border border-green-500/20">
          <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Sesuai: Saldo Cocok</h4>
            <p className="text-sm">Cash Total ({formatCurrency(cashTotal)}) sama dengan Saldo Akhir Menurut BKU ({formatCurrency(saldoAkhirBku)}).</p>
          </div>
        </div>
      )}
       {isMismatch && (
        <div className="p-4 rounded-lg flex items-center gap-3 text-yellow-300 bg-yellow-500/10 border border-yellow-500/20">
          <AlertCircle className="h-6 w-6 text-yellow-400 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Peringatan: Ada Perbedaan Saldo</h4>
            <p className="text-sm">Cash Total ({formatCurrency(cashTotal)}) tidak sama dengan Saldo Akhir BKU ({formatCurrency(saldoAkhirBku)}). Selisih sebesar <span className="font-bold">{formatCurrency(selisihKasFisik)}</span>.</p>
          </div>
        </div>
      )}

       <div className="text-center pt-2">
            <button
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-teal-500/40"
            >
                <Save size={20} />
                <span>Simpan Hasil Rekonsiliasi</span>
            </button>
        </div>

        <Notification
            message="Hasil rekonsiliasi berhasil disimpan ke LRA!"
            show={showSuccessNotification}
            onClose={() => setShowSuccessNotification(false)}
        />
    </div>
  );
};

export default Rekonsiliasi;
