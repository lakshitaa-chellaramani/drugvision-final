import { dbConnect } from '@/lib/dbConnect';
import Medication from '@/models/medication';
import Adherence from '@/models/adherence';
import { generateMedicationSchedule } from '@/lib/generateSchedule';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const medicationId = searchParams.get('medicationId');
  if (!medicationId) return new Response('Missing medicationId', { status: 400 });

  const medication = await Medication.findById(medicationId);
  if (!medication) return new Response('Medication not found', { status: 404 });

  const schedule = generateMedicationSchedule(medication);
  const logs = await Adherence.find({ medicationId });

  const takenSet = new Set(
    logs.filter(log => log.taken).map(log => `${log.date}-${log.timeOfDay}`)
  );

  const total = schedule.length;
  const taken = schedule.filter(({ date, label }) => takenSet.has(`${date}-${label}`)).length;
  const percent = total > 0 ? (taken / total) * 100 : 0;

  return Response.json({
    medicationId,
    totalDoses: total,
    takenCount: taken,
    adherencePercentage: Number(percent.toFixed(2))
  });
}
