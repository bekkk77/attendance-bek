'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Trash2, UserPlus, Search, Mail, Phone, Hash, ChevronRight, User } from 'lucide-react';
import Notification from '@/components/Notification';

export default function UsersPage() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', studentId: '', email: '', phone: '' });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const data = await storage.getStudents();
    setStudents(data);
  };

  const showNotify = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.studentId) {
      showNotify('Нэр болон оюутны код шаардлагатай', 'error');
      return;
    }
    const result = await storage.saveStudent(formData);
    if (result) {
      showNotify('Оюутан амжилттай нэмэгдлээ');
      setFormData({ name: '', studentId: '', email: '', phone: '' });
      setShowForm(false);
      loadStudents();
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Энэ оюутныг устгахдаа итгэлтэй байна уу?')) {
      const ok = await storage.deleteStudent(id);
      if (ok) {
        showNotify('Оюутан устгагдлаа');
        loadStudents();
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Оюутнууд</h1>
          <p className="text-gray-500 mt-1">Нийт {students.length} оюутан бүртгэлтэй.</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Хайх..." 
              className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="md:hidden bg-indigo-600 text-white p-3 rounded-2xl shadow-lg active:scale-90 transition-all"
          >
            <UserPlus size={24} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
        {/* Registration Form (Sidebar on Desktop, Modal-like on Mobile) */}
        <div className={`${showForm ? 'block' : 'hidden'} md:block bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-fit sticky top-8 animate-in slide-in-from-bottom-4 duration-300`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <UserPlus className="mr-2 text-indigo-600" /> Шинэ оюутан
            </h2>
            <button onClick={() => setShowForm(false)} className="md:hidden text-gray-400">Хаах</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput label="Нэр" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Бат-Эрдэнэ" />
            <FormInput label="Оюутны код" name="studentId" value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} placeholder="22D001" />
            <FormInput label="Э-майл" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="bat@example.com" type="email" />
            <FormInput label="Утас" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="9911..." />
            <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all mt-4">
              Хадгалах
            </button>
          </form>
        </div>

        {/* Student List */}
        <div className="space-y-3">
          {filteredStudents.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-100 text-center text-gray-400 italic">Оюутан олдсонгүй</div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student.id} className="bg-white p-4 md:p-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between hover:border-indigo-200 transition-all group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">{student.name?.charAt(0)}</div>
                  <div>
                    <div className="font-bold text-gray-900 text-base md:text-lg">{student.name}</div>
                    <div className="text-xs text-gray-500 flex items-center mt-0.5 font-medium">
                      <Hash size={12} className="mr-1 opacity-50" /> {student.studentId}
                      {student.phone && <span className="mx-2 opacity-20">|</span>}
                      {student.phone && <Phone size={12} className="mr-1 opacity-50" />} {student.phone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDelete(student.id)}
                    className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, message: '' })} />
    </div>
  );
}

function FormInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
      <input
        {...props}
        className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm font-medium"
      />
    </div>
  );
}
