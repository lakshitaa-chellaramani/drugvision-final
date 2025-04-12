import { dbConnect } from "@/lib/dbConnect";
import Patient from '@/models/patient'
export async function GET() {
  try {
    await dbConnect();
    const patients = await Patient.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify({ success: true , patients}), {
      status: 200,
    });
  } catch (error) {
    console.error('GET /api/patients', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}
