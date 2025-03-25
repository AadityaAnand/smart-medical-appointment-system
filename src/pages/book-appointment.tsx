import { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useSession } from 'next-auth/react';
import { Priority } from '@prisma/client';

interface Doctor {
  id: number;
  name: string;
  email: string;
  specialization: string | null;
}

interface SymptomRecommendation {
  specialty: string;
  message: string;
}

const BookAppointment: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.LOW);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [recommendation, setRecommendation] = useState<SymptomRecommendation | null>(null);
  const [isGettingRecommendation, setIsGettingRecommendation] = useState(false);


  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/doctors');
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);


  const handleGetRecommendation = async () => {
    if (!symptoms.trim()) {
      setError('Please enter your symptoms to get a recommendation');
      return;
    }

    setIsGettingRecommendation(true);
    setError('');
    
    try {
      const response = await fetch('/api/recommend-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms.split(',').map(s => s.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation');
      }

      const data = await response.json();
      setRecommendation(data);
      

      if (data.specialty && doctors.some(doc => doc.specialization)) {
        const recommendedDoctors = doctors.filter(
          doc => doc.specialization?.toLowerCase().includes(data.specialty.toLowerCase())
        );
        
        if (recommendedDoctors.length > 0) {
          setSelectedDoctor(recommendedDoctors[0].id);
        }
      }
    } catch (err) {
      console.error('Error getting recommendation:', err);
      setError('Failed to get specialist recommendation');
    } finally {
      setIsGettingRecommendation(false);
    }
  };


  const handleAssessPriority = async () => {
    if (!symptoms.trim()) {
      setError('Please enter your symptoms to assess priority');
      return;
    }

    try {
      const response = await fetch('/api/assess-priority', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms.split(',').map(s => s.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assess priority');
      }

      const data = await response.json();
      setPriority(data.priority);
    } catch (err) {
      console.error('Error assessing priority:', err);
      setError('Failed to assess appointment priority');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor) {
      setError('Please select a doctor');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    const scheduledAt = `${selectedDate}T${selectedTime}:00`;
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: Number(selectedDoctor),
          scheduledAt,
          priority,
          notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to book appointment');
      }

      setSuccess(true);
      

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError((err as Error).message);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };


  if (!session) {
    return (
      <Layout title="Book Appointment | MedScheduler" requireAuth={true}>
        <div className="flex items-center justify-center min-h-screen">
          <p>Please sign in to book an appointment.</p>
        </div>
      </Layout>
    );
  }

  if (session.user.role !== 'PATIENT') {
    return (
      <Layout title="Book Appointment | MedScheduler">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Only patients can book appointments.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Book Appointment | MedScheduler" requireAuth={true} allowedRoles={['PATIENT']}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <p>Appointment booked successfully! Redirecting to dashboard...</p>
          </div>
        )}

        {!success && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="md:col-span-2">
                  <div className="mb-6">
                    <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                      What symptoms are you experiencing?
                    </label>
                    <textarea
                      id="symptoms"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your symptoms (e.g., headache, fever, cough)"
                    />
                    <div className="flex space-x-4 mt-2">
                      <button
                        type="button"
                        onClick={handleGetRecommendation}
                        disabled={isGettingRecommendation || !symptoms.trim()}
                        className="text-sm bg-blue-50 text-blue-600 py-1 px-3 rounded border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGettingRecommendation ? 'Getting recommendation...' : 'Recommend specialist'}
                      </button>
                      <button
                        type="button"
                        onClick={handleAssessPriority}
                        disabled={!symptoms.trim()}
                        className="text-sm bg-blue-50 text-blue-600 py-1 px-3 rounded border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Assess priority
                      </button>
                    </div>
                  </div>

                  {recommendation && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                      <h3 className="font-semibold text-blue-800">Specialist Recommendation</h3>
                      <p className="text-gray-700 mt-1">{recommendation.message}</p>
                    </div>
                  )}
                </div>


                <div>
                  <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Doctor
                  </label>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                      <span>Loading doctors...</span>
                    </div>
                  ) : (
                    <select
                      id="doctor"
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}{doctor.specialization ? ` (${doctor.specialization})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>


                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>


                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>


                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={Priority.LOW}>Low</option>
                    <option value={Priority.MEDIUM}>Medium</option>
                    <option value={Priority.HIGH}>High</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Please select high priority only for urgent medical issues
                  </p>
                </div>


                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional information you'd like to share with the doctor?"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookAppointment;