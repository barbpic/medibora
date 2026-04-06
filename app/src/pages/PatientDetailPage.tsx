import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientsApi, encountersApi, aiApi } from '@/services/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Plus,
  User,
  Phone,
  AlertTriangle,
  Activity,
  FileText,
  Loader2,
  Shield,
} from 'lucide-react';
import type { Patient, Encounter, RiskAssessment } from '@/types';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = parseInt(id || '0');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await patientsApi.getById(patientId);
      return response.data.patient as Patient;
    },
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['patientHistory', patientId],
    queryFn: async () => {
      const response = await encountersApi.getPatientHistory(patientId);
      return response.data as { patient: Patient; encounters: Encounter[] };
    },
  });

  const { data: riskAssessment, isLoading: riskLoading } = useQuery({
    queryKey: ['riskAssessment', patientId],
    queryFn: async () => {
      const response = await aiApi.getRiskAssessment(patientId);
      return response.data.assessment as RiskAssessment;
    },
  });

  if (patientLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Patient not found</h2>
          <Button asChild className="mt-4">
            <Link to="/patients">Back to Patients</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link to="/patients">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient.full_name}</h1>
              <p className="text-gray-500">
                {patient.patient_id} • {patient.age} years • {patient.gender}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to={`/patients/${patientId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to={`/patients/${patientId}/new-encounter`}>
                <Plus className="h-4 w-4 mr-2" />
                New Encounter
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="encounters">Encounters</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="medical">Medical History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">
                        {patient.date_of_birth
                          ? new Date(patient.date_of_birth).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{patient.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium capitalize">{patient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Blood Type</p>
                      <p className="font-medium">{patient.blood_type || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{patient.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{patient.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {patient.address || 'N/A'}
                      {patient.city && `, ${patient.city}`}
                      {patient.county && `, ${patient.county}`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.emergency_contact?.name ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{patient.emergency_contact.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{patient.emergency_contact.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Relationship</p>
                        <p className="font-medium">
                          {patient.emergency_contact.relationship || 'N/A'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">No emergency contact provided</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Insurance & Medical Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Insurance Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.insurance?.provider ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Provider</p>
                        <p className="font-medium">{patient.insurance.provider}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Policy Number</p>
                        <p className="font-medium">{patient.insurance.number || 'N/A'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No insurance information</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {patient.encounter_count || 0}
                      </p>
                      <p className="text-sm text-blue-700">Total Visits</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {history?.encounters?.filter((e: Encounter) => e.status === 'active').length || 0}
                      </p>
                      <p className="text-sm text-green-700">Active Encounters</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {patient.chronic_conditions ? 'Yes' : 'No'}
                      </p>
                      <p className="text-sm text-purple-700">Chronic Conditions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Encounters Tab */}
          <TabsContent value="encounters">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Encounter History</CardTitle>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to={`/patients/${patientId}/new-encounter`}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Encounter
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : history?.encounters && history.encounters.length > 0 ? (
                  <div className="space-y-4">
                    {history.encounters.map((encounter: Encounter) => (
                      <div
                        key={encounter.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold">{encounter.encounter_id}</h4>
                              <Badge
                                variant={encounter.status === 'active' ? 'default' : 'secondary'}
                              >
                                {encounter.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(encounter.visit_date).toLocaleDateString()} •{' '}
                              {encounter.visit_type}
                            </p>
                            {encounter.chief_complaint && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Complaint:</span>{' '}
                                {encounter.chief_complaint}
                              </p>
                            )}
                            {encounter.diagnosis_primary && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Diagnosis:</span>{' '}
                                {encounter.diagnosis_primary}
                              </p>
                            )}
                          </div>
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/encounters/${encounter.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No encounters found for this patient</p>
                    <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700">
                      <Link to={`/patients/${patientId}/new-encounter`}>
                        Create First Encounter
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="risk">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  AI-Powered Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {riskLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : riskAssessment ? (
                  <div className="space-y-6">
                    {/* Risk Score */}
                    <div className="flex items-center gap-6">
                      <div
                        className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${getRiskColor(
                          riskAssessment.risk_level.level
                        )}`}
                      >
                        <div className="text-center">
                          <p className="text-3xl font-bold">{riskAssessment.risk_score}</p>
                          <p className="text-xs uppercase">Risk Score</p>
                        </div>
                      </div>
                      <div>
                        <h3
                          className={`text-2xl font-bold capitalize ${
                            riskAssessment.risk_level.level === 'critical'
                              ? 'text-red-600'
                              : riskAssessment.risk_level.level === 'high'
                              ? 'text-orange-600'
                              : riskAssessment.risk_level.level === 'moderate'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        >
                          {riskAssessment.risk_level.level} Risk
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {riskAssessment.risk_level.description}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Assessed: {new Date(riskAssessment.assessed_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {riskAssessment.risk_factors.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Identified Risk Factors</h4>
                        <div className="space-y-2">
                          {riskAssessment.risk_factors.map((factor: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-3 bg-red-50 rounded-lg"
                            >
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              <span className="text-red-800">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {riskAssessment.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">AI Recommendations</h4>
                        <div className="space-y-2">
                          {riskAssessment.recommendations.map((rec: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg"
                            >
                              <Activity className="h-5 w-5 text-blue-500" />
                              <span className="text-blue-800">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Unable to generate risk assessment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="medical">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Allergies</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.allergies ? (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-red-800">{patient.allergies}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No known allergies</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chronic Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.chronic_conditions ? (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-orange-800">{patient.chronic_conditions}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No chronic conditions recorded</p>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Current Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.current_medications ? (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800">{patient.current_medications}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No current medications</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
