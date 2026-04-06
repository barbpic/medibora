import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { encountersApi } from '@/services/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Edit, Calendar, User, Activity } from 'lucide-react';
import type { Encounter } from '@/types';

export default function EncounterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const encounterId = parseInt(id || '0');

  const { data: encounter, isLoading } = useQuery({
    queryKey: ['encounter', encounterId],
    queryFn: async () => {
      const response = await encountersApi.getById(encounterId);
      return response.data.encounter as Encounter;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  if (!encounter) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Encounter not found</h2>
          <Button asChild className="mt-4">
            <Link to="/encounters">Back to Encounters</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link to="/encounters">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{encounter.encounter_id}</h1>
                <Badge className={getStatusColor(encounter.status)}>{encounter.status}</Badge>
              </div>
              <p className="text-gray-500 mt-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                {new Date(encounter.visit_date).toLocaleString()} • {encounter.visit_type}
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Encounter
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chief Complaint */}
            {encounter.chief_complaint && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chief Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{encounter.chief_complaint}</p>
                </CardContent>
              </Card>
            )}

            {/* History */}
            {encounter.history_of_present_illness && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">History of Present Illness</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{encounter.history_of_present_illness}</p>
                </CardContent>
              </Card>
            )}

            {/* Physical Examination */}
            {encounter.physical_examination && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Physical Examination</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{encounter.physical_examination}</p>
                </CardContent>
              </Card>
            )}

            {/* Assessment */}
            {encounter.assessment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{encounter.assessment}</p>
                </CardContent>
              </Card>
            )}

            {/* Diagnosis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {encounter.diagnosis_primary && (
                  <div>
                    <p className="text-sm text-gray-500">Primary Diagnosis</p>
                    <p className="font-medium text-gray-900">{encounter.diagnosis_primary}</p>
                  </div>
                )}
                {encounter.diagnosis_secondary && (
                  <div>
                    <p className="text-sm text-gray-500">Secondary Diagnosis</p>
                    <p className="text-gray-700">{encounter.diagnosis_secondary}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Treatment Plan */}
            {encounter.treatment_plan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Treatment Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{encounter.treatment_plan}</p>
                </CardContent>
              </Card>
            )}

            {/* Medications */}
            {encounter.medications_prescribed && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medications Prescribed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">
                    {encounter.medications_prescribed}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Procedures */}
            {encounter.procedures && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Procedures</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{encounter.procedures}</p>
                </CardContent>
              </Card>
            )}

            {/* Lab Tests */}
            {encounter.lab_tests_ordered && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lab Tests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Ordered</p>
                    <p className="text-gray-700">{encounter.lab_tests_ordered}</p>
                  </div>
                  {encounter.lab_results && (
                    <div>
                      <p className="text-sm text-gray-500">Results</p>
                      <p className="text-gray-700">{encounter.lab_results}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Follow-up */}
            {(encounter.follow_up_instructions || encounter.follow_up_date) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Follow-up</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {encounter.follow_up_date && (
                    <div>
                      <p className="text-sm text-gray-500">Follow-up Date</p>
                      <p className="font-medium">
                        {new Date(encounter.follow_up_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {encounter.follow_up_instructions && (
                    <div>
                      <p className="text-sm text-gray-500">Instructions</p>
                      <p className="text-gray-700">{encounter.follow_up_instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Provider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{encounter.provider_name || 'Unknown'}</p>
              </CardContent>
            </Card>

            {/* Vital Signs */}
            {encounter.vital_signs && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {encounter.vital_signs.temperature && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Temperature</span>
                      <span className="font-medium">{encounter.vital_signs.temperature}°C</span>
                    </div>
                  )}
                  {encounter.vital_signs.heart_rate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Heart Rate</span>
                      <span className="font-medium">{encounter.vital_signs.heart_rate} bpm</span>
                    </div>
                  )}
                  {encounter.vital_signs.respiratory_rate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Respiratory Rate</span>
                      <span className="font-medium">
                        {encounter.vital_signs.respiratory_rate} /min
                      </span>
                    </div>
                  )}
                  {encounter.vital_signs.blood_pressure?.display && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Blood Pressure</span>
                      <span className="font-medium">
                        {encounter.vital_signs.blood_pressure.display} mmHg
                      </span>
                    </div>
                  )}
                  {encounter.vital_signs.oxygen_saturation && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Oxygen Saturation</span>
                      <span className="font-medium">
                        {encounter.vital_signs.oxygen_saturation}%
                      </span>
                    </div>
                  )}
                  {encounter.vital_signs.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weight</span>
                      <span className="font-medium">{encounter.vital_signs.weight} kg</span>
                    </div>
                  )}
                  {encounter.vital_signs.height && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Height</span>
                      <span className="font-medium">{encounter.vital_signs.height} cm</span>
                    </div>
                  )}
                  {encounter.vital_signs.bmi && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">BMI</span>
                      <span className="font-medium">{encounter.vital_signs.bmi}</span>
                    </div>
                  )}
                  {encounter.vital_signs.pain_score !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pain Score</span>
                      <span className="font-medium">{encounter.vital_signs.pain_score}/10</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI Alert */}
            {encounter.vital_signs?.alert?.generated && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800">AI Alert</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant="destructive"
                    className="mb-2"
                  >
                    {encounter.vital_signs.alert.severity}
                  </Badge>
                  <p className="text-red-700 text-sm">{encounter.vital_signs.alert.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
