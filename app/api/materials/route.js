import { readData, writeData } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const materials = readData('materials');
  return NextResponse.json(materials);
}

export async function POST(request) {
  const material = await request.json();
  const materials = readData('materials');
  
  const newMaterial = {
    ...material,
    id: Date.now().toString(),
    dateAdded: new Date().toISOString(),
  };
  
  materials.push(newMaterial);
  writeData('materials', materials);
  
  return NextResponse.json(newMaterial);
}
