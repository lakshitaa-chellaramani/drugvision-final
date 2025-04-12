import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Patient from '@/models/patient';
import Doctor from '@/models/doctor';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, name, email, password, ...extra } = body;

    await dbConnect();

    const existingUser = role === 'doctor'
      ? await Doctor.findOne({ email })
      : await Patient.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    if (role === 'doctor') {
      await Doctor.create({
        name,
        email,
        password: hashed,
        medicalLicense: extra.medicalLicense,
        specialty: extra.specialty,
      });
    } else {
      await Patient.create({
        name,
        email,
        password: hashed,
        dateOfBirth: extra.dateOfBirth,
        allergies: extra.allergies || [],
        chronicDiseases: extra.chronicDiseases || [],
      });
    }

    return NextResponse.json({ message: `${role} registered successfully` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
