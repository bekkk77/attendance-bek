'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { storage } from '@/lib/storage';
import { getTodayKey } from '@/lib/utils';
import { QrCode, Download, Printer, RefreshCw, Calendar } from 'lucide-react';

export default function QrGeneratorPage() {
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    generateSessionQR();
  }, []);

  const generateSessionQR = async () => {
    const today = getTodayKey();
    const code = `ATTENDANCE_SESSION_${today}`;
    setSessionCode(code);
    
    try {
      const url = await QRCode.toDataURL(code, {
        width: 600,
        margin: 2,
        color: {
          dark: '#3730a3', // indigo-800
          light: '#ffffff',
        },
      });
      setQrImageUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadQR = () => {
    if (!qrImageUrl) return;
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `Attendance_QR_${getTodayKey()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Хичээлийн QR Код</h1>
        <p className="text-gray-500 mt-2">Оюутнууд энэхүү кодыг уншуулж ирцээ бүртгүүлнэ.</p>
      </header>

      <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 flex flex-col items-center">
        <div className="bg-indigo-50 px-6 py-3 rounded-2xl flex items-center space-x-3 mb-8 border border-indigo-100">
          <Calendar className="text-indigo-600" size={20} />
          <span className="font-bold text-indigo-900">{new Date().toLocaleDateString('mn-MN')} - Өнөөдөр</span>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[40px] blur-xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 flex flex-col items-center">
            {qrImageUrl ? (
              <>
                <img src={qrImageUrl} alt="Session QR" className="w-80 h-80 sm:w-96 sm:h-96" />
                <div className="mt-6 text-center">
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Session Code</div>
                  <div className="text-lg font-black text-indigo-900 tracking-tighter">{sessionCode}</div>
                </div>
              </>
            ) : (
              <div className="w-80 h-80 flex items-center justify-center">
                <RefreshCw className="animate-spin text-indigo-600" size={48} />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mt-12">
          <button 
            onClick={downloadQR}
            className="flex items-center justify-center space-x-3 bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-100"
          >
            <Download size={20} />
            <span>Татах (PNG)</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-100 text-gray-700 p-4 rounded-2xl font-bold hover:bg-gray-50 transition"
          >
            <Printer size={20} />
            <span>Хэвлэх</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><QrCode size={24} /></div>
          <div>
            <div className="text-xs text-gray-500">Төрөл</div>
            <div className="font-bold">Байнгын (Өдрийн)</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Calendar size={24} /></div>
          <div>
            <div className="text-xs text-gray-500">Хугацаа</div>
            <div className="font-bold">24 Цаг</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><RefreshCw size={24} /></div>
          <div>
            <div className="text-xs text-gray-500">Статус</div>
            <div className="font-bold">Идэвхтэй</div>
          </div>
        </div>
      </div>
    </div>
  );
}
