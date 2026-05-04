import "./globals.css";
import Link from 'next/link';
import { Users, QrCode, BookOpen, LayoutDashboard, Clock } from 'lucide-react';

export const metadata = {
  title: "Оюутны удирдлага",
  description: "Оюутны ирц, материал удирдлагын систем",
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn" className="h-full bg-gray-50">
      <body className="h-full flex">
        {/* Sidebar */}
        <div className="w-64 bg-indigo-700 text-white flex flex-col">
          <div className="p-6 text-2xl font-bold border-b border-indigo-600">
            Student System
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/dashboard" className="flex items-center space-x-3 p-2 rounded hover:bg-indigo-600">
              <LayoutDashboard size={20} />
              <span>Хянах самбар</span>
            </Link>
            <Link href="/users" className="flex items-center space-x-3 p-2 rounded hover:bg-indigo-600">
              <Users size={20} />
              <span>Оюутнууд</span>
            </Link>
            <Link href="/qr-generator" className="flex items-center space-x-3 p-2 rounded hover:bg-indigo-600">
              <QrCode size={20} />
              <span>QR Код</span>
            </Link>
            <Link href="/scanner" className="flex items-center space-x-3 p-2 rounded hover:bg-indigo-600">
              <QrCode size={20} />
              <span>Сканнер</span>
            </Link>
            <Link href="/attendance" className="flex items-center space-x-3 p-2 rounded hover:bg-indigo-600">
              <Clock size={20} />
              <span>Ирцийн түүх</span>
            </Link>
            <Link href="/materials" className="flex items-center space-x-3 p-2 rounded hover:bg-indigo-600">
              <BookOpen size={20} />
              <span>Материалууд</span>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
