// Fix: Add missing imports for React hooks.
import React, { useState, useMemo, useEffect, useRef } from 'react';
import SetoranTable from '../components/setoran/SetoranTable';
import type { SetoranData, PeminjamData } from '../types';
import Pagination from '../components/bku/Pagination';
import SetoranFormModal from '../components/setoran/SetoranFormModal';
import ConfirmationModal from '../components/shared/ConfirmationModal';
import ExportModal from '../components/shared/ExportModal';
import { Plus, PiggyBank, HandCoins, Milestone, Download, Upload } from 'lucide-react';
import { formatCurrency, formatDate, safeFormatDateForImport } from '../utils/formatters';
import { exportToExcel, importFromExcel } from '../utils/fileHandlers';
import { v4 as uuidv4 } from 'uuid';

interface SetoranProps {
  setoranData: SetoranData[];
  peminjamData: PeminjamData[];
  onSubmit: (formData: Omit<SetoranData, 'id'>, id?: string) => void;
  onDelete: (id: string) => void;
  onImport: (data: SetoranData[]) => void;
}

const Setoran: React.FC<SetoranProps> = ({ setoranData, peminjamData, onSubmit, onDelete, onImport }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SetoranData | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [importedData, setImportedData] = useState<SetoranData[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters State
  const [filterName, setFilterName] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const itemsPerPage = 5;

  const filteredData = useMemo(() => {
    return setoranData.filter(item => {
      // FIX: Consistently parse the date as a local date to avoid timezone shifting issues.
      const itemDate = new Date(`${item.tanggal}T00:00:00`);
      const itemMonth = (itemDate.getMonth() + 1).toString();
      const itemYear = itemDate.getFullYear().toString();

      const nameMatch = filterName === '' || item.peminjamId === filterName;
      const monthMatch = filterMonth === '' || itemMonth === filterMonth;
      const yearMatch = filterYear === '' || itemYear === filterYear;
      
      return nameMatch && monthMatch && yearMatch;
    });
  }, [setoranData, filterName, filterMonth, filterYear]);

  const summary = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      acc.totalSetoran += item.jumlahSetoran;
      acc.totalBunga += item.bunga;
      acc.totalPokok += item.pokok;
      return acc;
    }, { totalSetoran: 0, totalBunga: 0, totalPokok: 0 });
  }, [filteredData]);

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
      const entry = setoranData.find(item => item.id === id);
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

  const handleFormSubmit = (formData: Omit<SetoranData, 'id'>, id?: string) => {
      onSubmit(formData, id);
      setIsModalOpen(false);
      setEditingEntry(null);
  };

  const handleExport = (fileName: string) => {
    const dataToExport = setoranData.map(item => ({
      'Tanggal': formatDate(item.tanggal),
      'Kode Transaksi': item.kodeRekening,
      'Nama Peminjam': item.namaPeminjam,
      'Jumlah Pinjaman': item.jumlahPinjaman,
      'Jumlah Setoran': item.jumlahSetoran,
      'Bunga': item.bunga,
      'Pokok': item.pokok,
      'Uraian': item.uraian
    }));
    exportToExcel(dataToExport, fileName, 'Data Setoran');
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
        const formattedData: SetoranData[] = rawData.map((row: any) => {
            const namaPeminjam = String(row['Nama Peminjam'] || 'Unknown');
            const peminjam = peminjamData.find(p => p.nama === namaPeminjam);

            const jumlahSetoran = Number(row['Jumlah Setoran'] || 0);
            
            // Prioritize bunga from Excel file.
            // If not available, fall back to the peminjam's default bunga.
            // If peminjam is not found, calculate it as a last resort.
            let bunga: number;
            const excelBunga = Number(row['Bunga']);

            if (row['Bunga'] !== undefined && !isNaN(excelBunga)) {
                bunga = excelBunga;
            } else if (peminjam) {
                bunga = peminjam.bunga;
            } else {
                bunga = (Number(row['Jumlah Pinjaman'] || 0) * 0.02);
            }
            
            return {
                id: uuidv4(),
                tanggal: safeFormatDateForImport(row['Tanggal']),
                kodeRekening: String(row['Kode Transaksi'] || row['Kode Rekening'] || ''),
                peminjamId: peminjam ? peminjam.id : 'unknown',
                namaPeminjam: namaPeminjam,
                jumlahPinjaman: peminjam ? peminjam.jumlahPinjaman : Number(row['Jumlah Pinjaman'] || 0),
                jumlahSetoran: jumlahSetoran,
                bunga: bunga,
                pokok: jumlahSetoran - bunga,
                uraian: String(row['Uraian'] || ''),
            };
        });
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

  const uniqueYears = useMemo(() => [...new Set(setoranData.map(d => new Date(d.tanggal).getFullYear().toString()))].sort((a,b)=> Number(b)-Number(a)), [setoranData]);
  const uniquePeminjam = useMemo(() => [...new Map(setoranData.map(item => [item.peminjamId, {id: item.peminjamId, nama: item.namaPeminjam}])).values()], [setoranData]);


  return (
    <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-800 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-semibold text-white">Data Setoran</h2>
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <Plus size={20} />
            <span>Buat Data Setoran Baru</span>
          </button>
        </div>
      </div>
      
       {/* Filters */}
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div>
            <label className="text-xs text-gray-400">Filter Nama Peminjam</label>
            <select value={filterName} onChange={e => setFilterName(e.target.value)} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500">
               <option value="">Semua Peminjam</option>
               {uniquePeminjam.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
          </div>
           <div>
            <label className="text-xs text-gray-400">Filter Bulan</label>
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500">
                <option value="">Semua Bulan</option>
                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('id-ID', {month: 'long'})}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400">Filter Tahun</label>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500">
                <option value="">Semua Tahun</option>
                {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
       </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-full"><PiggyBank className="h-6 w-6 text-green-400"/></div>
              <div><h3 className="text-sm text-gray-400">Total Setoran</h3><p className="text-xl font-bold text-white">{formatCurrency(summary.totalSetoran)}</p></div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-full"><HandCoins className="h-6 w-6 text-orange-400"/></div>
              <div><h3 className="text-sm text-gray-400">Total Bunga</h3><p className="text-xl font-bold text-white">{formatCurrency(summary.totalBunga)}</p></div>
          </div>
           <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg flex items-center gap-3">
              <div className="p-3 bg-sky-500/10 rounded-full"><Milestone className="h-6 w-6 text-sky-400"/></div>
              <div><h3 className="text-sm text-gray-400">Total Pokok</h3><p className="text-xl font-bold text-white">{formatCurrency(summary.totalPokok)}</p></div>
          </div>
      </div>


      <SetoranTable data={paginatedData} onEdit={handleEdit} onDelete={handleDeleteClick} />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <SetoranFormModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            setEditingEntry(null);
        }}
        onSubmit={handleFormSubmit}
        entryToEdit={editingEntry}
        peminjamData={peminjamData.filter(p => p.status === 'Belum Lunas')}
        setoranData={setoranData}
      />
      
      <ConfirmationModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setIsConfirmDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus data setoran ini? Menghapus data ini juga akan menghapus catatan penerimaan terkait di Buku Kas Pembantu."
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
        defaultFileName={`Data_Setoran_${new Date().toISOString().split('T')[0]}`}
      />

    </div>
  );
};

export default Setoran;
