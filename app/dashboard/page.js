'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, BookOpen, QrCode, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { getTodayKey } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    attendanceToday: 0,
    materials: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      const students = await storage.getStudents();
      const attendance = await storage.getAttendance();
      const today = getTodayKey();
      const resMaterials = await fetch('/api/materials');
      const materials = resMaterials.ok ? await resMaterials.json() : [];
      const todayAttendance = attendance.filter(r => r.timestamp.startsWith(today));

      setStats({
        students: students.length,
        attendanceToday: todayAttendance.length,
        materials: materials.length
      });
      setRecentAttendance(attendance.reverse().slice(0, 5));
    };
    fetchData();
  }, []);

  const cards = [
    { title: 'Нийт оюутнууд', count: stats.students, icon: <Users size={24} />, color: 'from-blue-500 to-blue-600', link: '/users' },
    { title: 'Өнөөдрийн ирц', count: stats.attendanceToday, icon: <Clock size={24} />, color: 'from-green-500 to-green-600', link: '/attendance' },
    { title: 'Материалууд', count: stats.materials, icon: <BookOpen size={24} />, color: 'from-purple-500 to-purple-600', link: '/materials' },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Хянах самбар</h1>
        <p className="text-gray-500 mt-1">Системийн ерөнхий мэдээлэл болон холбоосууд.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {cards.map((card, idx) => (
          <Link key={idx} href={card.link}>
            <div className={`bg-gradient-to-br ${card.color} text-white p-5 md:p-6 rounded-[2rem] shadow-xl transform active:scale-95 transition-all cursor-pointer border border-white/10 relative overflow-hidden group`}>
              <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">{card.icon}</div>
                <span className="text-4xl font-black tracking-tighter">{card.count}</span>
              </div>
              <div className="text-lg font-bold opacity-90 relative z-10 flex items-center">
                {card.title} <ChevronRight size={16} className="ml-1 opacity-50" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Quick Actions */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center">
            <TrendingUp className="mr-3 text-indigo-600" /> Хурдан үйлдэл
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <QuickActionLink href="/scanner" color="bg-indigo-100" textColor="text-indigo-600" hoverBorder="hover:border-indigo-500" hoverBg="hover:bg-indigo-50" icon={<QrCode size={24} />} title="Сканнердах" desc="Камер ажиллуулах" />
            <QuickActionLink href="/users" color="bg-green-100" textColor="text-green-600" hoverBorder="hover:border-green-500" hoverBg="hover:bg-green-50" icon={<Users size={24} />} title="Оюутан нэмэх" desc="Шинэ бүртгэл" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center">
            <Clock className="mr-3 text-indigo-600" /> Сүүлийн ирцүүд
          </h2>
          <div className="space-y-3">
            {recentAttendance.length === 0 ? (
              <p className="text-gray-500 italic text-center py-6">Одоогоор ирц бүртгэгдээгүй байна</p>
            ) : (
              recentAttendance.map((record, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 active:bg-gray-50 rounded-2xl transition-colors border border-transparent active:border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">{record.studentName?.charAt(0) || 'S'}</div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{record.studentName}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-100">OK</span>
                </div>
              ))
            )}
            <Link href="/attendance" className="block text-center text-xs font-bold text-indigo-600 hover:underline pt-2">Бүх ирцийг харах</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionLink({ href, color, textColor, hoverBorder, hoverBg, icon, title, desc }) {
  return (
    <Link href={href} className={`group p-4 border-2 border-dashed border-gray-100 rounded-2xl ${hoverBorder} ${hoverBg} transition-all flex items-center space-x-4 active:scale-95`}>
      <div className={`p-3 ${color} ${textColor} rounded-xl group-hover:scale-110 transition-transform`}>{icon}</div>
      <div>
        <div className="font-bold text-gray-900 text-sm">{title}</div>
        <div className="text-[10px] text-gray-400 font-medium">{desc}</div>
      </div>
    </Link>
  );
}
