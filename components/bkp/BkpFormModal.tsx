
import React, { useState, useEffect } from 'react';
import type { BkpData } from '../../types';
import { X } from 'lucide-react';
import { numberToWords } from '../../utils/formatters';

interface BkpFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<BkpData, 'id' | 'saldo'>, id?: string) => void;
    entryToEdit?: BkpData | null;
    categories: string[];
    bkpData: BkpData[];
}

const BkpFormModal: React.FC<BkpFormModalProps> = ({ isOpen, onClose, onSubmit, entryToEdit, categories, bkpData }) => {
    const [tanggal, setTanggal] = useState('');
    const [kode, setKode] = useState('');
    const [bukti, setBukti] = useState('');
    const [uraian, setUraian] = useState('');
    const [kategori, setKategori] = useState('');
    const [isKredit, setIsKredit] = useState(true);
    const [amount, setAmount] = useState<number | string>('');

    useEffect(() => {
        if (entryToEdit) {
            setTanggal(entryToEdit.tanggal);
            setKode(entryToEdit.kode);
            setBukti(entryToEdit.bukti);
            setUraian(entryToEdit.uraian);
            setKategori(entryToEdit.kategori || '');
            if (entryToEdit.kredit > 0) {
                setIsKredit(true);
                setAmount(entryToEdit.kredit);
            } else {
                setIsKredit(false);
                setAmount(entryToEdit.debet);
            }
        } else {
            // Reset form for new entry
            setTanggal('');
            setKode('');
            setBukti('');
            setUraian('');
            setKategori('');
            setIsKredit(true);
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

            const countOnDate = bkpData.filter(d => d.tanggal === tanggal).length;
            const sequence = (countOnDate + 1).toString().padStart(3, '0');

            setBukti(`BKP${datePart}-${sequence}`);
        } else if (!entryToEdit) {
            setBukti(''); // Clear code if no date is selected for a new entry
        }
    }, [tanggal, isOpen, entryToEdit, bkpData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = Number(amount) || 0;
        const data: Omit<BkpData, 'id' | 'saldo'> = {
            tanggal,
            kode,
            bukti,
            uraian,
            kategori,
            debet: !isKredit ? numericAmount : 0,
            kredit: isKredit ? numericAmount : 0,
        };
        onSubmit(data, entryToEdit?.id);
    };

    if (!isOpen) return null;

    const terbilangText = amount ? numberToWords(Number(amount)) + ' Rupiah' : 'Nol Rupiah';
    
    const modalTitle = entryToEdit ? 'Edit Data Buku Kas Pembantu' : 'Buat Data BKP Baru';
    const submitButtonText = entryToEdit ? 'Simpan Perubahan' : 'Simpan';


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-gray-700 animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0 p-6 pb-4 flex justify-between items-center border-b-2 border-teal-500">
                    <h3 className="text-xl font-semibold text-white">{modalTitle}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    <form id="bkp-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="sm:col-span-2 sm:text-right">
                                <label htmlFor="tanggal" className="block text-sm font-medium text-gray-300 mb-1">Tanggal</label>
                                <input type="date" id="tanggal" value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                            </div>
                            <div>
                                <label htmlFor="kode-rincian" className="block text-sm font-medium text-gray-300 mb-1">Kode Rincian Belanja <span className="text-gray-500">(Optional)</span></label>
                                <input type="text" id="kode-rincian" value={kode} onChange={e => setKode(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" autoComplete="off" />
                            </div>
                            <div>
                                <label htmlFor="bukti" className="block text-sm font-medium text-gray-300 mb-1">Kode Transaksi</label>
                                <input type="text" id="bukti" value={bukti} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-400 focus:outline-none" readOnly />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="uraian" className="block text-sm font-medium text-gray-300 mb-1">Uraian Transaksi</label>
                            <textarea id="uraian" value={uraian} onChange={e => setUraian(e.target.value)} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" required placeholder="Contoh: Belanja Pulpen Boxy 1 Lusin" autoComplete="off"></textarea>
                        </div>

                        <div>
                            <label htmlFor="kategori-bkp" className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                            <input
                                type="text"
                                id="kategori-bkp"
                                list="kategori-list-bkp"
                                value={kategori}
                                onChange={e => setKategori(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Pilih atau ketik kategori baru"
                                required
                                autoComplete="off"
                            />
                            <datalist id="kategori-list-bkp">
                                {categories.map(cat => <option key={cat} value={cat} />)}
                            </datalist>
                        </div>

                        <div className="flex items-center">
                            <input id="isKredit" type="checkbox" checked={isKredit} onChange={() => setIsKredit(!isKredit)} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                            <label htmlFor="isKredit" className="ml-2 block text-sm text-gray-300">Tandai sebagai Kredit (Pengeluaran)</label>
                        </div>

                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">{isKredit ? 'Jumlah Kredit' : 'Jumlah Debet'}</label>
                            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="0" required />
                            <p className="text-xs text-gray-400 mt-1 italic capitalize">{terbilangText}</p>
                        </div>
                    </form>
                </div>
                
                <div className="flex-shrink-0 p-6 pt-4 flex justify-end gap-3 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors">Batal</button>
                    <button type="submit" form="bkp-form" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md transition-colors">{submitButtonText}</button>
                </div>
            </div>
        </div>
    );
};

export default BkpFormModal;
