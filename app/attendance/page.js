'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { formatDate, formatTime } from '@/lib/utils';
import { Search, Calendar, User, Clock, Filter, Download } from 'lucide-react';

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const data = await storage.getAttendance();
    // Sort by timestamp descending (newest first)
    setRecords(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = filterDate ? record.timestamp.startsWith(filterDate) : true;
    
    return matchesSearch && matchesDate;
  });

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Оюутан,Код,Огноо,Цаг,Төлөв\n"
      + filteredRecords.map(r => `${r.studentName},${r.studentId},${formatDate(r.timestamp)},${formatTime(r.timestamp)},${r.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Ирцийн түүх</h1>
          <p className="text-gray-500 mt-2">Нийт {records.length} бүртгэл олдлоо.</p>
        </div>
        <button 
          onClick={exportData}
          className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
        >
          <Download size={20} />
          <span>CSV Татах</span>
        </button>
      </header>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Оюутны нэр эсвэл кодоор хайх..." 
            className="pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="date" 
            className="pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none w-full"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setSearchTerm(''); setFilterDate(''); }}
          className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-2xl py-3 transition-colors flex items-center justify-center"
        >
          <Filter size={18} className="mr-2" /> Шүүлтүүр цэвэрлэх
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Оюутан</th>
                <th className="px-8 py-5 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Огноо</th>
                <th className="px-8 py-5 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Цаг</th>
                <th className="px-8 py-5 text-right text-xs font-extrabold text-gray-500 uppercase tracking-wider">Төлөв</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-gray-500 italic">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                        <Clock size={32} />
                      </div>
                      Бүртгэл олдсонгүй
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold">
                          {record.studentName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{record.studentName}</div>
                          <div className="text-xs text-gray-500 font-mono uppercase tracking-tighter">{record.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={14} className="mr-2 opacity-50" />
                        {formatDate(record.timestamp)}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock size={14} className="mr-2 opacity-50" />
                        {formatTime(record.timestamp)}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-extrabold rounded-full uppercase tracking-widest border border-green-200">
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
   </div>
      </div>
    </div>
  );
}
