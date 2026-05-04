// lib/storage.js
import { getTodayKey } from './utils';

const STORAGE_KEYS = {
  STUDENTS: 'attendance_students',
  ATTENDANCE: 'attendance_records',
};

// Helper to check if we are in the browser
const isBrowser = typeof window !== 'undefined';

export const storage = {
  // --- Students ---
  async getStudents() {
    if (!isBrowser) return [];
    
    // Try API first, fallback to localStorage
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('API fetch failed, using local storage');
    }

    const local = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return local ? JSON.parse(local) : [];
  },

  async saveStudent(student) {
    if (!isBrowser) return null;

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
      if (res.ok) {
        const newStudent = await res.json();
        const students = await this.getStudents();
        return newStudent;
      }
    } catch (e) {
      console.error('API save failed');
    }

    // Fallback to local
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const newStudent = { ...student, id: student.id || Date.now().toString() };
    students.push(newStudent);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return newStudent;
  },

  async deleteStudent(id) {
    if (!isBrowser) return false;

    try {
      const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      console.error('API delete failed');
    }

    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const filtered = students.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
    return true;
  },

  // --- Attendance ---
  async getAttendance() {
    if (!isBrowser) return [];

    let apiData = [];
    try {
      const res = await fetch('/api/attendance');
      if (res.ok) {
        apiData = await res.json();
      }
    } catch (e) {
      console.warn('API fetch failed');
    }

    const local = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const localData = local ? JSON.parse(local) : [];
    
    // Merge and remove duplicates by ID
    const merged = [...apiData, ...localData];
    const unique = Array.from(new Map(merged.map(item => [item.id || item.timestamp + item.studentId, item])).values());
    
    return unique.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async markAttendance(studentId, sessionCode) {
    if (!isBrowser) return { success: false, message: 'Browser only' };

    // More flexible session validation
    const today = getTodayKey();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (!sessionCode || (!sessionCode.includes(today) && !sessionCode.includes(yesterday))) {
      return { success: false, message: 'Буруу эсвэл хугацаа нь дууссан QR код байна' };
    }

    const attendance = await this.getAttendance();

    // Check for duplicate today
    const alreadyExists = attendance.some(record => 
      record.studentId === studentId && 
      record.timestamp.startsWith(today)
    );

    if (alreadyExists) {
      return { success: false, message: 'Таны ирц өнөөдөр аль хэдийн бүртгэгдсэн байна' };
    }

    // Get student name from local cache if possible
    const students = await this.getStudents();
    const student = students.find(s => s.studentId === studentId);
    
    const newRecord = {
      id: Date.now().toString(),
      studentId,
      studentName: student ? student.name : (this.getProfile()?.name || 'Unknown Student'),
      sessionCode,
      timestamp: new Date().toISOString(),
      status: 'Present'
    };

    // SAVE TO LOCAL IMMEDIATELY
    const local = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const localData = local ? JSON.parse(local) : [];
    localData.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(localData));

    // ATTEMPT API SAVE
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      if (res.ok) {
        return { success: true, message: 'Ирц амжилттай бүртгэгдлээ!', data: await res.json() };
      }
    } catch (e) {
      console.error('API attendance failed');
    }

    return { success: true, message: 'Ирц төхөөрөмж дээр хадгалагдлаа (Оффлайн)' };
  },

  // --- Student Profile (on their own device) ---
  setProfile(profile) {
    if (!isBrowser) return;
    localStorage.setItem('student_profile', JSON.stringify(profile));
  },

  getProfile() {
    if (!isBrowser) return null;
    const profile = localStorage.getItem('student_profile');
    return profile ? JSON.parse(profile) : null;
  },

  clearProfile() {
    if (!isBrowser) return;
    localStorage.removeItem('student_profile');
  }
};
