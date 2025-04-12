import { dbConnect } from '@/lib/dbConnect';
import Medication from '@/models/medication';

export async function POST(req: { json: () => any }) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      medication,
      dosage,
      frequency,
      timeOfDay = [],  // ✅ new field
      startDate,
      endDate,
      status = 'active',
      prescribedBy,
      patient,
      notes,
    } = body;

    if (!medication || !dosage || !frequency || !startDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Call the extractdrugs API
    const geminiResponse = await fetch(`http://localhost:3000/api/extractdrugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicine: medication }),
    });

    const result = await geminiResponse.json();
    if (!geminiResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to extract drugs' }), { status: 500 });
    }

    const drugsArray = result.drugs.map((name: string) => ({ name }));

    const newMed = await Medication.create({
      medication,
      drugs: drugsArray,
      dosage,
      frequency,
      timeOfDay, // ✅ store the checkbox values
      startDate,
      endDate,
      status,
      prescribedBy,
      patient,
      notes,
    });

    return new Response(JSON.stringify({ success: true, medication: newMed }), {
      status: 201,
    });
  } catch (error) {
    console.error('POST /api/medications error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const medications = await Medication.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify({ success: true, medications }), {
      status: 200,
    });
  } catch (error) {
    console.error('GET /api/medications error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}
