
import React, { useMemo, useState, useEffect } from 'react';
import { DollarSign, TrendingDown, Wallet } from 'lucide-react';
import type { BkuData, MonthlyData, CategoryData, Transaction } from '../types';
import StatCard from '../components/dashboard/StatCard';
import MonthlyBarChart from '../components/dashboard/MonthlyBarChart';
import MonthlyLineChart from '../components/dashboard/MonthlyLineChart';
import CategoryDonutChart from '../components/dashboard/CategoryDonutChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import TopTransactions from '../components/dashboard/TopTransactions';
import { formatCurrency } from '../utils/formatters';

interface DashboardProps {
  bkuData: BkuData[];
}

const Dashboard: React.FC<DashboardProps> = ({ bkuData }) => {
  // Calculate available years from data
  const uniqueYears = useMemo(() => 
    [...new Set(bkuData.map(d => new Date(d.tanggal).getFullYear().toString()))]
    .sort((a, b) => Number(b) - Number(a)), 
  [bkuData]);

  // Default to current year or the latest available year
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Ensure selectedYear is valid when data changes
  useEffect(() => {
    if (uniqueYears.length > 0 && !uniqueYears.includes(selectedYear)) {
        setSelectedYear(uniqueYears[0]);
    } else if (uniqueYears.length === 0) {
        setSelectedYear(new Date().getFullYear().toString());
    }
  }, [uniqueYears, selectedYear]);

  // Filter data based on selected year
  const yearFilteredData = useMemo(() => {
    return bkuData.filter(item => new Date(item.tanggal).getFullYear().toString() === selectedYear);
  }, [bkuData, selectedYear]);

  const summaryData = useMemo(() => {
    const totalRevenue = yearFilteredData.reduce((acc, item) => acc + item.penerimaan, 0);
    const totalExpenses = yearFilteredData.reduce((acc, item) => acc + item.pengeluaran, 0);
    
    // For balance, we usually want the running balance up to the end of the selected year,
    // OR the balance at the end of the selected period. 
    // However, standard Dashboard logic usually implies "Current Status".
    // If filtering by year, "Saldo Akhir" usually means "Saldo at end of this year".
    // Since data is sorted by date descending in useMockData (mostly), index 0 of yearFilteredData *might* be the latest transaction of that year.
    // However, BKU logic in useMockData recalculates 'saldo' cumulatively. 
    // So we need the saldo of the very last transaction of that year.
    
    // Let's find the transaction with the latest date in the filtered set.
    const sortedByDate = [...yearFilteredData].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    const balance = sortedByDate.length > 0 ? sortedByDate[0].saldo : 0;

    return { totalRevenue, totalExpenses, balance };
  }, [yearFilteredData]);

  const monthlyChartData: MonthlyData[] = useMemo(() => {
    const yearInt = parseInt(selectedYear);
    const monthly: { [key: string]: { penerimaan: number; realisasi: number } } = {};

    // Initialize Jan-Dec for the selected year
    for (let i = 0; i < 12; i++) {
        const date = new Date(yearInt, i, 1);
        const monthKey = date.toLocaleString('id-ID', { month: 'short' }); // Just month name for the X-Axis
        monthly[monthKey] = { penerimaan: 0, realisasi: 0 };
    }
    
    yearFilteredData.forEach(item => {
      const date = new Date(item.tanggal);
      const monthKey = date.toLocaleString('id-ID', { month: 'short' });
      if (monthly[monthKey]) {
          monthly[monthKey].penerimaan += item.penerimaan;
          monthly[monthKey].realisasi += item.pengeluaran;
      }
    });

    return Object.entries(monthly).map(([name, values]) => ({ name, ...values }));
  }, [yearFilteredData, selectedYear]);


  const revenueCategoryData: CategoryData[] = useMemo(() => {
    const categories: { [key: string]: number } = {};
    yearFilteredData.forEach(item => {
      if (item.penerimaan > 0) {
        const category = item.kategori || 'Tanpa Kategori';
        if (!categories[category]) {
            categories[category] = 0;
        }
        categories[category] += item.penerimaan;
      }
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);
  }, [yearFilteredData]);

  const expenseCategoryData: CategoryData[] = useMemo(() => {
      const categories: { [key: string]: number } = {};
      yearFilteredData.forEach(item => {
        if (item.pengeluaran > 0) {
            const category = item.kategori || 'Tanpa Kategori';
            if (!categories[category]) {
                categories[category] = 0;
            }
            categories[category] += item.pengeluaran;
        }
      });

      return Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value);
  }, [yearFilteredData]);
  
  const allTransactions: Transaction[] = useMemo(() => 
    yearFilteredData.flatMap(item => {
        const transactions: Transaction[] = [];
        if (item.penerimaan > 0) {
            transactions.push({
                id: `${item.id}-p`,
                date: item.tanggal,
                description: item.uraian,
                amount: item.penerimaan,
                type: 'Penerimaan',
                category: item.kategori || 'Tanpa Kategori',
            });
        }
        if (item.pengeluaran > 0) {
            transactions.push({
                id: `${item.id}-k`,
                date: item.tanggal,
                description: item.uraian,
                amount: item.pengeluaran,
                type: 'Realisasi',
                category: item.kategori || 'Tanpa Kategori',
            });
        }
        return transactions;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  , [yearFilteredData]);

  const recentTransactions = allTransactions.slice(0, 5);
  const topTransactions = [...allTransactions].sort((a,b) => b.amount - a.amount).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900 p-4 rounded-lg border border-gray-800">
         <h2 className="text-xl font-semibold text-white">Dashboard</h2>
         <div className="flex items-center gap-2">
           <label htmlFor="dashboard-year" className="text-sm text-gray-400">Filter Tahun:</label>
           <select 
                id="dashboard-year"
                value={selectedYear} 
                onChange={e => setSelectedYear(e.target.value)} 
                className="bg-gray-800 border border-gray-700 rounded-md py-1 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
                {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
           </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title={`Total Penerimaan (${selectedYear})`} 
          value={formatCurrency(summaryData.totalRevenue)} 
          icon={DollarSign}
          iconBgColor="bg-green-500/20"
          iconColor="text-green-400"
        />
        <StatCard 
          title={`Total Pengeluaran (${selectedYear})`}
          value={formatCurrency(summaryData.totalExpenses)} 
          icon={TrendingDown}
          iconBgColor="bg-red-500/20"
          iconColor="text-red-400"
        />
        <StatCard 
          title={`Saldo Akhir (${selectedYear})`}
          value={formatCurrency(summaryData.balance)} 
          icon={Wallet}
          iconBgColor="bg-sky-500/20"
          iconColor="text-sky-400"
        />
      </div>

      {/* Main Charts - Stacked Vertically */}
      <div className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-800">
         <h3 className="text-lg font-semibold mb-4 text-white">Ringkasan Bulanan - {selectedYear}</h3>
         <MonthlyBarChart data={monthlyChartData} />
      </div>
      <div className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-800">
         <h3 className="text-lg font-semibold mb-4 text-white">Pergerakan Saldo Bulanan - {selectedYear}</h3>
         <MonthlyLineChart data={monthlyChartData} />
      </div>
      
      {/* Pie Charts - Side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryDonutChart title={`Penerimaan per Kategori (${selectedYear})`} data={revenueCategoryData} />
          <CategoryDonutChart title={`Realisasi per Kategori (${selectedYear})`} data={expenseCategoryData} />
      </div>

      {/* Details Lists - Side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <RecentActivity transactions={recentTransactions} />
         <TopTransactions transactions={topTransactions} />
      </div>
    </div>
  );
};

export default Dashboard;
