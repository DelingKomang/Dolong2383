import React from 'react';
import { X, CalendarCheck2 } from 'lucide-react';
import type { RekapData } from '../../types';

interface PaidMonthsModalProps {
    isOpen: boolean;
    onClose: () => void;
    rekapData: RekapData | null;
}

const PaidMonthsModal: React.FC<PaidMonthsModalProps> = ({ isOpen, onClose, rekapData }) => {
    if (!isOpen || !rekapData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm p-4" onClick={onClose}>
            <div 
                className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 border border-gray-700 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-full bg-green-500/10">
                         <CalendarCheck2 className="h-6 w-6 text-green-400" />
                       </div>
                       <div>
                           <h3 className="text-xl font-semibold text-white">Detail Bulan Terbayar</h3>
                           <p className="text-sm text-gray-300">{rekapData.namaPeminjam}</p>
                       </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <p className="text-gray-300 mb-4">Berikut adalah daftar bulan di tahun ini yang sudah dibayar:</p>

                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 max-h-60 overflow-y-auto">
                    <ul className="list-disc list-inside space-y-2 text-green-300">
                        {rekapData.paidMonths.map(month => (
                            <li key={month} className="font-medium">{month}</li>
                        ))}
                    </ul>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-all duration-200"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaidMonthsModal;