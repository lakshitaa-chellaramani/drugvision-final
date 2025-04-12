// lib/fetchMedications.ts
export async function fetchMedicationsByName(userName: string) {
    try {
      const res = await fetch("/api/medications");
      const data = await res.json();
      const allMeds = data.medications || [];
  
      // Filter by user name
      return allMeds.filter(
        (med: { patient: string }) => med.patient?.toLowerCase() === userName?.toLowerCase()
      );
    } catch (err) {
      console.error("Failed to fetch medications", err);
      return [];
    }
  }
  