'use client';

import { useState, useEffect } from 'react';
import { FilePlus, FileText, ExternalLink } from 'lucide-react';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'PDF',
    link: ''
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const res = await fetch('/api/materials');
    const data = await res.json();
    setMaterials(data);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setFormData({ title: '', type: 'PDF', link: '' });
      fetchMaterials();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Хичээлийн материал</h1>

      {/* Add Material Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FilePlus className="mr-2" /> Шинэ материал нэмэх
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="title"
            placeholder="Материалын нэр"
            value={formData.title}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
          >
            <option value="PDF">PDF</option>
            <option value="Slides">Slides</option>
            <option value="Document">Document</option>
            <option value="Video">Video</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            name="link"
            placeholder="Холбоос (URL) эсвэл замын нэр"
            value={formData.link}
            onChange={handleInputChange}
            className="border p-2 rounded w-full"
            required
          />
          <button type="submit" className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 md:col-span-3">
            Нэмэх
          </button>
        </form>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">Материал оруулаагүй байна</div>
        ) : (
          materials.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4">
              <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.type} • {new Date(item.dateAdded).toLocaleDateString()}</p>
                <a 
                  href={item.link.startsWith('http') ? item.link : '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline flex items-center text-sm font-medium"
                >
                  Үзэх <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
