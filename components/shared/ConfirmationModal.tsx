import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Ya, Hapus" }) => {
    if (!isOpen) return null;

    const isDeleteAction = confirmText.toLowerCase().includes('hapus');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 border border-gray-700 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-full ${isDeleteAction ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                         <AlertTriangle className={`h-6 w-6 ${isDeleteAction ? 'text-red-400' : 'text-blue-400'}`} />
                       </div>
                       <h3 className="text-xl font-semibold text-white">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <p className="text-gray-300 mb-6">{message}</p>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-all duration-200 transform hover:scale-105"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className={`px-4 py-2 text-white font-semibold rounded-md transition-all duration-200 transform hover:scale-105 shadow-md ${
                            isDeleteAction 
                            ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/50' 
                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/50'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;