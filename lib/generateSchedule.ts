type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

type MedicationSchedule = {
  date: string;
  label: TimeOfDay;
};

export function generateMedicationSchedule(med: any): MedicationSchedule[] {
  const { startDate, endDate, frequency, timeOfDay }: { startDate: Date; endDate: Date; frequency: string; timeOfDay: TimeOfDay[] } = med;
  const schedule: MedicationSchedule[] = [];

  const start = new Date(startDate);
  const endD = new Date(endDate || new Date());

  // Only generate a schedule for frequencies that need it
  if (frequency === 'as needed') return schedule; // No schedule needed for "As Needed"

  for (let d = new Date(start); d <= endD; d.setDate(d.getDate() + 1)) {
    const isoDate = d.toISOString().split('T')[0];

    let include = false;

    switch (frequency) {
      case 'once a day':
        include = true; break;
      case 'twice a day':
        include = true; break;
      case 'everyday':
        include = true; break;
      case 'alternate days':
        include = d.getDate() % 2 === 0; break;
      case 'once a week':
        include = d.getDay() === start.getDay(); break;
    }

    if (include) {
      timeOfDay.forEach((label: TimeOfDay) => schedule.push({ date: isoDate, label }));
    }
  }

  return schedule;
}
