import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Medication from '@/models/medication';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const medication = await Medication.create(body);
    return NextResponse.json(medication, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create medication', details: error }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    const filter = patientId ? { patient: patientId } : {};
    const medications = await Medication.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(medications, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch medications', details: error }, { status: 500 });
  }
}
