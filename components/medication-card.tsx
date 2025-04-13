import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Pill, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

// Define the Medication type
type Medication = {
  id: string;
  medication: string;
  dosage: string;
  timeOfDay: string;
  prescribedBy: string;
  status: string;
};

export default function MedicationCard({ medications }: { medications: Medication[] }) {
  const [adherenceStatus, setAdherenceStatus] = useState<Record<string, string>>({});

  const handleAdherenceUpdate = async (medicationId: string, taken: boolean, timeOfDay: string) => {
    try {
      // Prevent duplicate submissions
      if (adherenceStatus[medicationId]) {
        return;
      }

      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const response = await fetch('/api/adherence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicationId,
          date: today,
          timeOfDay,
          taken,
        }),
      });

      if (response.ok) {
        // Update local state to reflect the change
        setAdherenceStatus(prev => ({
          ...prev,
          [medicationId]: taken ? 'taken' : 'skipped',
        }));
        
        toast({
          title: taken ? "Medication Taken" : "Medication Skipped",
          description: `Successfully recorded your medication as ${taken ? 'taken' : 'skipped'}.`,
          variant: taken ? "default" : "destructive",
        });
      } else {
        throw new Error('Failed to update adherence');
      }
    } catch (error) {
      console.error('Error updating adherence:', error);
      toast({
        title: "Error",
        description: "Failed to update medication status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Today's Medications</CardTitle>
        <CardDescription>Medications to take today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medications.filter((med: Medication) => med.status === "active").map((med: Medication) => (
            <div key={med.id} className="flex items-start space-x-3">
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-1 flex-grow">
                <div className="flex items-center">
                  <h4 className="font-medium">{med.medication}</h4>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {med.dosage}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {med.timeOfDay}
                </div>
                <div className="text-xs text-muted-foreground">Prescribed by {med.prescribedBy}</div>
                
                {!adherenceStatus[med.id] ? (
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAdherenceUpdate(med.id, true, String(med.timeOfDay))}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Taken
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleAdherenceUpdate(med.id, false, String(med.timeOfDay))}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Skipped
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <Badge className={adherenceStatus[med.id] === 'taken' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                      {adherenceStatus[med.id] === 'taken' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Taken</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Skipped</>
                      )}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}