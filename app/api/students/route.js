import { readData, writeData } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const students = readData('students');
  return NextResponse.json(students);
}

export async function POST(request) {
  const student = await request.json();
  const students = readData('students');
  
  const newStudent = {
    ...student,
    id: student.id || Date.now().toString(),
  };
  
  students.push(newStudent);
  writeData('students', students);
  
  return NextResponse.json(newStudent);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }
  
  let students = readData('students');
  students = students.filter(s => s.id !== id);
  writeData('students', students);
  
  return NextResponse.json({ success: true });
}
