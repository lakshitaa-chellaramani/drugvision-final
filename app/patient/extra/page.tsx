// components/PrescriptionExtractor.tsx  
"use client";  

import { useState } from 'react';  
import axios from 'axios';  

// Define types for the extracted data  
interface Medication {  
  name: string;  
  dosage: string;  
  frequency: {  
    morning: boolean;  
    afternoon: boolean;  
    night: boolean;  
  };  
  duration: {  
    days: number;  
    startDate?: string;  
    endDate?: string;  
  };  
}  

interface PrescriptionData {  
  doctor: {  
    name: string;  
  };  
  medications: Medication[];  
}  

const PrescriptionExtractor = () => {  
  const [extractedText, setExtractedText] = useState<string>('');  
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);  
  const [isLoading, setIsLoading] = useState<boolean>(false);  
  const [error, setError] = useState<string | null>(null);  

  // Function to handle text input  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {  
    setExtractedText(e.target.value);  
  };  

  // Function to extract prescription data using Gemini API  
  const extractPrescriptionData = async () => {  
    setIsLoading(true);  
    setError(null);  
    
    try {  
      // Your Gemini API key - Use environment variables in production!  
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;  
      
      // Create the prompt for Gemini  
      const prompt = `  
        Extract all prescription information from the following text with ur understanding:  
        "${extractedText}"  
        
        Return a JSON object with the following structure:  
        {  
          "doctor": {  
            "name": "Doctor's full name",  
          },  
          "medications": [  
            {  
              "name": "Full medication name",  
              "dosage": "Strength if specified",  
              "frequency": {  
                "morning": true/false,  
                "afternoon": true/false,  
                "night": true/false  
              },  
              "duration": {  
                "days": "Number of days (number only)",  
                "startDate": "Start date if specified",  
                "endDate": "End date if specified"  
              }  
            }  
          ]  
        }  
          start date is today and end date is today i.e 13-04-2024 + duration.
        If any value is missing in the input, use null or skip.  
        Ensure numbers are returned as numeric values where appropriate. 
        Parse dosage instructions like "1-0-1" where numbers indicate morning-afternoon-night doses.  
      `;  

      // Make the API call to Gemini  
      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAmNwK1mscfNky7a37zZQGBqRfpC_1uBH0`,  
        {  
          contents: [  
            {  
              parts: [  
                {  
                  text: prompt  
                }  
              ]  
            }  
          ],  
          generationConfig: {  
            temperature: 0.2,  
            maxOutputTokens: 4096,  
          }  
        }  
      );  

      // Extract and parse the JSON response  
      const generatedText = response.data.candidates[0].content.parts[0].text;  
      // Find JSON object in the response  
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) ||   
                        generatedText.match(/{[\s\S]*}/);  
                        
      const jsonContent = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '').trim() : generatedText;  
      
      // Parse the JSON data  
      const parsedData = JSON.parse(jsonContent);  
      setPrescriptionData(parsedData);  
    } catch (err) {  
      console.error('Error extracting prescription data:', err);  
      setError('Failed to extract prescription data. Please try again.');  
    } finally {  
      setIsLoading(false);  
    }  
  };  

  return (  
    <div className="max-w-4xl mx-auto p-6">  
      <h1 className="text-2xl font-bold mb-6">Prescription Data Extractor</h1>  
      
      <div className="mb-6">  
        <label className="block mb-2 font-medium">Paste Extracted Text</label>  
        <textarea  
          className="w-full border rounded-md p-3 h-40"  
          value={extractedText}  
          onChange={handleTextChange}  
          placeholder="Paste the extracted prescription text here..."  
        />  
      </div>  
      
      <button  
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"  
        onClick={extractPrescriptionData}  
        disabled={!extractedText.trim() || isLoading}  
      >  
        {isLoading ? 'Extracting...' : 'Extract Prescription Data'}  
      </button>  
      
      {error && (  
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">  
          {error}  
        </div>  
      )}  
      
      {prescriptionData && (  
        <div className="mt-6 border rounded-md p-4">  
          <h2 className="text-xl font-semibold mb-4">Extracted Prescription Information</h2>  
          
          <div className="mb-4">  
            <h3 className="font-medium text-lg">Doctor Information</h3>  
            <p><span className="font-medium">Name:</span> {prescriptionData.doctor.name || 'N/A'}</p>  
          </div>  
          
        
          <div>  
            <h3 className="font-medium text-lg">Medications</h3>  
            {prescriptionData.medications.map((med, index) => (  
              <div key={index} className="border-t pt-3 mt-3">  
                <p><span className="font-medium">Name:</span> {med.name || 'N/A'}</p>  
                <p><span className="font-medium">Dosage:</span> {med.dosage || 'N/A'}</p>  
                <p>
  <span className="font-medium">Frequency:</span>{' '}
  {[
    med.frequency.morning && 'Morning',
    med.frequency.afternoon && 'Afternoon',
    med.frequency.night && 'Night'
  ]
    .filter(Boolean)
    .join(', ') || 'N/A'}
</p>

                <p><span className="font-medium">Duration:</span> {med.duration.days || 'N/A'} days</p>  
                <p><span className="font-medium">Start Date:</span> {med.duration.startDate || 'N/A'}</p>  
                <p><span className="font-medium">End Date:</span> {med.duration.endDate || 'N/A'}</p>  
              </div>  
            ))}  
          </div>  
        </div>  
      )}  
    </div>  
  );  
};  

export default PrescriptionExtractor;  