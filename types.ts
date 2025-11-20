
import type { LucideIcon } from 'lucide-react';

export interface SidebarMenuItem {
  name: string;
  icon: LucideIcon;
}

export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this should be a hash
  role: 'admin' | 'user';
}

export interface BkuData {
  id: string;
  tanggal: string; // ISO string format YYYY-MM-DD
  kode: string;
  uraian: string;
  kategori: string;
  penerimaan: number;
  pengeluaran: number;
  saldo: number;
  source?: 'BKP_SYNC';
}

export interface MonthlyData {
  name: string;
  penerimaan: number;
  realisasi: number;
  saldo?: number;
}

export interface CategoryData {
  name:string;
  value: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Penerimaan' | 'Realisasi';
  category: string;
}

export interface BkpData {
  id: string;
  tanggal: string;
  kode: string;
  bukti: string;
  uraian: string;
  kategori: string;
  debet: number;
  kredit: number;
  saldo: number;
  sourceId?: string;
}

export interface PeminjamData {
  id: string;
  tanggal: string;
  kodeRekening: string;
  nama: string;
  jumlahPinjaman: number;
  bunga: number;
  status: 'Lunas' | 'Belum Lunas';
  uraian: string;
}

export interface SetoranData {
  id: string;
  tanggal: string;
  kodeRekening: string;
  peminjamId: string;
  namaPeminjam: string;
  jumlahPinjaman: number;
  bunga: number;
  jumlahSetoran: number;
  pokok: number;
  uraian: string;
}

export interface ManualPayment {
  id: string; 
  peminjamId: string;
  year: number;
  month: number; // 0-11
  paymentId: string; // composite key: peminjamId-year-month used for logic lookup
}

export interface RekapData {
  peminjamId: string;
  namaPeminjam: string;
  totalSetoran: number;
  totalBunga: number;
  totalPokok: number;
  jumlahTransaksi: number;
  jumlahTidakBayar: number;
  sisaHutang: number;
  missedMonths: string[];
  paidMonths: string[];
}

export interface BreakdownData {
    category: string;
    total: number;
}

export interface ReconciliationHistoryEntry {
  id: string; // YYYY-MM format
  year: string;
  month: string;
  saldoAkhirBuku: number;
  saldoAkhirBank: number;
  selisih: number;
  status: 'Terekonsiliasi' | 'Selisih' | 'Belum Dilakukan';
}
// Fix: Add missing type definitions for Penerimaan and Pengeluaran, which were causing compilation errors in services/googleApiService.ts.
export interface Penerimaan {
  id: string;
  sumberDana: string;
  kategori: string;
  akun: string;
  status: 'Lunas' | 'Belum Lunas';
  jumlahPenerimaan: number;
  tahun: number;
  bulan: number;
}

export interface Pengeluaran {
  id: string;
  rekanan: string;
  kategori: string;
  akun: string;
  status: 'Lunas' | 'Belum Lunas';
  jumlahPengeluaran: number;
  tahun: number;
  bulan: number;
}