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
      <body className="h-full flex flex-col md:flex-row">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex w-64 bg-indigo-700 text-white flex-col h-screen sticky top-0">
          <div className="p-6 text-2xl font-bold border-b border-indigo-600">
            Student System
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Хянах самбар" />
            <NavItem href="/users" icon={<Users size={20} />} label="Оюутнууд" />
            <NavItem href="/qr-generator" icon={<QrCode size={20} />} label="QR Код" />
            <NavItem href="/scanner" icon={<QrCode size={20} />} label="Сканнер" />
            <NavItem href="/attendance" icon={<Clock size={20} />} label="Ирцийн түүх" />
            <NavItem href="/materials" icon={<BookOpen size={20} />} label="Материалууд" />
          </nav>
        </aside>

        {/* Bottom Navigation for Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center px-2 py-3 z-50">
          <MobileNavItem href="/dashboard" icon={<LayoutDashboard size={24} />} label="Самбар" />
          <MobileNavItem href="/users" icon={<Users size={24} />} label="Оюутан" />
          <MobileNavItem href="/scanner" icon={<QrCode size={24} />} label="Скан" />
          <MobileNavItem href="/attendance" icon={<Clock size={24} />} label="Ирц" />
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }) {
  return (
    <Link href={href} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-indigo-600 transition-colors">
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({ href, icon, label }) {
  return (
    <Link href={href} className="flex flex-col items-center space-y-1 text-gray-500 hover:text-indigo-600 active:text-indigo-700">
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
