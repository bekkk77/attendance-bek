'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Trash2, UserPlus, Search, Mail, Phone, Hash } from 'lucide-react';
import Notification from '@/components/Notification';

export default function UsersPage() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: ''
  });

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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.studentId) {
      showNotify('Нэр болон оюутны код заавал шаардлагатай', 'error');
      return;
    }

    const result = await storage.saveStudent(formData);
    if (result) {
      showNotify('Оюутан амжилттай нэмэгдлээ');
      setFormData({ name: '', studentId: '', email: '', phone: '' });
      loadStudents();
    } else {
      showNotify('Алдаа гарлаа. Дахин оролдоно уу', 'error');
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
    s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Оюутны удирдлага</h1>
          <p className="text-gray-500">Нийт {students.length} оюутан бүртгэлтэй байна.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Хайх..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
        {/* Registration Form */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit sticky top-8">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <UserPlus className="mr-2 text-indigo-600" /> Шинэ оюутан нэмэх
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ж: Бат-Эрдэнэ"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Оюутны код</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ж: 22D001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Э-майл</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="bat@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Утас</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="9911..."
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100">
              Хадгалах
            </button>
          </form>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Оюутан</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Мэдээлэл</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-gray-500 italic">Оюутан олдсонгүй</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-indigo-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Hash size={12} className="mr-1" /> {student.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 flex flex-col space-y-1">
                        {student.email && <div className="flex items-center"><Mail size={14} className="mr-2 opacity-60" /> {student.email}</div>}
                        {student.phone && <div className="flex items-center"><Phone size={14} className="mr-2 opacity-60" /> {student.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ ...notification, message: '' })} 
      />
    </div>
  );
}
