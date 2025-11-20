import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (fileName: string) => void;
    defaultFileName: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirm, defaultFileName }) => {
    const [fileName, setFileName] = useState(defaultFileName);

    useEffect(() => {
        if (isOpen) {
            setFileName(defaultFileName);
        }
    }, [isOpen, defaultFileName]);

    if (!isOpen) return null;

    const handleExport = () => {
        if (fileName.trim()) {
            onConfirm(fileName.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 border border-gray-700 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Export Data ke Excel</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <p className="text-gray-300 mb-4">Ubah nama file jika perlu, lalu klik export untuk mengunduh.</p>

                <div>
                    <label htmlFor="fileName" className="block text-sm font-medium text-gray-300 mb-1">Nama File</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            id="fileName" 
                            value={fileName} 
                            onChange={(e) => setFileName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">.xlsx</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-all duration-200"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleExport} 
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md transition-all duration-200 flex items-center gap-2"
                    >
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
