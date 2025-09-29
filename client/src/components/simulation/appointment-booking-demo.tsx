import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, MessageCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AppointmentBookingDemoProps {
  clinic?: any;
}

export default function AppointmentBookingDemo({ clinic }: AppointmentBookingDemoProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'form' | 'confirmation' | 'complete'>('form');
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    email: '',
    appointmentType: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/appointments', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setStep('complete');
      toast({
        title: "Appointment Booked Successfully",
        description: "The patient will receive a confirmation message shortly.",
      });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic) {
      toast({
        title: "No Clinic Setup",
        description: "Please set up your clinic first to book appointments.",
        variant: "destructive",
      });
      return;
    }

    setStep('confirmation');
  };

  const confirmBooking = () => {
    const appointmentData = {
      clinicId: clinic.id,
      patientName: formData.patientName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      appointmentType: formData.appointmentType,
      appointmentDate: new Date(`${formData.preferredDate} ${formData.preferredTime}`).toISOString(),
      status: 'scheduled',
      notes: formData.notes,
      source: 'ai_receptionist',
      duration: 30, // 30 minutes default
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  const resetDemo = () => {
    setStep('form');
    setFormData({
      patientName: '',
      phoneNumber: '',
      email: '',
      appointmentType: '',
      preferredDate: '',
      preferredTime: '',
      notes: ''
    });
  };

  const generateSampleData = () => {
    const sampleNames = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emma Wilson', 'David Lee'];
    const sampleTypes = ['General Consultation', 'Follow-up', 'Annual Check-up', 'Urgent Care', 'Specialist Referral'];
    const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const type = sampleTypes[Math.floor(Math.random() * sampleTypes.length)];
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData({
      patientName: name,
      phoneNumber: '+44 7700 900' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      email: name.toLowerCase().replace(' ', '.') + '@email.com',
      appointmentType: type,
      preferredDate: tomorrow.toISOString().split('T')[0],
      preferredTime: '14:30',
      notes: 'Patient called requesting appointment. Mentioned some minor concerns to discuss.'
    });
  };

  if (step === 'complete') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Appointment Booked Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Booking Details</h4>
            <div className="text-sm space-y-1">
              <p><strong>Patient:</strong> {formData.patientName}</p>
              <p><strong>Type:</strong> {formData.appointmentType}</p>
              <p><strong>Date & Time:</strong> {formData.preferredDate} at {formData.preferredTime}</p>
              <p><strong>Phone:</strong> {formData.phoneNumber}</p>
            </div>
          </div>
          <Button onClick={resetDemo} className="w-full">
            Book Another Appointment
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'confirmation') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            AI Receptionist - Confirm Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-3 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              AI Receptionist Summary
            </h4>
            <div className="text-sm space-y-2">
              <p>"Thank you, {formData.patientName}. I have the following details for your appointment:"</p>
              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <ul className="space-y-1">
                  <li><strong>Patient Name:</strong> {formData.patientName}</li>
                  <li><strong>Phone Number:</strong> {formData.phoneNumber}</li>
                  <li><strong>Appointment Type:</strong> {formData.appointmentType}</li>
                  <li><strong>Preferred Date:</strong> {formData.preferredDate}</li>
                  <li><strong>Preferred Time:</strong> {formData.preferredTime}</li>
                  {formData.notes && <li><strong>Notes:</strong> {formData.notes}</li>}
                </ul>
              </div>
              <p>"Shall I go ahead and book this appointment for you?"</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button onClick={confirmBooking} className="flex-1" disabled={createAppointmentMutation.isPending}>
              {createAppointmentMutation.isPending ? "Booking..." : "Yes, Confirm Booking"}
            </Button>
            <Button variant="outline" onClick={() => setStep('form')} className="flex-1">
              No, Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Appointment Booking Simulation
          </span>
          <Button variant="outline" size="sm" onClick={generateSampleData}>
            Generate Sample Data
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Simulate how your AI receptionist handles appointment bookings
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                placeholder="John Smith"
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                placeholder="+44 7700 900123"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="john.smith@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="appointmentType">Appointment Type</Label>
            <Select value={formData.appointmentType} onValueChange={(value) => setFormData({...formData, appointmentType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General Consultation">General Consultation</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Annual Check-up">Annual Check-up</SelectItem>
                <SelectItem value="Urgent Care">Urgent Care</SelectItem>
                <SelectItem value="Specialist Referral">Specialist Referral</SelectItem>
                <SelectItem value="Vaccination">Vaccination</SelectItem>
                <SelectItem value="Blood Test">Blood Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="preferredTime">Preferred Time</Label>
              <Select value={formData.preferredTime} onValueChange={(value) => setFormData({...formData, preferredTime: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">09:00 AM</SelectItem>
                  <SelectItem value="09:30">09:30 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="10:30">10:30 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="11:30">11:30 AM</SelectItem>
                  <SelectItem value="14:00">02:00 PM</SelectItem>
                  <SelectItem value="14:30">02:30 PM</SelectItem>
                  <SelectItem value="15:00">03:00 PM</SelectItem>
                  <SelectItem value="15:30">03:30 PM</SelectItem>
                  <SelectItem value="16:00">04:00 PM</SelectItem>
                  <SelectItem value="16:30">04:30 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any specific concerns or requirements..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={!clinic}>
            {!clinic ? "Setup Clinic First" : "Process Appointment Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}