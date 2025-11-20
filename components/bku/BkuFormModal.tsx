
import React, { useState, useEffect } from 'react';
import type { BkuData } from '../../types';
import { X } from 'lucide-react';
import { numberToWords } from '../../utils/formatters';

interface BkuFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<BkuData, 'id' | 'saldo'>, id?: string) => void;
    entryToEdit?: BkuData | null;
    categories: string[];
    bkuData: BkuData[];
}

const BkuFormModal: React.FC<BkuFormModalProps> = ({ isOpen, onClose, onSubmit, entryToEdit, categories, bkuData }) => {
    const [tanggal, setTanggal] = useState('');
    const [kode, setKode] = useState('');
    const [uraian, setUraian] = useState('');
    const [kategori, setKategori] = useState('');
    const [isPengeluaran, setIsPengeluaran] = useState(true);
    const [amount, setAmount] = useState<number | string>('');

    useEffect(() => {
        if (entryToEdit) {
            setTanggal(entryToEdit.tanggal);
            setKode(entryToEdit.kode);
            setUraian(entryToEdit.uraian);
            setKategori(entryToEdit.kategori || '');
            if (entryToEdit.pengeluaran > 0) {
                setIsPengeluaran(true);
                setAmount(entryToEdit.pengeluaran);
            } else {
                setIsPengeluaran(false);
                setAmount(entryToEdit.penerimaan);
            }
        } else {
            // Reset form for new entry
            setTanggal('');
            setKode('');
            setUraian('');
            setKategori('');
            setIsPengeluaran(true);
            setAmount('');
        }
    }, [entryToEdit, isOpen]);

    useEffect(() => {
        if (!entryToEdit && isOpen && tanggal) { // Only for new entries when modal is open and date is selected
            const date = new Date(`${tanggal}T00:00:00`); // Use local timezone to avoid date shifts
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const datePart = `${year}${month}${day}`;

            const countOnDate = bkuData.filter(d => d.tanggal === tanggal).length;
            const sequence = (countOnDate + 1).toString().padStart(3, '0');

            setKode(`BKU${datePart}-${sequence}`);
        } else if (!entryToEdit) {
            setKode(''); // Clear code if no date is selected for a new entry
        }
    }, [tanggal, isOpen, entryToEdit, bkuData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = Number(amount) || 0;
        const data: Omit<BkuData, 'id' | 'saldo'> = {
            tanggal,
            kode,
            uraian,
            kategori,
            penerimaan: !isPengeluaran ? numericAmount : 0,
            pengeluaran: isPengeluaran ? numericAmount : 0,
        };
        onSubmit(data, entryToEdit?.id);
    };

    if (!isOpen) return null;

    const terbilangText = amount ? numberToWords(Number(amount)) + ' Rupiah' : 'Nol Rupiah';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-gray-700 animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0 p-6 pb-4 flex justify-between items-center border-b-2 border-teal-500">
                    <h3 className="text-xl font-semibold text-white">{entryToEdit ? 'Edit Data Buku Kas Umum' : 'Buat Data Baru'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    <form id="bku-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label htmlFor="tanggal" className="block text-sm font-medium text-gray-300 mb-1">Tanggal</label>
                                <input type="date" id="tanggal" value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                            </div>
                            <div>
                                <label htmlFor="kode" className="block text-sm font-medium text-gray-300 mb-1">Kode Transaksi</label>
                                <input type="text" id="kode" value={kode} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-400 focus:outline-none" readOnly />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="uraian" className="block text-sm font-medium text-gray-300 mb-1">Uraian Transaksi</label>
                            <textarea id="uraian" value={uraian} onChange={e => setUraian(e.target.value)} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" required placeholder="Contoh: Belanja ATK bulan Mei" autoComplete="off"></textarea>
                        </div>

                        <div>
                            <label htmlFor="kategori" className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                            <input
                                type="text"
                                id="kategori"
                                list="kategori-list"
                                value={kategori}
                                onChange={e => setKategori(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Pilih atau ketik kategori baru"
                                required
                                autoComplete="off"
                            />
                            <datalist id="kategori-list">
                                {categories.map(cat => <option key={cat} value={cat} />)}
                            </datalist>
                        </div>

                        <div className="flex items-center">
                            <input id="isPengeluaran" type="checkbox" checked={isPengeluaran} onChange={() => setIsPengeluaran(!isPengeluaran)} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                            <label htmlFor="isPengeluaran" className="ml-2 block text-sm text-gray-300">Tandai sebagai Pengeluaran</label>
                        </div>

                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">{isPengeluaran ? 'Jumlah Pengeluaran' : 'Jumlah Penerimaan'}</label>
                            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="0" required />
                            <p className="text-xs text-gray-400 mt-1 italic capitalize">{terbilangText}</p>
                        </div>
                    </form>
                </div>

                <div className="flex-shrink-0 p-6 pt-4 flex justify-end gap-3 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors">Batal</button>
                    <button type="submit" form="bku-form" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md transition-colors">{entryToEdit ? 'Simpan Perubahan' : 'Simpan'}</button>
                </div>
            </div>
        </div>
    );
};

export default BkuFormModal;
