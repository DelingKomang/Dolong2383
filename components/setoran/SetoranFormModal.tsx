
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { SetoranData, PeminjamData } from '../../types';
import { X, ChevronDown } from 'lucide-react';
import { numberToWords, formatCurrency } from '../../utils/formatters';

interface SetoranFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<SetoranData, 'id'>, id?: string) => void;
    entryToEdit?: SetoranData | null;
    peminjamData: PeminjamData[];
    setoranData: SetoranData[];
}

const allMonths = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const SetoranFormModal: React.FC<SetoranFormModalProps> = ({ isOpen, onClose, onSubmit, entryToEdit, peminjamData, setoranData }) => {
    const [tanggal, setTanggal] = useState('');
    const [kodeRekening, setKodeRekening] = useState('');
    const [peminjamId, setPeminjamId] = useState('');
    const [jumlahSetoran, setJumlahSetoran] = useState<number | string>('');
    const [uraian, setUraian] = useState('');
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const monthDropdownRef = useRef<HTMLDivElement>(null);

    const selectedPeminjam = useMemo(() => {
        return peminjamData.find(p => p.id === peminjamId);
    }, [peminjamId, peminjamData]);
    
    const jumlahPinjaman = selectedPeminjam?.jumlahPinjaman ?? 0;
    
    const bunga = useMemo(() => {
        const baseBunga = selectedPeminjam?.bunga ?? 0;
        const multiplier = selectedMonths.length > 0 ? selectedMonths.length : 1;
        return baseBunga * multiplier;
    }, [selectedPeminjam, selectedMonths]);

    const pokok = useMemo(() => {
        return (Number(jumlahSetoran) || 0) - bunga;
    }, [jumlahSetoran, bunga]);

    useEffect(() => {
        if (entryToEdit) {
            setTanggal(entryToEdit.tanggal);
            setKodeRekening(entryToEdit.kodeRekening);
            setPeminjamId(entryToEdit.peminjamId);
            setJumlahSetoran(entryToEdit.jumlahSetoran);
            setUraian(entryToEdit.uraian);
        } else {
            setTanggal('');
            setKodeRekening('');
            setPeminjamId('');
            setJumlahSetoran('');
            setUraian('');
        }
        setSelectedMonths([]);
    }, [entryToEdit, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
                setIsMonthDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!entryToEdit && isOpen && tanggal) {
            const date = new Date(`${tanggal}T00:00:00`);
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const datePart = `${year}${month}${day}`;

            const countOnDate = setoranData.filter(d => d.tanggal === tanggal).length;
            const sequence = (countOnDate + 1).toString().padStart(3, '0');

            setKodeRekening(`S${datePart}-${sequence}`);
        } else if (!entryToEdit) {
            setKodeRekening('');
        }
    }, [tanggal, isOpen, entryToEdit, setoranData]);

    useEffect(() => {
        if (!entryToEdit) {
            if (selectedMonths.length > 0) {
                 const sortedMonths = selectedMonths.sort((a, b) => allMonths.indexOf(a) - allMonths.indexOf(b));
                 setUraian(`Setoran Bulan ${sortedMonths.join(', ')}`);
            } else if (tanggal) {
                 const monthName = new Date(tanggal + 'T00:00:00').toLocaleString('id-ID', { month: 'long' });
                 setUraian(`Setoran Bulan ${monthName}`);
            } else {
                 setUraian('');
            }
        }
    }, [tanggal, selectedMonths, entryToEdit]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPeminjam) {
            alert("Silakan pilih peminjam terlebih dahulu.");
            return;
        }
        const data: Omit<SetoranData, 'id'> = {
            tanggal,
            kodeRekening,
            peminjamId,
            namaPeminjam: selectedPeminjam.nama,
            jumlahPinjaman,
            bunga,
            jumlahSetoran: Number(jumlahSetoran) || 0,
            pokok,
            uraian,
        };
        onSubmit(data, entryToEdit?.id);
    };

    const handleMonthChange = (month: string) => {
        setSelectedMonths(prev =>
            prev.includes(month)
                ? prev.filter(m => m !== month)
                : [...prev, month]
        );
    };

    if (!isOpen) return null;

    const terbilangText = jumlahSetoran ? numberToWords(Number(jumlahSetoran)) + ' Rupiah' : 'Nol Rupiah';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl m-4 border border-gray-700 animate-fade-in-up flex flex-col max-h-[95vh]">
                <div className="flex-shrink-0 p-6 pb-4 flex justify-between items-center border-b-2 border-teal-500">
                    <h3 className="text-xl font-semibold text-white">{entryToEdit ? 'Edit Data Setoran' : 'Buat Data Setoran Baru'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                    <form id="setoran-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Column 1: Basic Info */}
                        <div className="space-y-4">
                             <h4 className="text-teal-400 font-semibold border-b border-gray-700 pb-2 mb-3">Informasi Peminjam</h4>
                            <div>
                                <label htmlFor="tanggal" className="block text-sm font-medium text-gray-300 mb-1">Tanggal Setor</label>
                                <input type="date" id="tanggal" value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                            </div>
                            <div>
                                <label htmlFor="kodeRekening" className="block text-sm font-medium text-gray-300 mb-1">Kode Transaksi (Auto)</label>
                                <input type="text" id="kodeRekening" value={kodeRekening} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-400 focus:outline-none" readOnly />
                            </div>
                            <div>
                                <label htmlFor="peminjam" className="block text-sm font-medium text-gray-300 mb-1">Nama Peminjam</label>
                                <select id="peminjam" value={peminjamId} onChange={e => setPeminjamId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                                    <option value="" disabled>-- Pilih Peminjam --</option>
                                    {peminjamData.map(p => (
                                        <option key={p.id} value={p.id}>{p.nama}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Total Pinjaman Awal</label>
                                <div className="bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-300 font-mono text-right">
                                    {formatCurrency(jumlahPinjaman)}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Payment Details */}
                        <div className="space-y-4">
                            <h4 className="text-teal-400 font-semibold border-b border-gray-700 pb-2 mb-3">Rincian Pembayaran</h4>
                            
                            <div>
                                <label htmlFor="bayar-bulan" className="block text-sm font-medium text-gray-300 mb-1">Untuk Pembayaran Bulan</label>
                                <div className="relative" ref={monthDropdownRef}>
                                    <button
                                        type="button"
                                        id="bayar-bulan"
                                        onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 flex justify-between items-center text-left"
                                    >
                                        <span className="truncate">
                                            {selectedMonths.length === 0 ? 'Pilih bulan...' : selectedMonths.sort((a, b) => allMonths.indexOf(a) - allMonths.indexOf(b)).join(', ')}
                                        </span>
                                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isMonthDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {allMonths.map(month => (
                                                <label key={month} className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-gray-600 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMonths.includes(month)}
                                                        onChange={() => handleMonthChange(month)}
                                                        className="h-4 w-4 rounded border-gray-500 text-teal-600 focus:ring-teal-500 bg-gray-800"
                                                    />
                                                    <span className="ml-3">{month}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="jumlahSetoran" className="block text-sm font-medium text-gray-300 mb-1">Jumlah Setoran (Total)</label>
                                <div className="relative">
                                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">Rp</span>
                                    <input 
                                        type="number" 
                                        id="jumlahSetoran" 
                                        value={jumlahSetoran} 
                                        onChange={e => setJumlahSetoran(e.target.value)} 
                                        className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-lg text-right" 
                                        placeholder="0" 
                                        required 
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1 italic capitalize text-right">{terbilangText}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-gray-700/30 p-3 rounded-lg border border-gray-700">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Alokasi Bunga</label>
                                    <div className="text-orange-400 font-mono text-right font-semibold">{formatCurrency(bunga)}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Alokasi Pokok</label>
                                    <div className="text-green-400 font-mono text-right font-semibold">{formatCurrency(pokok)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Full Width Uraian */}
                        <div className="md:col-span-2">
                            <label htmlFor="uraian" className="block text-sm font-medium text-gray-300 mb-1">Uraian / Keterangan</label>
                            <textarea id="uraian" value={uraian} onChange={e => setUraian(e.target.value)} rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" required autoComplete="off"></textarea>
                        </div>
                    </form>
                </div>
                <div className="flex-shrink-0 p-6 pt-4 flex justify-end gap-3 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors">Batal</button>
                    <button type="submit" form="setoran-form" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md transition-colors">{entryToEdit ? 'Simpan Perubahan' : 'Simpan'}</button>
                </div>
            </div>
        </div>
    );
};

export default SetoranFormModal;
