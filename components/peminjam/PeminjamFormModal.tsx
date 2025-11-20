
import React, { useState, useEffect, useMemo } from 'react';
import type { PeminjamData } from '../../types';
import { X } from 'lucide-react';
import { numberToWords, formatCurrency } from '../../utils/formatters';

interface PeminjamFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<PeminjamData, 'id' | 'bunga' | 'status'>, id?: string) => void;
    entryToEdit?: PeminjamData | null;
    peminjamData: PeminjamData[];
}

const PeminjamFormModal: React.FC<PeminjamFormModalProps> = ({ isOpen, onClose, onSubmit, entryToEdit, peminjamData }) => {
    const [tanggal, setTanggal] = useState('');
    const [kodeRekening, setKodeRekening] = useState('');
    const [nama, setNama] = useState('');
    const [jumlahPinjaman, setJumlahPinjaman] = useState<number | string>('');
    const [uraian, setUraian] = useState('');

    const bunga = useMemo(() => {
        const amount = Number(jumlahPinjaman) || 0;
        return amount * 0.02;
    }, [jumlahPinjaman]);

    useEffect(() => {
        if (entryToEdit) {
            setTanggal(entryToEdit.tanggal);
            setKodeRekening(entryToEdit.kodeRekening);
            setNama(entryToEdit.nama);
            setJumlahPinjaman(entryToEdit.jumlahPinjaman);
            setUraian(entryToEdit.uraian);
        } else {
            // Reset form for new entry
            setTanggal('');
            setKodeRekening('');
            setNama('');
            setJumlahPinjaman('');
            setUraian('');
        }
    }, [entryToEdit, isOpen]);

    useEffect(() => {
        if (!entryToEdit && isOpen && tanggal) { // Only for new entries when modal is open and date is selected
            const date = new Date(`${tanggal}T00:00:00`); // Use local timezone to avoid date shifts
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const datePart = `${year}${month}${day}`;

            const countOnDate = peminjamData.filter(d => d.tanggal === tanggal).length;
            const sequence = (countOnDate + 1).toString().padStart(3, '0');

            setKodeRekening(`P${datePart}-${sequence}`);
        } else if (!entryToEdit) {
            setKodeRekening(''); // Clear code if no date is selected
        }
    }, [tanggal, isOpen, entryToEdit, peminjamData]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data: Omit<PeminjamData, 'id' | 'bunga' | 'status'> = {
            tanggal,
            kodeRekening,
            nama,
            jumlahPinjaman: Number(jumlahPinjaman) || 0,
            uraian,
        };
        onSubmit(data, entryToEdit?.id);
    };

    if (!isOpen) return null;

    const terbilangText = jumlahPinjaman ? numberToWords(Number(jumlahPinjaman)) + ' Rupiah' : 'Nol Rupiah';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-gray-700 animate-fade-in-up flex flex-col max-h-[90vh]">
                
                <div className="flex-shrink-0 p-6 pb-4 flex justify-between items-center border-b-2 border-teal-500">
                    <h3 className="text-xl font-semibold text-white">Data Peminjam Jinah TigaLikur</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form id="peminjam-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                     <div className="text-right">
                        <label htmlFor="tanggal" className="block text-sm font-medium text-gray-300 mb-1 text-left">Tanggal Pinjam</label>
                        <input type="date" id="tanggal" value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                    </div>
                     <div>
                        <label htmlFor="kodeRekening" className="block text-sm font-medium text-gray-300 mb-1">Kode Transaksi</label>
                        <input type="text" id="kodeRekening" value={kodeRekening} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-400 focus:outline-none" readOnly />
                    </div>
                     <div>
                        <label htmlFor="nama" className="block text-sm font-medium text-gray-300 mb-1">Nama Peminjam</label>
                        <input type="text" id="nama" value={nama} onChange={e => setNama(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" required placeholder="Nama lengkap peminjam" autoComplete="off" />
                    </div>
                    <div>
                        <label htmlFor="jumlah" className="block text-sm font-medium text-gray-300 mb-1">Jumlah Pinjaman</label>
                        <input type="number" id="jumlah" value={jumlahPinjaman} onChange={e => setJumlahPinjaman(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="0" required />
                        <p className="text-xs text-gray-400 mt-1 italic capitalize">{terbilangText}</p>
                    </div>
                     <div>
                        <label htmlFor="bunga" className="block text-sm font-medium text-gray-300 mb-1">Bunga (2%)</label>
                        <input type="text" id="bunga" value={formatCurrency(bunga)} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-300 focus:outline-none" readOnly />
                    </div>
                    <div>
                        <label htmlFor="uraian" className="block text-sm font-medium text-gray-300 mb-1">Uraian/Keterangan</label>
                        <textarea id="uraian" value={uraian} onChange={e => setUraian(e.target.value)} rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Contoh: Pinjaman untuk keperluan..." autoComplete="off"></textarea>
                    </div>
                </form>
                
                <div className="flex-shrink-0 p-6 pt-4 flex justify-end gap-3 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors">Batal</button>
                    <button type="submit" form="peminjam-form" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md transition-colors">{entryToEdit ? 'Simpan Perubahan' : 'Simpan'}</button>
                </div>
            </div>
        </div>
    );
};

export default PeminjamFormModal;
