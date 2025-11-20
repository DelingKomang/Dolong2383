import React from 'react';
import { X, LogOut, Download, AlertTriangle } from 'lucide-react';

interface LogoutConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    onExportAndLogout: () => void;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({ isOpen, onClose, onLogout, onExportAndLogout }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 border border-gray-700 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-full bg-yellow-500/10">
                         <AlertTriangle className="h-6 w-6 text-yellow-400" />
                       </div>
                       <h3 className="text-xl font-semibold text-white">Konfirmasi Logout</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <p className="text-gray-300 mb-6">Anda akan log out. Apakah Anda ingin mem-backup data Anda ke Excel terlebih dahulu?</p>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-all duration-200"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <LogOut size={16} />
                        Keluar
                    </button>
                    <button
                        onClick={onExportAndLogout}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <Download size={16} />
                        Simpan dan Keluar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmationModal;
