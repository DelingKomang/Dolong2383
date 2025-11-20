
import React, { useState, useMemo, useRef } from 'react';
import PeminjamTable from '../components/peminjam/PeminjamTable';
import type { PeminjamData } from '../types';
import Pagination from '../components/bku/Pagination';
import PeminjamFormModal from '../components/peminjam/PeminjamFormModal';
import ConfirmationModal from '../components/shared/ConfirmationModal';
import ExportModal from '../components/shared/ExportModal';
import { Plus, Search, Landmark, Download, Upload } from 'lucide-react';
import { formatCurrency, formatDate, safeFormatDateForImport } from '../utils/formatters';
import { exportToExcel, importFromExcel } from '../utils/fileHandlers';
import { v4 as uuidv4 } from 'uuid';

interface PeminjamProps {
  peminjamData: PeminjamData[];
  onSubmit: (formData: Omit<PeminjamData, 'id' | 'bunga' | 'status'>, id?: string) => void;
  onDelete: (id: string) => void;
  onImport: (data: PeminjamData[]) => void;
}

const Peminjam: React.FC<PeminjamProps> = ({ peminjamData, onSubmit, onDelete, onImport }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PeminjamData | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [importedData, setImportedData] = useState<PeminjamData[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 5;

  const totalPinjaman = useMemo(() => 
    peminjamData.reduce((acc, item) => item.status === 'Belum Lunas' ? acc + item.jumlahPinjaman : acc, 0),
  [peminjamData]);

  const sortedData = useMemo(() => 
    [...peminjamData].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()), 
  [peminjamData]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage]);
  
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
      const entry = peminjamData.find(item => item.id === id);
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

  const handleFormSubmit = (formData: Omit<PeminjamData, 'id' | 'bunga' | 'status'>, id?: string) => {
      onSubmit(formData, id);
      setIsModalOpen(false);
      setEditingEntry(null);
  };

  const handleExport = (fileName: string) => {
    const dataToExport = peminjamData.map(item => ({
      'Tanggal': formatDate(item.tanggal),
      'Kode Transaksi': item.kodeRekening,
      'Nama Peminjam': item.nama,
      'Jumlah Pinjaman': item.jumlahPinjaman,
      'Bunga': item.bunga,
      'Status': item.status,
      'Uraian': item.uraian
    }));
    exportToExcel(dataToExport, fileName, 'Data Peminjam');
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
        const formattedData: PeminjamData[] = rawData.map((row: any) => ({
            id: uuidv4(),
            tanggal: safeFormatDateForImport(row['Tanggal']),
            kodeRekening: String(row['Kode Transaksi'] || row['Kode Rekening'] || ''),
            nama: String(row['Nama Peminjam'] || ''),
            jumlahPinjaman: Number(row['Jumlah Pinjaman'] || 0),
            bunga: Number(row['Bunga'] || (Number(row['Jumlah Pinjaman'] || 0) * 0.02)),
            status: row['Status'] === 'Lunas' ? 'Lunas' : 'Belum Lunas',
            uraian: String(row['Uraian'] || ''),
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
    <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-800 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-semibold text-white">Data Peminjam</h2>
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
              <span className="hidden sm:inline">Buat Data Peminjam Baru</span>
            </button>
        </div>
      </div>
      
      <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
            <Landmark className="h-8 w-8 text-yellow-400" />
            <div>
                <h3 className="font-semibold text-white">Total Pinjaman Aktif (Belum Lunas)</h3>
                <p className="text-xs text-gray-400">Total dana yang masih dipinjam.</p>
            </div>
        </div>
        <p className="text-2xl font-bold text-yellow-400">{formatCurrency(totalPinjaman)}</p>
      </div>

      <PeminjamTable data={paginatedData} onEdit={handleEdit} onDelete={handleDeleteClick} />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <PeminjamFormModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            setEditingEntry(null);
        }}
        onSubmit={handleFormSubmit}
        entryToEdit={editingEntry}
        peminjamData={peminjamData}
      />
      
      <ConfirmationModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setIsConfirmDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus data peminjam ini? Tindakan ini tidak dapat dibatalkan."
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
        defaultFileName={`Data_Peminjam_${new Date().toISOString().split('T')[0]}`}
      />
    </div>
  );
};

export default Peminjam;
