'use client';

import { useState, useEffect, useRef } from 'react';
import { storage } from '@/lib/storage';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Camera, RefreshCw, CheckCircle, AlertCircle, User, LogOut } from 'lucide-react';
import Notification from '@/components/Notification';

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [profile, setProfile] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', studentId: '' });
  const [status, setStatus] = useState({ message: '', type: 'info' });
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  
  const scannerRef = useRef(null);
  const lastScanTime = useRef(0);

  useEffect(() => {
    setMounted(true);
    const savedProfile = storage.getProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, []);

  const showNotify = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileForm.studentId) return;
    storage.setProfile(profileForm);
    setProfile(profileForm);
    showNotify('Профайл хадгалагдлаа. Одоо QR уншуулж болно.');
  };

  const handleLogout = () => {
    storage.clearProfile();
    setProfile(null);
    if (scanning) stopScan();
  };

  const startScan = async () => {
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      setScanning(true);
      setStatus({ message: 'Багшийн үзүүлсэн QR кодыг уншуулна уу...', type: 'info' });

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Silent failure for frame-by-frame scanning errors
        }
      );
    } catch (err) {
      console.error("Scanner start error:", err);
      setStatus({ message: 'Камераа нээж чадсангүй: ' + err, type: 'error' });
      setScanning(false);
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Stop error:", err);
      }
    }
    setScanning(false);
  };

  const handleScanSuccess = async (sessionCode) => {
    const now = Date.now();
    if ((now - lastScanTime.current) < 5000) return; // 5s cooldown
    lastScanTime.current = now;

    // Optional: Stop scanner on success
    // stopScan();
    
    setStatus({ message: 'Бүртгэж байна...', type: 'info' });
    
    const result = await storage.markAttendance(profile.studentId, sessionCode);
    
    if (result.success) {
      showNotify(result.message, 'success');
      setStatus({ message: result.message, type: 'success' });
      // Resume info message after success feedback
      setTimeout(() => setStatus({ message: 'Дараагийн кодыг уншуулж болно.', type: 'info' }), 3000);
    } else {
      showNotify(result.message, 'error');
      setStatus({ message: result.message, type: 'error' });
      setTimeout(() => setStatus({ message: 'QR кодыг камерт харуулна уу...', type: 'info' }), 3000);
    }
  };

  if (!mounted) return <div className="p-10 text-center text-gray-400">Ачаалж байна...</div>;

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white p-8 rounded-[35px] shadow-2xl border border-gray-100">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
            <User size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Эхлээд өөрийгөө тодорхойлно уу</h1>
          <p className="text-gray-500 mb-8 text-sm">Ирц бүртгүүлэхийн тулд нэр болон оюутны кодоо оруулна уу.</p>
          
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Нэр</label>
              <input
                type="text"
                placeholder="Ж: Бат-Эрдэнэ"
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Оюутны код</label>
              <input
                type="text"
                placeholder="Ж: 22D001"
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={profileForm.studentId}
                onChange={(e) => setProfileForm({ ...profileForm, studentId: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
              Үргэлжлүүлэх
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">QR Сканнер</h1>
          <div className="flex items-center space-x-2 text-indigo-600 font-medium mt-1">
            <User size={16} />
            <span>{profile.name} ({profile.studentId})</span>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition flex items-center">
          <LogOut size={14} className="mr-2" /> Гарах
        </button>
      </header>

      <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 flex flex-col items-center">
        {/* Scanner Window */}
        <div className="relative w-full aspect-square max-w-[500px] rounded-[30px] overflow-hidden bg-black shadow-inner border-4 border-gray-100 mb-8">
          <div id="reader" className="w-full h-full"></div>
          
          {scanning && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-indigo-400 rounded-3xl animate-pulse"></div>
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-scan-line"></div>
            </div>
          )}
          
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-10 text-center bg-black/50 backdrop-blur-sm z-20">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4">
                <Camera size={40} className="text-white/60" />
              </div>
              <p className="text-lg font-medium opacity-80">Скан хийхэд бэлэн</p>
            </div>
          )}
        </div>

        <div className={`w-full max-w-[500px] p-4 rounded-2xl mb-8 flex items-center space-x-3 transition-all ${
          status.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
          status.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
          'bg-indigo-50 text-indigo-700 border border-indigo-100'
        }`}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold">{status.message || 'Сканнердахыг хүлээнэ үү'}</span>
        </div>

        <button
          onClick={scanning ? stopScan : startScan}
          className={`w-full max-w-[500px] flex items-center justify-center space-x-3 p-5 rounded-2xl font-black text-xl transition-all shadow-lg z-30 ${
            scanning 
              ? 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200 shadow-red-100' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
          }`}
        >
          {scanning ? <RefreshCw className="animate-spin" size={24} /> : <QrCode size={24} />}
          <span>{scanning ? 'Зогсоох' : 'Сканнердах'}</span>
        </button>
      </div>

      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, message: '' })} />

      <style jsx global>{`
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 24px;
        }
        #reader__dashboard_section_csr button {
          display: none !important;
        }
        @keyframes scan-line { 0% { top: 20%; } 100% { top: 80%; } }
        .animate-scan-line { animation: scan-line 2s ease-in-out infinite alternate; }
      `}</style>
    </div>
  );
}
