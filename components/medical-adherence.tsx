import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MedicationAdherenceChart() {
  // Sample data for a week of medication adherence
  const data = [
    { day: 'Mon', adherence: 100 },
    { day: 'Tue', adherence: 100 },
    { day: 'Wed', adherence: 90 },
    { day: 'Thu', adherence: 100 },
    { day: 'Fri', adherence: 100 },
    { day: 'Sat', adherence: 70 },
    { day: 'Sun', adherence: 65 }
  ];

  // Calculate average adherence
  const averageAdherence = Math.round(
    data.reduce((sum, item) => sum + item.adherence, 0) / data.length
  );

  return (
    <div className="rounded-lg border p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-lg">Medication Adherence</h4>
        <div className="text-sm font-medium">
          <span className="mr-1 text-green-600">{averageAdherence}%</span>
          <span className="text-gray-500">weekly average</span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} tickCount={6} />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Adherence']}
              contentStyle={{ borderRadius: '6px' }}
            />
            <Bar 
              dataKey="adherence" 
              fill="#4f46e5" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        You're doing well with your medication schedule. Try to maintain consistency on weekends.
      </p>
    </div>
  );
}