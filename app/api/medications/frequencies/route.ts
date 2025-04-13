export async function GET() {
    const frequencies = [
      { value: 'once a day', label: 'Once a Day' },
      { value: 'twice a day', label: 'Twice a Day' },
      { value: 'everyday', label: 'Everyday' },
      { value: 'alternate days', label: 'Alternate Days' },
      { value: 'once a week', label: 'Once a Week' },
      { value: 'as needed', label: 'As Needed' }
    ];
  
    return Response.json(frequencies);
  }
  