'use client';

import { useState, useEffect } from 'react';
import { Users, QrCode, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState({
    students: 0,
    attendance: 0,
    materials: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const [sRes, aRes, mRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/attendance'),
        fetch('/api/materials')
      ]);
      
      const sData = await sRes.json();
      const aData = await aRes.json();
      const mData = await mRes.json();

      setStats({
        students: sData.length,
        attendance: aData.length,
        materials: mData.length
      });
    };
    
    fetchData();
  }, []);

  const cards = [
    { title: 'Нийт оюутнууд', count: stats.students, icon: <Users size={32} />, color: 'bg-blue-500', link: '/students' },
    { title: 'Өнөөдрийн ирц', count: stats.attendance, icon: <Clock size={32} />, color: 'bg-green-500', link: '/attendance' },
    { title: 'Хичээлийн материал', count: stats.materials, icon: <BookOpen size={32} />, color: 'bg-purple-500', link: '/materials' },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Сайн байна уу?</h1>
      <p className="text-gray-600 mb-10">Системийн ерөнхий мэдээлэл болон хурдан холбоосууд.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {cards.map((card, idx) => (
          <Link key={idx} href={card.link}>
            <div className={`${card.color} text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition cursor-pointer`}>
              <div className="flex justify-between items-center mb-4">
                {card.icon}
                <span className="text-4xl font-bold">{card.count}</span>
              </div>
              <div className="text-lg font-medium opacity-90">{card.title}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <QrCode className="mr-2 text-indigo-600" /> Хурдан үйлдэл
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/attendance">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md">
              QR Код үүсгэх
            </button>
          </Link>
          <Link href="/students">
            <button className="bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition">
              Оюутан нэмэх
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
