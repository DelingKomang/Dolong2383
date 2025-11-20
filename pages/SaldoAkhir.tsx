

import React, { useState, useMemo } from 'react';
import type { BkuData, MonthlyData, BreakdownData } from '../types';
import { formatCurrency } from '../utils/formatters';
import StatCard from '../components/dashboard/StatCard';
import MonthlyBarChart from '../components/dashboard/MonthlyBarChart';
import BreakdownTable from '../components/saldoakhir/BreakdownTable';
import CategoryBarChart from '../components/saldoakhir/CategoryBarChart';
import { ArrowDown, ArrowUp, Scale, Wallet, ChevronsRight, ChevronsLeft } from 'lucide-react';

interface SaldoAkhirProps {
  bkuData: BkuData[];
}

const SaldoAkhir: React.FC<SaldoAkhirProps> = ({ bkuData }) => {
  const uniqueYears = useMemo(() => 
    [...new Set(bkuData.map(d => new Date(d.tanggal).getFullYear().toString()))].sort((a,b) => Number(b) - Number(a)), 
  [bkuData]);
  
  const [selectedYear, setSelectedYear] = useState<string>(uniqueYears[0] || new Date().getFullYear().toString());

  const filteredData = useMemo(() => 
    bkuData.filter(d => new Date(d.tanggal).getFullYear().toString() === selectedYear), 
  [bkuData, selectedYear]);

  const summary = useMemo(() => {
    const totalPenerimaan = filteredData.reduce((acc, item) => acc + item.penerimaan, 0);
    const totalPengeluaran = filteredData.reduce((acc, item) => acc + item.pengeluaran, 0);
    const surplusDefisit = totalPenerimaan - totalPengeluaran;
    // FIX: Get saldo from the latest entry of the year (index 0) instead of the oldest.
    const saldoAkhir = filteredData.length > 0 ? filteredData[0].saldo : 0;

    return { totalPenerimaan, totalPengeluaran, surplusDefisit, saldoAkhir };
  }, [filteredData]);

  const monthlyChartData: MonthlyData[] = useMemo(() => {
    const monthly: { [key: number]: { penerimaan: number; realisasi: number } } = {};
    for(let i=0; i<12; i++) {
        const monthName = new Date(parseInt(selectedYear), i).toLocaleString('id-ID', { month: 'short'});
        monthly[i] = { penerimaan: 0, realisasi: 0 };
    }

    filteredData.forEach(item => {
      const monthIndex = new Date(item.tanggal).getMonth();
      monthly[monthIndex].penerimaan += item.penerimaan;
      monthly[monthIndex].realisasi += item.pengeluaran;
    });

    return Object.entries(monthly).map(([index, values]) => ({ 
        name: new Date(parseInt(selectedYear), parseInt(index)).toLocaleString('id-ID', { month: 'short'}), 
        ...values 
    }));
  }, [filteredData, selectedYear]);
  
  const penerimaanByCategory: BreakdownData[] = useMemo(() => {
      const categories: { [key: string]: number } = {};
      filteredData.forEach(item => {
          if (item.penerimaan > 0) {
              const category = item.kategori || 'Tanpa Kategori';
              categories[category] = (categories[category] || 0) + item.penerimaan;
          }
      });
      return Object.entries(categories).map(([category, total]) => ({ category, total })).sort((a,b) => b.total - a.total);
  }, [filteredData]);

  const pengeluaranByCategory: BreakdownData[] = useMemo(() => {
      const categories: { [key: string]: number } = {};
      filteredData.forEach(item => {
          if (item.pengeluaran > 0) {
              const category = item.kategori || 'Tanpa Kategori';
              categories[category] = (categories[category] || 0) + item.pengeluaran;
          }
      });
      return Object.entries(categories).map(([category, total]) => ({ category, total })).sort((a,b) => b.total - a.total);
  }, [filteredData]);

  const top5Penerimaan = useMemo(() =>
    penerimaanByCategory.slice(0, 5),
  [penerimaanByCategory]);

  const top5Pengeluaran = useMemo(() =>
    pengeluaranByCategory.slice(0, 5),
  [pengeluaranByCategory]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-semibold text-white">Laporan Saldo Akhir</h2>
        <div className="flex items-center gap-2">
           <label htmlFor="year-filter" className="text-sm text-gray-400">Tahun:</label>
           <select 
                id="year-filter"
                value={selectedYear} 
                onChange={e => setSelectedYear(e.target.value)} 
                className="bg-gray-800 border border-gray-700 rounded-md py-1 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
                {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
           </select>
        </div>
      </div>

       {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Penerimaan" value={formatCurrency(summary.totalPenerimaan)} icon={ArrowUp} iconBgColor="bg-green-500/20" iconColor="text-green-400"/>
        <StatCard title="Total Pengeluaran" value={formatCurrency(summary.totalPengeluaran)} icon={ArrowDown} iconBgColor="bg-red-500/20" iconColor="text-red-400"/>
        <StatCard 
            title="Surplus / Defisit" 
            value={formatCurrency(summary.surplusDefisit)} 
            icon={Scale} 
            iconBgColor={summary.surplusDefisit >= 0 ? "bg-green-500/20" : "bg-red-500/20"}
            iconColor={summary.surplusDefisit >= 0 ? "text-green-400" : "text-red-400"}
        />
        <StatCard title="Saldo Akhir Tahun" value={formatCurrency(summary.saldoAkhir)} icon={Wallet} iconBgColor="bg-sky-500/20" iconColor="text-sky-400"/>
      </div>

      {/* Category Top 5 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBarChart
            title={`5 Kategori Penerimaan Teratas - ${selectedYear}`}
            data={top5Penerimaan}
            barColor="#38A169"
        />
        <CategoryBarChart
            title={`5 Kategori Pengeluaran Teratas - ${selectedYear}`}
            data={top5Pengeluaran}
            barColor="#E53E3E"
        />
      </div>
      
      {/* Monthly Chart */}
       <div className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-800">
         <h3 className="text-lg font-semibold mb-4 text-white">Ringkasan Keuangan Bulanan - {selectedYear}</h3>
         <MonthlyBarChart data={monthlyChartData} />
      </div>

      {/* Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownTable 
            title="Rincian Penerimaan"
            data={penerimaanByCategory}
            icon={ChevronsRight}
            header1="Kategori Penerimaan"
            header2="Jumlah"
            colorClass="text-green-400"
        />
        <BreakdownTable 
            title="Rincian Pengeluaran"
            data={pengeluaranByCategory}
            icon={ChevronsLeft}
            header1="Kategori Pengeluaran"
            header2="Jumlah"
            colorClass="text-red-400"
        />
      </div>

    </div>
  );
};

export default SaldoAkhir;