
import React from 'react';
import { X, Info, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface SetoranSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    summary: { totalBunga: number; totalPokok: number; };
    month: string;
    year: string;
    onSaveToBku: () => void;
}

const SetoranSummaryModal: React.FC<SetoranSummaryModalProps> = ({ isOpen, onClose, summary, month, year, onSaveToBku }) => {
    if (!isOpen || !month || !year) return null;

    const monthName = new Date(0, parseInt(month) - 1).toLocaleString('id-ID', { month: 'long' });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 border border-gray-700 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-sky-500/10 rounded-full">
                         <Info className="h-6 w-6 text-sky-400" />
                       </div>
                       <h3 className="text-xl font-semibold text-white">Ringkasan Setoran</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <p className="text-gray-300 mb-4">Simpan rekapitulasi data berikut ke Buku Kas Umum?</p>

                <div className="space-y-4 mb-6">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400 capitalize">Bunga bulan {monthName} tahun {year}</p>
                        <p className="text-2xl font-bold text-orange-400">{formatCurrency(summary.totalBunga)}</p>
                    </div>
                     <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400 capitalize">Pokok bulan {monthName} tahun {year}</p>
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(summary.totalPokok)}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-all duration-200 transform hover:scale-105"
                    >
                        Tutup
                    </button>
                    <button 
                        onClick={onSaveToBku} 
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-teal-500/50 flex items-center gap-2"
                    >
                        <Save size={18}/>
                        Simpan ke BKU
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetoranSummaryModal;