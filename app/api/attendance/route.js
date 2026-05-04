import { readData, writeData } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const attendance = readData('attendance');
  return NextResponse.json(attendance);
}

export async function POST(request) {
  const record = await request.json();
  const attendance = readData('attendance');
  
  const newRecord = {
    ...record,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  
  attendance.push(newRecord);
  writeData('attendance', attendance);
  
  return NextResponse.json(newRecord);
}
