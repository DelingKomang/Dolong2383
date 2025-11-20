


import React, { useState, useMemo, useRef } from 'react';
import BkpTable from '../components/bkp/BkpTable';
import type { BkpData } from '../types';
import Pagination from '../components/bku/Pagination';
import BkpFormModal from '../components/bkp/BkpFormModal';
import ConfirmationModal from '../components/shared/ConfirmationModal';
import ExportModal from '../components/shared/ExportModal';
import StatCard from '../components/dashboard/StatCard';
import { Plus, Download, Upload, Search, Wallet, ArrowUp, ArrowDown } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../utils/fileHandlers';
import { formatDate, safeFormatDateForImport, formatCurrency } from '../utils/formatters';
import { v4 as uuidv4 } from 'uuid';

interface BukuKasPembantuProps {
  bkpData: BkpData[];
  onSubmit: (formData: Omit<BkpData, 'id' | 'saldo'>, id?: string) => void;
  onDelete: (id: string) => void;
  onImport: (data: BkpData[]) => void;
  categories: string[];
}

const BukuKasPembantu: React.FC<BukuKasPembantuProps> = ({ bkpData, onSubmit, onDelete, onImport, categories }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BkpData | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [importedData, setImportedData] = useState<BkpData[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const itemsPerPage = 5;

  const filteredData = useMemo(() => {
    return bkpData.filter(item => {
        const lowercasedTerm = searchTerm.toLowerCase();
        
        const searchTermMatch = !searchTerm || (
            (item.uraian || '').toLowerCase().includes(lowercasedTerm) ||
            (item.bukti || '').toLowerCase().includes(lowercasedTerm) ||
            (item.kategori || '').toLowerCase().includes(lowercasedTerm) ||
            (item.kode || '').toLowerCase().includes(lowercasedTerm)
        );

        const categoryMatch = !filterCategory || item.kategori === filterCategory;

        return searchTermMatch && categoryMatch;
    });
  }, [bkpData, searchTerm, filterCategory]);
  
  const summary = useMemo(() => {
    const totalDebet = filteredData.reduce((acc, item) => acc + item.debet, 0);
    const totalKredit = filteredData.reduce((acc, item) => acc + item.kredit, 0);
    const finalBalance = bkpData.length > 0 ? bkpData[0].saldo : 0; // Saldo from all data
    return { totalDebet, totalKredit, finalBalance };
  }, [filteredData, bkpData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handleOpenModalForNew = () => {
      setEditingEntry(null);
      setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
      const entry = bkpData.find(item => item.id === id);
      if (entry) {
          setEditingEntry(entry);
          setIsModalOpen(true);
      }
  };
  
  const handleDeleteClick = (id: string) => {
      setDeletingId(id);
      setIsConfirmDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
    }
    setDeletingId(null);
    setIsConfirmDeleteModalOpen(false);
  };

  const handleFormSubmit = (formData: Omit<BkpData, 'id' | 'saldo'>, id?: string) => {
      onSubmit(formData, id);
      setIsModalOpen(false);
      setEditingEntry(null);
  };

  const handleExport = (fileName: string) => {
    const dataToExport = bkpData.map(item => ({
      'Tanggal': formatDate(item.tanggal),
      'Kode Transaksi': item.bukti,
      'Uraian': item.uraian,
      'Kategori': item.kategori,
      'Kode Rincian Belanja': item.kode,
      'Debet (Penerimaan)': item.debet,
      'Kredit (Pengeluaran)': item.kredit,
    }));
    exportToExcel(dataToExport, fileName, 'Buku Kas Pembantu');
    setIsExportModalOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const rawData = await importFromExcel(file);
        const formattedData: BkpData[] = rawData.map((row: any) => ({
            id: uuidv4(),
            tanggal: safeFormatDateForImport(row['Tanggal']),
            bukti: String(row['Kode Transaksi'] || ''),
            uraian: String(row['Uraian'] || ''),
            kategori: String(row['Kategori'] || 'Lain-lain'),
            kode: String(row['Kode Rincian Belanja'] || ''),
            debet: Number(row['Debet (Penerimaan)'] || 0),
            kredit: Number(row['Kredit (Pengeluaran)'] || 0),
            saldo: 0, 
        }));
        setImportedData(formattedData);
        setIsImportConfirmOpen(true);
    } catch (error) {
        console.error("Error importing file:", error);
        alert("Gagal mengimpor file. Pastikan format file benar.");
    } finally {
       if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    if (importedData) {
        onImport(importedData);
    }
    setIsImportConfirmOpen(false);
    setImportedData(null);
  };

  return (
    <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-800 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-semibold text-white">Buku Kas Pembantu</h2>
      </div>

       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                type="text"
                placeholder="Cari (Uraian, Kode...)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
            </div>
            <div className="w-full sm:w-auto">
                <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
              <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls" />
              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
              >
                <Upload size={18} />
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
              >
                <Download size={18} />
              </button>
              <button
                onClick={handleOpenModalForNew}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Buat Data BKP Baru</span>
              </button>
          </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Penerimaan" 
          value={formatCurrency(summary.totalDebet)} 
          icon={ArrowUp}
          iconBgColor="bg-green-500/20"
          iconColor="text-green-400"
        />
        <StatCard 
          title="Total Pengeluaran" 
          value={formatCurrency(summary.totalKredit)} 
          icon={ArrowDown}
          iconBgColor="bg-red-500/20"
          iconColor="text-red-400"
        />
        <StatCard 
          title="Saldo Akhir" 
          value={formatCurrency(summary.finalBalance)} 
          icon={Wallet}
          iconBgColor="bg-sky-500/20"
          iconColor="text-sky-400"
        />
      </div>

      <BkpTable data={paginatedData} onEdit={handleEdit} onDelete={handleDeleteClick} />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <BkpFormModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            setEditingEntry(null);
        }}
        onSubmit={handleFormSubmit}
        entryToEdit={editingEntry}
        categories={categories}
        bkpData={bkpData}
      />
      
      <ConfirmationModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setIsConfirmDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus data transaksi ini? Tindakan ini tidak dapat dibatalkan."
      />

      <ConfirmationModal
        isOpen={isImportConfirmOpen}
        onClose={() => setIsImportConfirmOpen(false)}
        onConfirm={confirmImport}
        title="Konfirmasi Import"
        message={`Anda akan mengimpor ${importedData?.length || 0} baris data. Tindakan ini akan MENGGANTI semua data yang ada saat ini. Lanjutkan?`}
        confirmText="Ya, Import"
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExport}
        defaultFileName={`Data_BKP_${new Date().toISOString().split('T')[0]}`}
      />
    </div>
  );
};

export default BukuKasPembantu;
