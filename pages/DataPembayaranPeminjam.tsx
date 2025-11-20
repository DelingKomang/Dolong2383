import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { PeminjamData, SetoranData, ManualPayment } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CreditCard, Download, Upload } from 'lucide-react';
import ConfirmationModal from '../components/shared/ConfirmationModal';
import Notification from '../components/shared/Notification';
import { exportToExcel, importFromExcel } from '../utils/fileHandlers';

interface DataPembayaranPeminjamProps {
  peminjamData: PeminjamData[];
  setoranData: SetoranData[];
  manualPayments: ManualPayment[];
  onToggleManualPayment: (peminjamId: string, year: number, month: number) => void;
  onImportManualPayments: (peminjamId: string, year: number, updates: { monthIndex: number; isPaid: boolean }[]) => void;
}

const indonesianMonthsMap: { [key: string]: number } = {
    'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
    'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
};

const getPaidMonthIndices = (setoran: SetoranData): number[] => {
    const uraian = (setoran.uraian || '').toLowerCase();
    const prefix = "setoran bulan ";
    
    if (uraian.includes(prefix)) {
        const monthsString = uraian.substring(uraian.indexOf(prefix) + prefix.length);
        const monthNames = monthsString.split(',').map(m => m.trim());
        const indices = monthNames.flatMap(name => (indonesianMonthsMap[name] !== undefined ? [indonesianMonthsMap[name]] : []));
        
        if (indices.length > 0) {
            return indices;
        }
    }
    
    return [new Date(`${setoran.tanggal}T00:00:00`).getMonth()];
};


const DataPembayaranPeminjam: React.FC<DataPembayaranPeminjamProps> = ({ peminjamData, setoranData, manualPayments, onToggleManualPayment, onImportManualPayments }) => {
  const [selectedPeminjamId, setSelectedPeminjamId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [confirmModalState, setConfirmModalState] = useState<{ isOpen: boolean; monthIndex: number | null; monthName: string | null }>({ isOpen: false, monthIndex: null, monthName: null });
  const [revertModalState, setRevertModalState] = useState<{ isOpen: boolean; monthIndex: number | null; monthName: string | null }>({ isOpen: false, monthIndex: null, monthName: null });
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const peminjamOptions = useMemo(() => {
    return peminjamData.sort((a, b) => a.nama.localeCompare(b.nama));
  }, [peminjamData]);

  const uniqueYears = useMemo(() => {
    if (!selectedPeminjamId) return [];
    const peminjam = peminjamData.find(p => p.id === selectedPeminjamId);
    if (!peminjam) return [];

    const years = new Set<string>();
    years.add(new Date(peminjam.tanggal + 'T00:00:00').getFullYear().toString());
    
    setoranData
      .filter(s => s.peminjamId === selectedPeminjamId)
      .forEach(s => years.add(new Date(s.tanggal + 'T00:00:00').getFullYear().toString()));
      
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [selectedPeminjamId, peminjamData, setoranData]);

  useEffect(() => {
    if (uniqueYears.length > 0) {
      if (!uniqueYears.includes(selectedYear)) {
        setSelectedYear(uniqueYears[0]);
      }
    } else {
      setSelectedYear('');
    }
  }, [uniqueYears, selectedYear]);

  const selectedPeminjamDetails = useMemo(() => {
    if (!selectedPeminjamId || !selectedYear) return null;

    const peminjam = peminjamData.find(p => p.id === selectedPeminjamId);
    if (!peminjam) return null;

    const allPayments = setoranData.filter(s => s.peminjamId === selectedPeminjamId);
    const paymentsForYear = allPayments.filter(p => new Date(p.tanggal + 'T00:00:00').getFullYear().toString() === selectedYear);
    const manualPaymentsForYear = manualPayments.filter(mp => mp.peminjamId === selectedPeminjamId && mp.year.toString() === selectedYear);

    const paidMonthsData = new Map<number, { jumlahSetoran: number; bunga: number; pokok: number; isAuto: boolean }>();

    paymentsForYear.forEach(setoran => {
        const paidIndices = getPaidMonthIndices(setoran);
        const paymentsPerMonth = paidIndices.length > 0 ? paidIndices.length : 1;
        paidIndices.forEach(index => {
            paidMonthsData.set(index, {
                jumlahSetoran: (paidMonthsData.get(index)?.jumlahSetoran || 0) + (setoran.jumlahSetoran / paymentsPerMonth),
                bunga: (paidMonthsData.get(index)?.bunga || 0) + (setoran.bunga / paymentsPerMonth),
                pokok: (paidMonthsData.get(index)?.pokok || 0) + (setoran.pokok / paymentsPerMonth),
                isAuto: false
            });
        });
    });
    
    const manualPaidMonthsSet = new Set<number>(manualPaymentsForYear.map(mp => mp.month));

    const totalPokokPaid = allPayments.reduce((acc, p) => acc + p.pokok, 0);
    const remainingDebt = peminjam.jumlahPinjaman - totalPokokPaid;

    const totalPaidForYear = Array.from(paidMonthsData.values()).reduce((acc, p) => acc + p.jumlahSetoran, 0);
    const totalBungaForYear = Array.from(paidMonthsData.values()).reduce((acc, p) => acc + p.bunga, 0);
    const totalPokokForYear = Array.from(paidMonthsData.values()).reduce((acc, p) => acc + p.pokok, 0);

    const monthlyBreakdown = [];
    const yearToAnalyze = parseInt(selectedYear);
    const loanStartDate = new Date(peminjam.tanggal + 'T00:00:00');
    const today = new Date();

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthName = new Date(yearToAnalyze, monthIndex, 1).toLocaleString('id-ID', { month: 'long' });
        const checkDate = new Date(yearToAnalyze, monthIndex, 1);
        
        const isFutureMonth = checkDate > today;
        const isBeforeLoanPeriod = checkDate < new Date(loanStartDate.getFullYear(), loanStartDate.getMonth(), 1);

        let status = '-';
        let isPayable = false;
        let isAuto = false;
        let paymentData = paidMonthsData.get(monthIndex);
        
        if (isFutureMonth || isBeforeLoanPeriod) {
            status = '-';
        } else if (paymentData) {
            status = 'Di bayar';
        } else if (manualPaidMonthsSet.has(monthIndex)) {
            status = 'Di bayar';
            isAuto = true;
            // Create temporary payment data for display
            paymentData = {
                jumlahSetoran: peminjam.bunga,
                bunga: peminjam.bunga,
                pokok: 0,
                isAuto: true,
            };
        } else if (peminjam.status === 'Belum Lunas') {
            status = 'Tidak Bayar';
            isPayable = true;
        }
        
        monthlyBreakdown.push({
            monthIndex,
            monthName,
            status,
            isPayable,
            jumlahSetoran: paymentData?.jumlahSetoran,
            bunga: paymentData?.bunga,
            pokok: paymentData?.pokok,
            isAuto,
        });
    }

    return {
      peminjam,
      monthlyBreakdown,
      summary: {
        totalPaidForYear,
        totalBungaForYear,
        totalPokokForYear,
        remainingDebt: remainingDebt > 0 ? remainingDebt : 0,
      }
    };
  }, [selectedPeminjamId, selectedYear, peminjamData, setoranData, manualPayments]);
  
  const handleMarkAsPaid = (monthIndex: number, monthName: string) => {
    setConfirmModalState({ isOpen: true, monthIndex, monthName });
  };

  const handleConfirmPayment = () => {
    if (confirmModalState.monthIndex !== null && selectedPeminjamDetails) {
        onToggleManualPayment(selectedPeminjamDetails.peminjam.id, parseInt(selectedYear), confirmModalState.monthIndex);
    }
    setConfirmModalState({ isOpen: false, monthIndex: null, monthName: null });
  };
  
  const handleRevertPayment = (monthIndex: number, monthName: string) => {
    setRevertModalState({ isOpen: true, monthIndex, monthName });
  };
  
  const handleConfirmRevert = () => {
    if (revertModalState.monthIndex !== null && selectedPeminjamDetails) {
        onToggleManualPayment(selectedPeminjamDetails.peminjam.id, parseInt(selectedYear), revertModalState.monthIndex);
    }
    setRevertModalState({ isOpen: false, monthIndex: null, monthName: null });
  };

  const handlePeminjamChange = (peminjamId: string) => {
    setSelectedPeminjamId(peminjamId);
  };

  const handleExportExcel = () => {
    if (!selectedPeminjamDetails) return;
    const { peminjam, monthlyBreakdown } = selectedPeminjamDetails;
    
    const dataToExport = monthlyBreakdown.map(item => ({
        'Bulan': item.monthName,
        'Status': item.status,
        'Jumlah Setoran': item.jumlahSetoran || 0,
        'Jumlah Bunga': item.bunga || 0,
        'Jumlah Pokok': item.pokok || 0,
    }));
    
    const fileName = `Pembayaran_${peminjam.nama.replace(/\s+/g, '_')}_${selectedYear}`;
    exportToExcel(dataToExport, fileName, `Pembayaran ${selectedYear}`);
    setShowExportSuccess(true);
  };

  const handleImportClick = () => {
    if (!selectedPeminjamId || !selectedYear) {
      alert("Silakan pilih peminjam dan tahun terlebih dahulu.");
      return;
    }
    importFileInputRef.current?.click();
  };
  
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const rawData = await importFromExcel(file);
        const updates: { monthIndex: number; isPaid: boolean }[] = [];
        
        rawData.forEach((row: any) => {
            const monthName = String(row['Bulan'] || '').toLowerCase();
            const status = String(row['Status'] || '').toLowerCase();
            const monthIndex = indonesianMonthsMap[monthName];

            if (monthIndex !== undefined) {
                updates.push({ monthIndex, isPaid: status === 'di bayar' });
            }
        });

        if (updates.length > 0) {
            onImportManualPayments(selectedPeminjamId, parseInt(selectedYear), updates);
            setShowImportSuccess(true);
        } else {
            alert("Tidak ada data valid yang ditemukan dalam file. Pastikan kolom 'Bulan' dan 'Status' ada.");
        }
    } catch (error) {
        console.error("Error importing file:", error);
        alert("Gagal mengimpor file. Pastikan format file benar.");
    } finally {
       if(importFileInputRef.current) importFileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-800 space-y-6">
      <input type="file" ref={importFileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls" />
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-teal-400" />
          <h2 className="text-xl font-semibold text-white">Data Pembayaran Peminjam</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            id="peminjam-select"
            value={selectedPeminjamId}
            onChange={e => handlePeminjamChange(e.target.value)}
            className="w-full sm:w-60 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">-- Pilih Peminjam --</option>
            {peminjamOptions.map(p => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </select>
           <select
            id="year-select"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            disabled={!selectedPeminjamId || uniqueYears.length === 0}
            className="w-full sm:w-36 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
          >
            {uniqueYears.length > 0 ? (
              uniqueYears.map(y => <option key={y} value={y}>{y}</option>)
            ) : (
              <option value="">-- Pilih Peminjam --</option>
            )}
          </select>
        </div>
      </div>
      
       <div className="flex justify-end items-center gap-2">
           <button
            onClick={handleImportClick}
            disabled={!selectedPeminjamDetails}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={18} />
            <span>Import Excel</span>
          </button>
          <button
            onClick={handleExportExcel}
            disabled={!selectedPeminjamDetails}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
             <span>Export Excel</span>
          </button>
        </div>

      {selectedPeminjamDetails ? (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Rincian Pembayaran Bulanan ({selectedYear})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3">Bulan</th>
                    <th scope="col" className="px-4 py-3">Jumlah Pinjaman</th>
                    <th scope="col" className="px-4 py-3 text-right">Jumlah Setoran</th>
                    <th scope="col" className="px-4 py-3 text-right">Jml. Bunga</th>
                    <th scope="col" className="px-4 py-3 text-right">Jml. Pokok</th>
                    <th scope="col" className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPeminjamDetails.monthlyBreakdown.map((item) => (
                    <tr key={item.monthIndex} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="px-4 py-4 font-medium text-white">{item.monthName}</td>
                      <td className="px-4 py-4 text-blue-300">{formatCurrency(selectedPeminjamDetails.peminjam.jumlahPinjaman)}</td>
                      <td className={`px-4 py-4 text-right font-semibold ${item.isAuto ? 'text-red-400' : 'text-green-400'}`}>{formatCurrency(item.jumlahSetoran)}</td>
                      <td className={`px-4 py-4 text-right ${item.isAuto ? 'text-red-400' : 'text-orange-400'}`}>{formatCurrency(item.bunga)}</td>
                      <td className={`px-4 py-4 text-right ${item.isAuto ? 'text-red-400' : 'text-sky-400'}`}>{formatCurrency(item.pokok)}</td>
                      <td className="px-4 py-4 text-center">
                        {item.status === 'Di bayar' && (
                           item.isAuto ? (
                             <button onClick={() => handleRevertPayment(item.monthIndex, item.monthName)} className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-300 hover:bg-red-500/40 hover:text-red-300 transition-colors">
                               Di bayar
                             </button>
                           ) : (
                             <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-300 cursor-not-allowed" title="Pembayaran dari form Setoran">Di bayar</span>
                           )
                        )}
                        {item.status === 'Tidak Bayar' && (
                           <button onClick={() => handleMarkAsPaid(item.monthIndex, item.monthName)} className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-300 hover:bg-green-500/40 hover:text-green-300 transition-colors">
                             Tidak Bayar
                           </button>
                        )}
                        {item.status === '-' && <span className="text-gray-500">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
          <CreditCard className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300">Pilih Peminjam</h3>
          <p>Pilih nama peminjam dari daftar di atas untuk melihat detail pembayaran.</p>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState({ isOpen: false, monthIndex: null, monthName: null })}
        onConfirm={handleConfirmPayment}
        title="Konfirmasi Pembayaran"
        message={`Anda akan menandai bulan ${confirmModalState.monthName} sebagai 'Di bayar' untuk ${selectedPeminjamDetails?.peminjam.nama}. Ini hanya untuk penandaan dan tidak membuat transaksi setoran formal. Lanjutkan?`}
        confirmText="Ya, Tandai Dibayar"
      />
      <ConfirmationModal
        isOpen={revertModalState.isOpen}
        onClose={() => setRevertModalState({ isOpen: false, monthIndex: null, monthName: null })}
        onConfirm={handleConfirmRevert}
        title="Konfirmasi Pembatalan"
        message={`Anda akan membatalkan status 'Di bayar' untuk bulan ${revertModalState.monthName} dan mengembalikannya menjadi 'Tidak Bayar'. Lanjutkan?`}
        confirmText="Ya, Batalkan"
      />
      <Notification
        message="Data berhasil di-export ke Excel!"
        show={showExportSuccess}
        onClose={() => setShowExportSuccess(false)}
      />
      <Notification
        message="Data status pembayaran berhasil di-import!"
        show={showImportSuccess}
        onClose={() => setShowImportSuccess(false)}
      />
    </div>
  );
};

export default DataPembayaranPeminjam;