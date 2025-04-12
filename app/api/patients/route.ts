// import { dbConnect } from "@/lib/dbConnect";
// import Patient from '@/models/patient'
// export async function GET() {
//   try {
//     await dbConnect();
//     const patients = await Patient.find().sort({ createdAt: -1 });
//     return new Response(JSON.stringify({ success: true , patients}), {
//       status: 200,
//     });
//   } catch (error) {
//     console.error('GET /api/patients', error);
//     return new Response(JSON.stringify({ error: 'Internal server error' }), {
//       status: 500,
//     });
//   }
// }
import { dbConnect } from "@/lib/dbConnect";
import Patient from "@/models/patient";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (name) {
      // Fetch a single patient by name (case-insensitive)
      const patient = await Patient.findOne({ name: { $regex: new RegExp(name, "i") } });

      if (!patient) {
        return new Response(JSON.stringify({ error: "Patient not found" }), { status: 404 });
      }

      return new Response(JSON.stringify({ success: true, patient }), { status: 200 });
    }

    // If no name query, return all patients
    const patients = await Patient.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify({ success: true, patients }), { status: 200 });
  } catch (error) {
    console.error("GET /api/patients", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
