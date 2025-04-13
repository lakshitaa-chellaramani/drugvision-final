import { dbConnect } from '@/lib/dbConnect';
import Adherence from '@/models/adherence';
import { NextRequest } from 'next/server';
import { Types } from 'mongoose';

interface AdherenceBody {
  medicationId: string;
  date: string; // format: YYYY-MM-DD
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  taken?: boolean;
  note?: string;
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const medicationId = searchParams.get('medicationId');
  const date = searchParams.get('date');

  const query: Record<string, any> = {};
  if (medicationId && Types.ObjectId.isValid(medicationId)) {
    query.medicationId = medicationId;
  }
  if (date) query.date = date;

  try {
    const logs = await Adherence.find(query);
    return Response.json(logs);
  } catch (error) {
    return new Response('Error fetching adherence logs', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = (await req.json()) as AdherenceBody;

  try {
    const updated = await Adherence.findOneAndUpdate(
      {
        medicationId: body.medicationId,
        date: body.date,
        timeOfDay: body.timeOfDay,
      },
      {
        ...body,
        timestamp: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    return Response.json(updated);
  } catch (err) {
    console.error('Adherence POST error:', err);
    return new Response('Error saving adherence log', { status: 500 });
  }
}
