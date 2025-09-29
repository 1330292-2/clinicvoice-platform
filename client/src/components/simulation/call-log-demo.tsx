import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, CheckCircle, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CallLogDemoProps {
  clinic?: any;
}

export default function CallLogDemo({ clinic }: CallLogDemoProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [callData, setCallData] = useState({
    patientName: "Sarah Thompson",
    phoneNumber: "+44 7700 900456",
    callDuration: 0,
    appointmentBooked: false,
    summary: "",
    transcript: "",
  });

  const createCallLogMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/call-logs', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/call-logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Call Log Created",
        description: "AI receptionist call has been logged successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Log Call",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  const simulationSteps = [
    {
      title: "Incoming Call",
      description: "Patient calls the clinic",
      content: "📞 Incoming call from +44 7700 900456",
      duration: 1000,
    },
    {
      title: "AI Greeting",
      description: "AI receptionist answers",
      content: "🤖 'Good afternoon, thank you for calling [Clinic Name]. This is your AI receptionist. How may I help you today?'",
      duration: 2000,
    },
    {
      title: "Patient Request",
      description: "Patient states their needs",
      content: "👤 'Hi, I'd like to book an appointment with Dr. Smith for next week. I've been having some headaches.'",
      duration: 2000,
    },
    {
      title: "AI Processing",
      description: "AI gathers information",
      content: "🤖 'I can help you with that. Let me check Dr. Smith's availability. May I have your name and date of birth for verification?'",
      duration: 2000,
    },
    {
      title: "Appointment Booking",
      description: "AI books the appointment",
      content: "🤖 'Perfect! I have an appointment available on Tuesday at 2:30 PM. Would that work for you, Sarah?'",
      duration: 2000,
    },
    {
      title: "Confirmation",
      description: "AI confirms details",
      content: "🤖 'Excellent! Your appointment is confirmed for Tuesday, [Date] at 2:30 PM with Dr. Smith. You'll receive a confirmation SMS shortly. Is there anything else I can help you with today?'",
      duration: 2000,
    },
    {
      title: "Call Complete",
      description: "Call ends successfully",
      content: "✅ Call completed - Appointment booked successfully",
      duration: 1000,
    },
  ];

  const startSimulation = async () => {
    if (!clinic) {
      toast({
        title: "No Clinic Setup",
        description: "Please set up your clinic first to simulate calls.",
        variant: "destructive",
      });
      return;
    }

    setIsSimulating(true);
    setCurrentStep(0);
    setCallData({
      ...callData,
      callDuration: 0,
      appointmentBooked: false,
      summary: "",
      transcript: "",
    });

    // Simulate call progression
    for (let i = 0; i < simulationSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, simulationSteps[i].duration));
      
      // Update call duration
      setCallData(prev => ({
        ...prev,
        callDuration: prev.callDuration + simulationSteps[i].duration / 1000,
      }));
    }

    // Mark appointment as booked
    setCallData(prev => ({
      ...prev,
      appointmentBooked: true,
      summary: "Patient called to book appointment with Dr. Smith for headaches. Appointment successfully scheduled for Tuesday at 2:30 PM. Patient was polite and satisfied with service.",
      transcript: simulationSteps.map((step, index) => 
        `[${new Date(Date.now() - (simulationSteps.length - index) * 1000).toLocaleTimeString()}] ${step.content.replace(/🤖|👤|📞|✅/g, '').trim()}`
      ).join('\n'),
    }));

    // Create the call log
    const callLogData = {
      clinicId: clinic.id,
      phoneNumber: callData.phoneNumber,
      callerName: callData.patientName,
      duration: Math.round(simulationSteps.reduce((acc, step) => acc + step.duration, 0) / 1000),
      summary: "Patient called to book appointment with Dr. Smith for headaches. Appointment successfully scheduled for Tuesday at 2:30 PM.",
      transcript: simulationSteps.map(step => step.content).join('\n'),
      appointmentBooked: true,
      sentiment: 0.8, // Positive sentiment
      status: 'completed',
      aiResponse: true,
    };

    createCallLogMutation.mutate(callLogData);
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setIsSimulating(false);
    setCallData({
      patientName: "Sarah Thompson",
      phoneNumber: "+44 7700 900456",
      callDuration: 0,
      appointmentBooked: false,
      summary: "",
      transcript: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          AI Receptionist Call Simulation
        </CardTitle>
        <p className="text-sm text-gray-600">
          Watch how your AI receptionist handles patient calls
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isSimulating && currentStep === 0 ? (
          <div className="text-center space-y-4">
            <div className="p-6 bg-blue-50 rounded-lg">
              <Phone className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="font-semibold mb-2">Ready to Simulate a Call</h3>
              <p className="text-sm text-gray-600 mb-4">
                This simulation shows how your AI receptionist handles incoming patient calls, 
                including appointment booking and information gathering.
              </p>
              <Button onClick={startSimulation} disabled={!clinic || createCallLogMutation.isPending}>
                {!clinic ? "Setup Clinic First" : "Start Call Simulation"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of {simulationSteps.length}</span>
              <span>{Math.round(callData.callDuration)}s</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((currentStep + 1) / simulationSteps.length) * 100}%` }}
              />
            </div>

            {/* Current step display */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{simulationSteps[currentStep]?.title}</h4>
                <Badge variant="outline">
                  {isSimulating ? "In Progress" : "Completed"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{simulationSteps[currentStep]?.description}</p>
              <div className="bg-gray-50 rounded p-3 font-mono text-sm">
                {simulationSteps[currentStep]?.content}
              </div>
            </div>

            {/* Call summary after completion */}
            {!isSimulating && currentStep >= simulationSteps.length - 1 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-800">Call Completed Successfully</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Patient:</span> {callData.patientName}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {Math.round(callData.callDuration)}s
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {callData.phoneNumber}
                  </div>
                  <div>
                    <span className="font-medium">Appointment:</span> 
                    <Badge className="ml-2" variant={callData.appointmentBooked ? "default" : "secondary"}>
                      {callData.appointmentBooked ? "Booked" : "Not Booked"}
                    </Badge>
                  </div>
                </div>
                <Button onClick={resetSimulation} className="w-full mt-4" variant="outline">
                  Run Another Simulation
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}