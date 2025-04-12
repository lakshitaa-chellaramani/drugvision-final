// components/MedicationInteractions.tsx
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

interface Interaction {
  _id: string;
  drug1: string;
  drug2: string;
  severity: number;
  description: string;
  date: string;
}

interface MedicationInteractionsProps {
  patientId?: string;
  medications?: string[];
}

export default function MedicationInteractions({ patientId, medications }: MedicationInteractionsProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInteractions() {
      try {
        setLoading(true);
        let url = '/api/interactions';
        if (patientId) {
          url += `?patient=${patientId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch interactions');
        }
        
        const data = await response.json();
        setInteractions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchInteractions();
  }, [patientId]);

  // Check if we need to create new interactions based on medications
  useEffect(() => {
    async function checkForNewInteractions() {
      if (!medications || medications.length < 2) return;
      
      // For all possible medication pairs
      for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
          // Check if we already have this interaction
          const existingInteraction = interactions.find(
            int => (int.drug1 === medications[i] && int.drug2 === medications[j]) || 
                  (int.drug1 === medications[j] && int.drug2 === medications[i])
          );
          
          if (!existingInteraction) {
            try {
              // Create a new interaction record
              const response = await fetch('/api/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  drug1: medications[i], 
                  drug2: medications[j],
                  patientId: patientId 
                })
              });
              
              if (response.ok) {
                const newInteraction = await response.json();
                setInteractions(prev => [...prev, newInteraction]);
              }
            } catch (err) {
              console.error("Failed to create interaction:", err);
            }
          }
        }
      }
    }
    
    if (interactions.length > 0) {
      checkForNewInteractions();
    }
  }, [medications, interactions, patientId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  // Filter to show only severe and moderate interactions in main display
  const severeInteractions = interactions.filter(int => int.severity >= 7);
  const moderateInteractions = interactions.filter(int => int.severity >= 4 && int.severity < 7);
  const mildInteractions = interactions.filter(int => int.severity < 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
          Potential Interactions
        </CardTitle>
        <CardDescription>Medications that may interact with each other</CardDescription>
      </CardHeader>
      <CardContent>
        {severeInteractions.length > 0 && (
          <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-950/20 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-700 dark:text-red-400">Severe Interactions Detected</h4>
                {severeInteractions.map((interaction) => (
                  <div key={interaction._id} className="mt-2 pb-2 border-b border-red-100 dark:border-red-800/50 last:border-b-0 last:pb-0">
                    <p className="text-sm font-medium text-red-600 dark:text-red-300">
                      {interaction.drug1} + {interaction.drug2}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      {interaction.description}
                    </p>
                  </div>
                ))}
                <Button variant="link" className="p-0 h-auto text-red-700 dark:text-red-400 mt-2">
                  Learn more
                </Button>
              </div>
            </div>
          </div>
        )}

        {moderateInteractions.length > 0 && (
          <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-700 dark:text-amber-400">Moderate Interactions Detected</h4>
                {moderateInteractions.map((interaction) => (
                  <div key={interaction._id} className="mt-2 pb-2 border-b border-amber-100 dark:border-amber-800/50 last:border-b-0 last:pb-0">
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-300">
                      {interaction.drug1} + {interaction.drug2}
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                      {interaction.description}
                    </p>
                  </div>
                ))}
                <Button variant="link" className="p-0 h-auto text-amber-700 dark:text-amber-400 mt-2">
                  Learn more
                </Button>
              </div>
            </div>
          </div>
        )}

        {mildInteractions.length > 0 && (
          <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-700 dark:text-blue-400">Mild Interactions Detected</h4>
                {mildInteractions.map((interaction) => (
                  <div key={interaction._id} className="mt-2 pb-2 border-b border-blue-100 dark:border-blue-800/50 last:border-b-0 last:pb-0">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
                      {interaction.drug1} + {interaction.drug2}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                      {interaction.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {severeInteractions.length === 0 && moderateInteractions.length === 0 && mildInteractions.length === 0 && (
          <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-700 dark:text-green-400">No Interactions Detected</h4>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  Your current medication regimen has no known interactions.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}