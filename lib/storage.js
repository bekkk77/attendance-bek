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

    try {
      const res = await fetch('/api/attendance');
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('API fetch failed');
    }

    const local = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return local ? JSON.parse(local) : [];
  },

  async markAttendance(studentId, sessionCode) {
    if (!isBrowser) return { success: false, message: 'Browser only' };

    // In a real app, we'd verify the sessionCode matches today
    const today = getTodayKey();
    if (!sessionCode || !sessionCode.includes(today)) {
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

    // We need to fetch the student name for the record
    const students = await this.getStudents();
    const student = students.find(s => s.studentId === studentId);
    
    const newRecord = {
      studentId,
      studentName: student ? student.name : 'Unknown Student',
      sessionCode,
      timestamp: new Date().toISOString(),
      status: 'Present'
    };

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

    // Local fallback
    attendance.push({ ...newRecord, id: Date.now().toString() });
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    return { success: true, message: 'Ирц локал дээр бүртгэгдлээ (Оффлайн)' };
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
