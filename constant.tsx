import React from 'react';
import type { SidebarMenuItem } from './types';
import { LayoutDashboard, Book, BookCopy, FileText, BarChart2, Repeat, FileCheck2, Archive, CreditCard } from 'lucide-react';

export const SIDEBAR_MENU: SidebarMenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Buku Kas Umum', icon: Book },
  { name: 'Buku Kas Pembantu', icon: BookCopy },
  { name: 'Peminjam', icon: FileText },
  { name: 'Setoran', icon: FileText },
  { name: 'Rekap Peminjam', icon: Archive },
  { name: 'Data Pembayaran Peminjam', icon: CreditCard },
  { name: 'Saldo Akhir', icon: BarChart2 },
  { name: 'Rekonsiliasi', icon: Repeat },
  { name: 'Laporan Rekonsiliasi Akhir', icon: FileCheck2 },
];