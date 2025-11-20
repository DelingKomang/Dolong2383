import React, { useMemo, useState, useEffect } from 'react';
import type { PeminjamData, SetoranData, RekapData, ManualPayment } from '../types';
import RekapPeminjamTable from '../components/rekap/RekapPeminjamTable';
import MissedMonthsModal from '../components/rekap/MissedMonthsModal';
import PaidMonthsModal from '../components/rekap/PaidMonthsModal';
import { BookUser, Download } from 'lucide-react';
import { exportToExcel } from '../utils/fileHandlers';
import Notification from '../components/shared/Notification';

interface RekapPeminjamProps {
  peminjamData: PeminjamData[];
  setoranData: SetoranData[];
  manualPayments: ManualPayment[];
}

const indonesianMonthsMap: { [key: string]: number } = {
    'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
    'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
};

/**
 * Parses the paid month(s) from a setoran's description ('uraian').
 * Falls back to the transaction date if the description isn't in the expected format.
 * @param setoran The setoran data object.
 * @returns An array of month indices (0-11) that were paid.
 */
const getPaidMonthIndices = (setoran: SetoranData): number[] => {
    const uraian = (setoran.uraian || '').toLowerCase();
    const prefix = "setoran bulan ";
    
    if (uraian.includes(prefix)) {
        const monthsString = uraian.substring(uraian.indexOf(prefix) + prefix.length);
        const monthNames = monthsString.split(',').map(m => m.trim().replace('[auto]','').trim());
        const indices = monthNames.flatMap(name => (indonesianMonthsMap[name] !== undefined ? [indonesianMonthsMap[name]] : []));
        
        if (indices.length > 0) {
            return indices;
        }
    }
    
    // Fallback for old data or different uraian format
    return [new Date(`${setoran.tanggal}T00:00:00`).getMonth()];
};


const RekapPeminjam: React.FC<RekapPeminjamProps> = ({ peminjamData, setoranData, manualPayments }) => {
  const [selectedPeminjamForMissed, setSelectedPeminjamForMissed] = useState<RekapData | null>(null);
  const [isMissedModalOpen, setIsMissedModalOpen] = useState(false);
  const [selectedPeminjamForPaid, setSelectedPeminjamForPaid] = useState<RekapData | null>(null);
  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const uniqueYears = useMemo(() => {
    const years = new Set<string>();
    peminjamData.forEach(p => years.add(new Date(`${p.tanggal}T00:00:00`).getFullYear().toString()));
    setoranData.forEach(s => years.add(new Date(`${s.tanggal}T00:00:00`).getFullYear().toString()));
    if (years.size === 0) {
        return [new Date().getFullYear().toString()];
    }
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [peminjamData, setoranData]);

  const [selectedYear, setSelectedYear] = useState<string>(uniqueYears[0]);

  useEffect(() => {
    if (!uniqueYears.includes(selectedYear)) {
      setSelectedYear(uniqueYears[0] || new Date().getFullYear().toString());
    }
  }, [uniqueYears, selectedYear]);

  const rekapData = useMemo((): RekapData[] => {
    const yearToAnalyze = parseInt(selectedYear);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-11

    return peminjamData.map(peminjam => {
      // Lifetime totals for financial aggregation (from formal Setoran records only)
      const financialSetorans = setoranData.filter(s => s.peminjamId === peminjam.id);
      const totalSetoran = financialSetorans.reduce((acc, s) => acc + s.jumlahSetoran, 0);
      const totalBunga = financialSetorans.reduce((acc, s) => acc + s.bunga, 0);
      const totalPokok = financialSetorans.reduce((acc, s) => acc + s.pokok, 0);
      const sisaHutang = peminjam.jumlahPinjaman - totalPokok;
      
      // Year-specific calculations for paid/unpaid months (includes both formal and manual payments)
      const setoranForYear = setoranData.filter(
          s => s.peminjamId === peminjam.id && new Date(`${s.tanggal}T00:00:00`).getFullYear() === yearToAnalyze
      );
      const manualPaymentsForYear = manualPayments.filter(
          mp => mp.peminjamId === peminjam.id && mp.year === yearToAnalyze
      );
      
      const paidMonthsSet = new Set<number>();
      
      // Add months from formal setoran records
      setoranForYear.forEach(s => {
          const indices = getPaidMonthIndices(s);
          indices.forEach(index => paidMonthsSet.add(index));
      });
      
      // Add months from manual payment records
      manualPaymentsForYear.forEach(mp => {
          paidMonthsSet.add(mp.month);
      });

      const jumlahTransaksi = paidMonthsSet.size;

      // --- Calculate missed months for the selected year ---
      const loanStartDate = new Date(`${peminjam.tanggal}T00:00:00`);
      const loanStartYear = loanStartDate.getFullYear();
      const loanStartMonth = loanStartDate.getMonth();
      
      const missedMonths: string[] = [];
      let jumlahTidakBayar = 0;

      if (loanStartYear <= yearToAnalyze && peminjam.status === 'Belum Lunas') {
          // If the loan was taken in the year being analyzed, start checking from the *next* month.
          // Otherwise (loan from a previous year), check from January.
          const startMonthToCheck = (loanStartYear < yearToAnalyze) ? 0 : loanStartMonth + 1;
          const endMonth = (yearToAnalyze === currentYear) ? currentMonth : 11;
          
          for (let month = startMonthToCheck; month <= endMonth; month++) {
              if (!paidMonthsSet.has(month)) {
                  const monthName = new Date(yearToAnalyze, month).toLocaleString('id-ID', { month: 'long' });
                  missedMonths.push(monthName);
              }
          }
          jumlahTidakBayar = missedMonths.length;
      }
      
      const paidMonths = Array.from(paidMonthsSet)
        .sort((a, b) => a - b)
        .map(monthIndex => new Date(yearToAnalyze, monthIndex).toLocaleString('id-ID', { month: 'long' }));

      return {
        peminjamId: peminjam.id,
        namaPeminjam: peminjam.nama,
        totalSetoran,
        totalBunga,
        totalPokok,
        sisaHutang,
        jumlahTransaksi,
        jumlahTidakBayar,
        missedMonths,
        paidMonths,
      };
    });
  }, [peminjamData, setoranData, manualPayments, selectedYear]);
  
  const handleShowMissedMonths = (rekap: RekapData) => {
    if (rekap.jumlahTidakBayar > 0) {
      setSelectedPeminjamForMissed(rekap);
      setIsMissedModalOpen(true);
    }
  };
  
  const handleShowPaidMonths = (rekap: RekapData) => {
    if (rekap.jumlahTransaksi > 0) {
        setSelectedPeminjamForPaid(rekap);
        setIsPaidModalOpen(true);
    }
  };
  
  const handleExportExcel = () => {
    if (rekapData.length === 0) return;
    
    const dataToExport = rekapData.map(item => ({
        'Nama Peminjam': item.namaPeminjam,
        'Jumlah Pokok': item.totalPokok,
        'Sisa Hutang': item.sisaHutang,
        'Jumlah Setoran': item.totalSetoran,
        'Jumlah Bunga': item.totalBunga,
        'Jumlah Transaksi (Bulan Dibayar)': item.jumlahTransaksi,
        'Bulan Tidak Bayar': item.jumlahTidakBayar,
    }));
    
    const fileName = `Rekapitulasi_Peminjam_${selectedYear}`;
    exportToExcel(dataToExport, fileName, `Rekap ${selectedYear}`);
    setShowExportSuccess(true);
  };

  return (
    <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-800 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <BookUser className="h-8 w-8 text-teal-400" />
          <h2 className="text-xl font-semibold text-white">Rekapitulasi Peminjam</h2>
        </div>
         <div className="flex items-center gap-2">
           <label htmlFor="year-filter-rekap" className="text-sm text-gray-400">Tahun:</label>
           <select 
                id="year-filter-rekap"
                value={selectedYear} 
                onChange={e => setSelectedYear(e.target.value)} 
                className="bg-gray-800 border border-gray-700 rounded-md py-1 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
                {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
           </select>
            <button
              onClick={handleExportExcel}
              disabled={rekapData.length === 0}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1.5 px-3 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              <span>Excel</span>
            </button>
        </div>
      </div>
      <p className="text-gray-400">Ringkasan aktivitas setoran untuk setiap peminjam selama tahun {selectedYear}.</p>
      
      <RekapPeminjamTable 
        data={rekapData} 
        onShowMissedMonths={handleShowMissedMonths}
        onShowPaidMonths={handleShowPaidMonths} 
      />
      
      <MissedMonthsModal
        isOpen={isMissedModalOpen}
        onClose={() => setIsMissedModalOpen(false)}
        rekapData={selectedPeminjamForMissed}
      />

      <PaidMonthsModal
        isOpen={isPaidModalOpen}
        onClose={() => setIsPaidModalOpen(false)}
        rekapData={selectedPeminjamForPaid}
      />
      <Notification
        message="Data rekapitulasi berhasil di-export!"
        show={showExportSuccess}
        onClose={() => setShowExportSuccess(false)}
      />
    </div>
  );
};

export default RekapPeminjam;