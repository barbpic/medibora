import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { patientsApi, encountersApi } from '@/services/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import type { Encounter } from '@/types';

export default function NewEncounterPage() {
  const { id, encounterId } = useParams<{ id: string; encounterId?: string }>();
  const patientId = parseInt(id || '0');
  const editEncounterId = encounterId ? parseInt(encounterId) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!editEncounterId;

  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await patientsApi.getById(patientId);
      return response.data.patient;
    },
  });

  // Fetch existing encounter for edit mode
  const { data: existingEncounter } = useQuery({
    queryKey: ['encounter', editEncounterId],
    queryFn: async () => {
      if (!editEncounterId) return null;
      const response = await encountersApi.getById(editEncounterId);
      return response.data.encounter as Encounter;
    },
    enabled: !!editEncounterId,
  });

  useEffect(() => {
    if (existingEncounter && isEditMode) {
      setFormData({
        visit_type: existingEncounter.visit_type || 'follow_up',
        chief_complaint: existingEncounter.chief_complaint || '',
        history_of_present_illness: existingEncounter.history_of_present_illness || '',
        physical_examination: existingEncounter.physical_examination || '',
        assessment: existingEncounter.assessment || '',
        diagnosis_primary: existingEncounter.diagnosis_primary || '',
        diagnosis_secondary: existingEncounter.diagnosis_secondary || '',
        treatment_plan: existingEncounter.treatment_plan || '',
        medications_prescribed: existingEncounter.medications_prescribed || '',
        procedures: existingEncounter.procedures || '',
        lab_tests_ordered: existingEncounter.lab_tests_ordered || '',
        follow_up_instructions: existingEncounter.follow_up_instructions || '',
        follow_up_date: existingEncounter.follow_up_date || '',
        vital_signs: {
          temperature: existingEncounter.vital_signs?.temperature?.toString() || '',
          temperature_site: existingEncounter.vital_signs?.temperature_site || 'oral',
          heart_rate: existingEncounter.vital_signs?.heart_rate?.toString() || '',
          respiratory_rate: existingEncounter.vital_signs?.respiratory_rate?.toString() || '',
          blood_pressure_systolic: existingEncounter.vital_signs?.blood_pressure?.systolic?.toString() || '',
          blood_pressure_diastolic: existingEncounter.vital_signs?.blood_pressure?.diastolic?.toString() || '',
          oxygen_saturation: existingEncounter.vital_signs?.oxygen_saturation?.toString() || '',
          weight: existingEncounter.vital_signs?.weight?.toString() || '',
          height: existingEncounter.vital_signs?.height?.toString() || '',
          pain_score: existingEncounter.vital_signs?.pain_score?.toString() || '',
        },
      });
    }
  }, [existingEncounter, isEditMode]);

  const [formData, setFormData] = useState({
    visit_type: 'follow_up',
    chief_complaint: '',
    history_of_present_illness: '',
    physical_examination: '',
    assessment: '',
    diagnosis_primary: '',
    diagnosis_secondary: '',
    treatment_plan: '',
    medications_prescribed: '',
    procedures: '',
    lab_tests_ordered: '',
    follow_up_instructions: '',
    follow_up_date: '',
    vital_signs: {
      temperature: '',
      temperature_site: 'oral',
      heart_rate: '',
      respiratory_rate: '',
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      oxygen_saturation: '',
      weight: '',
      height: '',
      pain_score: '',
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVitalChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      vital_signs: { ...prev.vital_signs, [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const encounterData: Partial<Encounter> = {
        patient_id: patientId,
        visit_type: formData.visit_type as 'outpatient' | 'inpatient' | 'emergency' | 'follow_up',
        chief_complaint: formData.chief_complaint,
        history_of_present_illness: formData.history_of_present_illness,
        physical_examination: formData.physical_examination,
        assessment: formData.assessment,
        diagnosis_primary: formData.diagnosis_primary,
        diagnosis_secondary: formData.diagnosis_secondary,
        treatment_plan: formData.treatment_plan,
        medications_prescribed: formData.medications_prescribed,
        procedures: formData.procedures,
        lab_tests_ordered: formData.lab_tests_ordered,
        follow_up_instructions: formData.follow_up_instructions,
        follow_up_date: formData.follow_up_date,
        vital_signs: {
          temperature: formData.vital_signs.temperature
            ? parseFloat(formData.vital_signs.temperature)
            : undefined,
          heart_rate: formData.vital_signs.heart_rate
            ? parseInt(formData.vital_signs.heart_rate)
            : undefined,
          respiratory_rate: formData.vital_signs.respiratory_rate
            ? parseInt(formData.vital_signs.respiratory_rate)
            : undefined,
          blood_pressure: {
            systolic: formData.vital_signs.blood_pressure_systolic
              ? parseInt(formData.vital_signs.blood_pressure_systolic)
              : undefined,
            diastolic: formData.vital_signs.blood_pressure_diastolic
              ? parseInt(formData.vital_signs.blood_pressure_diastolic)
              : undefined,
          },
          oxygen_saturation: formData.vital_signs.oxygen_saturation
            ? parseFloat(formData.vital_signs.oxygen_saturation)
            : undefined,
          weight: formData.vital_signs.weight
            ? parseFloat(formData.vital_signs.weight)
            : undefined,
          height: formData.vital_signs.height
            ? parseFloat(formData.vital_signs.height)
            : undefined,
          pain_score: formData.vital_signs.pain_score
            ? parseInt(formData.vital_signs.pain_score)
            : undefined,
          temperature_site: formData.vital_signs.temperature_site,
        } as any,
      };

      if (isEditMode && editEncounterId) {
        await encountersApi.update(editEncounterId, encounterData);
        toast.success('Encounter updated successfully');
        queryClient.invalidateQueries({ queryKey: ['encounter', editEncounterId] });
        queryClient.invalidateQueries({ queryKey: ['patientHistory', patientId] });
      } else {
        const response = await encountersApi.create(encounterData);
        toast.success('Encounter created successfully');
        queryClient.invalidateQueries({ queryKey: ['patientHistory', patientId] });
        navigate(`/encounters/${response.data.encounter.id}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || (isEditMode ? 'Failed to update encounter' : 'Failed to create encounter');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link to={`/patients/${patientId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Encounter</h1>
            <p className="text-gray-500">
              Patient: {patient?.full_name} ({patient?.patient_id})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visit Information */}
          <Card>
            <CardHeader>
              <CardTitle>Visit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visit_type">Visit Type</Label>
                  <Select
                    value={formData.visit_type}
                    onValueChange={(value) => handleChange('visit_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outpatient">Outpatient</SelectItem>
                      <SelectItem value="inpatient">Inpatient</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow_up_date">Follow-up Date</Label>
                  <Input
                    id="follow_up_date"
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => handleChange('follow_up_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chief_complaint">Chief Complaint</Label>
                <Textarea
                  id="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={(e) => handleChange('chief_complaint', e.target.value)}
                  placeholder="Patient's main complaint"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="history_of_present_illness">History of Present Illness</Label>
                <Textarea
                  id="history_of_present_illness"
                  value={formData.history_of_present_illness}
                  onChange={(e) => handleChange('history_of_present_illness', e.target.value)}
                  placeholder="Detailed history of the current illness"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="physical_examination">Physical Examination</Label>
                <Textarea
                  id="physical_examination"
                  value={formData.physical_examination}
                  onChange={(e) => handleChange('physical_examination', e.target.value)}
                  placeholder="Physical examination findings"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vital Signs */}
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={formData.vital_signs.temperature}
                      onChange={(e) => handleVitalChange('temperature', e.target.value)}
                      placeholder="36.5"
                    />
                    <Select
                      value={formData.vital_signs.temperature_site}
                      onValueChange={(value) => handleVitalChange('temperature_site', value)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oral">Oral</SelectItem>
                        <SelectItem value="axillary">Axillary</SelectItem>
                        <SelectItem value="rectal">Rectal</SelectItem>
                        <SelectItem value="tympanic">Tympanic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                  <Input
                    id="heart_rate"
                    type="number"
                    value={formData.vital_signs.heart_rate}
                    onChange={(e) => handleVitalChange('heart_rate', e.target.value)}
                    placeholder="72"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="respiratory_rate">Respiratory Rate (/min)</Label>
                  <Input
                    id="respiratory_rate"
                    type="number"
                    value={formData.vital_signs.respiratory_rate}
                    onChange={(e) => handleVitalChange('respiratory_rate', e.target.value)}
                    placeholder="16"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Blood Pressure (mmHg)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Systolic"
                      value={formData.vital_signs.blood_pressure_systolic}
                      onChange={(e) => handleVitalChange('blood_pressure_systolic', e.target.value)}
                    />
                    <span className="text-gray-500">/</span>
                    <Input
                      type="number"
                      placeholder="Diastolic"
                      value={formData.vital_signs.blood_pressure_diastolic}
                      onChange={(e) => handleVitalChange('blood_pressure_diastolic', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygen_saturation">Oxygen Saturation (%)</Label>
                  <Input
                    id="oxygen_saturation"
                    type="number"
                    step="0.1"
                    value={formData.vital_signs.oxygen_saturation}
                    onChange={(e) => handleVitalChange('oxygen_saturation', e.target.value)}
                    placeholder="98"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pain_score">Pain Score (0-10)</Label>
                  <Input
                    id="pain_score"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.vital_signs.pain_score}
                    onChange={(e) => handleVitalChange('pain_score', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.vital_signs.weight}
                    onChange={(e) => handleVitalChange('weight', e.target.value)}
                    placeholder="70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={formData.vital_signs.height}
                    onChange={(e) => handleVitalChange('height', e.target.value)}
                    placeholder="170"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment & Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment & Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assessment">Assessment</Label>
                <Textarea
                  id="assessment"
                  value={formData.assessment}
                  onChange={(e) => handleChange('assessment', e.target.value)}
                  placeholder="Clinical assessment"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis_primary">Primary Diagnosis</Label>
                  <Input
                    id="diagnosis_primary"
                    value={formData.diagnosis_primary}
                    onChange={(e) => handleChange('diagnosis_primary', e.target.value)}
                    placeholder="Primary diagnosis"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis_secondary">Secondary Diagnosis</Label>
                  <Input
                    id="diagnosis_secondary"
                    value={formData.diagnosis_secondary}
                    onChange={(e) => handleChange('diagnosis_secondary', e.target.value)}
                    placeholder="Secondary diagnosis"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment_plan">Treatment Plan</Label>
                <Textarea
                  id="treatment_plan"
                  value={formData.treatment_plan}
                  onChange={(e) => handleChange('treatment_plan', e.target.value)}
                  placeholder="Treatment plan and recommendations"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications_prescribed">Medications Prescribed</Label>
                <Textarea
                  id="medications_prescribed"
                  value={formData.medications_prescribed}
                  onChange={(e) => handleChange('medications_prescribed', e.target.value)}
                  placeholder="List medications prescribed"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="procedures">Procedures</Label>
                <Textarea
                  id="procedures"
                  value={formData.procedures}
                  onChange={(e) => handleChange('procedures', e.target.value)}
                  placeholder="Procedures performed"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lab_tests_ordered">Lab Tests Ordered</Label>
                <Textarea
                  id="lab_tests_ordered"
                  value={formData.lab_tests_ordered}
                  onChange={(e) => handleChange('lab_tests_ordered', e.target.value)}
                  placeholder="List lab tests ordered"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow_up_instructions">Follow-up Instructions</Label>
                <Textarea
                  id="follow_up_instructions"
                  value={formData.follow_up_instructions}
                  onChange={(e) => handleChange('follow_up_instructions', e.target.value)}
                  placeholder="Instructions for follow-up care"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/patients/${patientId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Encounter
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
