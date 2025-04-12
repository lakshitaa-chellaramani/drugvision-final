import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Patient from '@/models/patient';
import Doctor from '@/models/doctor';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { role, email, password } = await req.json();

    await dbConnect();

    const user = role === 'doctor'
      ? await Doctor.findOne({ email })
      : await Patient.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({ id: user._id, role });

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
