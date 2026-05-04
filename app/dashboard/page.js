'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, BookOpen, QrCode, TrendingUp } from 'lucide-react';
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
    { title: 'Нийт оюутнууд', count: stats.students, icon: <Users size={28} />, color: 'from-blue-500 to-blue-600', link: '/users' },
    { title: 'Өнөөдрийн ирц', count: stats.attendanceToday, icon: <Clock size={28} />, color: 'from-green-500 to-green-600', link: '/attendance' },
    { title: 'Материалууд', count: stats.materials, icon: <BookOpen size={28} />, color: 'from-purple-500 to-purple-600', link: '/materials' },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Хянах самбар</h1>
        <p className="text-gray-500 mt-2">Системийн ерөнхий мэдээлэл болон хурдан холбоосууд.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <Link key={idx} href={card.link}>
            <div className={`bg-gradient-to-br ${card.color} text-white p-6 rounded-3xl shadow-xl transform hover:scale-[1.02] transition-all cursor-pointer border border-white/10`}>
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  {card.icon}
                </div>
                <span className="text-4xl font-bold">{card.count}</span>
              </div>
              <div className="text-lg font-medium opacity-90">{card.title}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <TrendingUp className="mr-3 text-indigo-600" /> Хурдан үйлдэл
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/scanner" className="group p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <QrCode size={24} />
              </div>
              <div>
                <div className="font-bold text-gray-900">Сканнердах</div>
                <div className="text-xs text-gray-500">Камер ажиллуулах</div>
              </div>
            </Link>
            <Link href="/users" className="group p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all flex items-center space-x-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <div>
                <div className="font-bold text-gray-900">Оюутан нэмэх</div>
                <div className="text-xs text-gray-500">Шинэ бүртгэл</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Clock className="mr-3 text-indigo-600" /> Сүүлийн ирцүүд
          </h2>
          <div className="space-y-4">
            {recentAttendance.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">Одоогоор ирц бүртгэгдээгүй байна</p>
            ) : (
              recentAttendance.map((record, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {record.studentName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{record.studentName}</div>
                      <div className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Бүртгэгдсэн</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
