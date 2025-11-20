import React, { useState, useMemo } from 'react';
import type { ReconciliationHistoryEntry } from '../types';
import LraTable from '../components/lra/LraTable';
import { FileCheck2 } from 'lucide-react';

interface LaporanRekonsiliasiAkhirProps {
  history: ReconciliationHistoryEntry[];
}

const LaporanRekonsiliasiAkhir: React.FC<LaporanRekonsiliasiAkhirProps> = ({ history }) => {
  const uniqueYears = useMemo(() => 
    [...new Set(history.map(d => d.year))].sort((a,b) => Number(b) - Number(a)), 
  [history]);
  
  const [selectedYear, setSelectedYear] = useState<string>(uniqueYears[0] || new Date().getFullYear().toString());

  const yearData = useMemo(() => {
    const monthlyData: ReconciliationHistoryEntry[] = [];
    for (let i = 1; i <= 12; i++) {
        const monthStr = i.toString().padStart(2, '0');
        const id = `${selectedYear}-${monthStr}`;
        const existingEntry = history.find(h => h.id === id);
        if (existingEntry) {
            monthlyData.push(existingEntry);
        } else {
            monthlyData.push({
                id,
                year: selectedYear,
                month: monthStr,
                saldoAkhirBuku: 0,
                saldoAkhirBank: 0,
                selisih: 0,
                status: 'Belum Dilakukan'
            });
        }
    }
    return monthlyData;
  }, [history, selectedYear]);


  return (
    <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-800 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <FileCheck2 className="h-8 w-8 text-teal-400" />
          <h2 className="text-xl font-semibold text-white">Laporan Rekonsiliasi Akhir</h2>
        </div>
         <div className="flex items-center gap-2">
           <label htmlFor="year-filter" className="text-sm text-gray-400">Tahun:</label>
           <select 
                id="year-filter"
                value={selectedYear} 
                onChange={e => setSelectedYear(e.target.value)} 
                className="bg-gray-800 border border-gray-700 rounded-md py-1 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
                {uniqueYears.length > 0 ? (
                  uniqueYears.map(year => <option key={year} value={year}>{year}</option>)
                ) : (
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                )}
           </select>
        </div>
      </div>
      <p className="text-gray-400">Tinjauan status rekonsiliasi kas bulanan untuk tahun {selectedYear}.</p>
      
      <LraTable data={yearData} />
    </div>
  );
};

export default LaporanRekonsiliasiAkhir;