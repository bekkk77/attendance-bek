'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, CheckCircle, Users } from 'lucide-react';

export default function AttendancePage() {
  const [qrData, setQrData] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [studentId, setStudentId] = useState('');
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchRecords();
    generateQR();
  }, []);

  const fetchRecords = async () => {
    const res = await fetch('/api/attendance');
    const data = await res.json();
    setRecords(data.reverse().slice(0, 10)); // Last 10 records
  };

  const generateQR = async () => {
    const today = new Date().toISOString().split('T')[0];
    const sessionData = `SESSION-${today}`;
    setQrData(sessionData);
    try {
      const url = await QRCode.toDataURL(sessionData);
      setQrImageUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    if (!studentId) return;

    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        studentId, 
        session: qrData,
        status: 'Present'
      }),
    });

    if (res.ok) {
      setStatus(`Оюутан ${studentId} ирц бүртгэгдлээ!`);
      setStudentId('');
      fetchRecords();
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Ирц бүртгэлийн QR систем</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* QR Generation Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <QrCode className="mr-2 text-indigo-600" /> Өнөөдрийн QR код
          </h2>
          <div className="bg-gray-100 p-4 rounded-lg mb-4 border-2 border-dashed border-gray-300">
            {qrImageUrl ? (
              <img src={qrImageUrl} alt="Attendance QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-gray-400">QR ачаалж байна...</div>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-2">Хичээлийн ID: <span className="font-mono font-bold text-indigo-600">{qrData}</span></p>
          <button onClick={generateQR} className="text-sm text-indigo-600 hover:underline">Шинээр үүсгэх</button>
        </div>

        {/* Manual Scan/Registration Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="mr-2 text-green-600" /> Ирц бүртгэх
          </h2>
          <p className="text-sm text-gray-600 mb-6">Оюутан QR уншуулж чадахгүй бол энд кодыг нь гараар оруулж болно.</p>
          
          <form onSubmit={handleManualEntry} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Оюутны код</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Ж: 22D001"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
              Бүртгэх
            </button>
          </form>

          {status && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center text-sm font-medium animate-pulse">
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <Users className="mr-2 text-indigo-600" /> Сүүлийн ирцүүд
          </h2>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-bold">Сүүлийн 10</span>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Оюутны код</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сесси</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цаг</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Төлөв</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {records.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">Одоогоор ирц бүртгэгдээгүй байна</td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{record.studentId}</td>
                  <td className="px-6 py-4 text-gray-500">{record.session}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(record.timestamp).toLocaleTimeString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">
                      Present
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
