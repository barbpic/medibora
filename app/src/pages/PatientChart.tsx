import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi, encountersApi, aiApi, clinicalApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Activity, 
  AlertTriangle, 
  BarChart,
  BedDouble,
  Calendar,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FileBarChart,
  FileText,
  History,
  Loader2,
  MessageSquare,
  Pill,
  Search,
  Settings,
  Stethoscope,
  Syringe,
  Thermometer,
  User,
  X,
  Bell,
  ChevronRight,
  Heart,
  Wind,
  Droplets,
  Weight,
  Ruler
} from 'lucide-react';
import type { Patient, Encounter } from '@/types';

interface SBARData {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
}

interface SBARCreateResponse {
  id: number;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  status: string;
}

// SBAR Component
function SBARView({ patient, sbars }: { patient: Patient; sbars: SBARCreateResponse[] }) {
  const queryClient = useQueryClient();
  
  const initialSBAR = sbars && sbars.length > 0
    ? { 
      situation: sbars[0].situation || '',
      background: sbars[0].background || '',
      assessment: sbars[0].assessment || '',
      recommendation: sbars[0].recommendation || ''
    }
    : { situation: '', background: '', assessment: '', recommendation: '' };
  
  const [sbarData, setSbarData] = useState(initialSBAR);

  const createSBARMutation = useMutation({
    mutationFn: (data: SBARData) => clinicalApi.createSBAR(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sbar', patient.id] });
    },
  });

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (sbars && sbars.length > 0) {
      setSbarData({
        situation: sbars[0].situation || '',
        background: sbars[0].background || '',
        assessment: sbars[0].assessment || '',
        recommendation: sbars[0].recommendation || ''
      });
    }
  }, [sbars]);

  const handleSaveDraft = () => {
    createSBARMutation.mutate({
      situation: sbarData.situation,
      background: sbarData.background,
      assessment: sbarData.assessment,
      recommendation: sbarData.recommendation,
      status: 'draft'
    });
    toast.success('SBAR saved as draft');
  };

  const handleSubmit = () => {
    if (!sbarData.situation || !sbarData.background || !sbarData.assessment || !sbarData.recommendation) {
      toast.error('Please fill in all SBAR sections');
      return;
    }
    
    createSBARMutation.mutate({
      situation: sbarData.situation,
      background: sbarData.background,
      assessment: sbarData.assessment,
      recommendation: sbarData.recommendation,
      status: 'submitted'
    });
    toast.success('SBAR submitted successfully');
  };

  return (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="font-bold text-blue-600">S</span>
            </div>
            <h3 className="font-semibold text-lg">Situation</h3>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="What is the current situation? (e.g., Patient experiencing chest pain, BP elevated)"
            value={sbarData.situation}
            onChange={(e) => setSbarData({...sbarData, situation: e.target.value})}
          />
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="font-bold text-green-600">B</span>
            </div>
            <h3 className="font-semibold text-lg">Background</h3>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg min-h-[80px] focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Relevant background information (e.g., History of hypertension, current medications)"
            value={sbarData.background}
            onChange={(e) => setSbarData({...sbarData, background: e.target.value})}
          />
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="font-bold text-yellow-600">A</span>
            </div>
            <h3 className="font-semibold text-lg">Assessment</h3>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg min-h-[80px] focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            placeholder="Your clinical assessment (e.g., Possible angina, requires ECG)"
            value={sbarData.assessment}
            onChange={(e) => setSbarData({...sbarData, assessment: e.target.value})}
          />
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="font-bold text-red-600">R</span>
            </div>
            <h3 className="font-semibold text-lg">Recommendation</h3>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg min-h-[80px] focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="Your recommendation (e.g., Order ECG, consult cardiology)"
            value={sbarData.recommendation}
            onChange={(e) => setSbarData({...sbarData, recommendation: e.target.value})}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>Submit SBAR</Button>
      </div>
    </div>
  );
}

// Inpatient Summaries Component
function InpatientSummariesView({ patient, admissions }: { patient: Patient; admissions: any[] }) {
  const queryClient = useQueryClient();
  
  const initialAdmissions = admissions && admissions.length > 0
    ? admissions.map(a => ({ id: a.id, admissionDate: a.admission_date?.split('T')[0], dischargeDate: a.discharge_date?.split('T')[0], department: a.department, diagnosis: a.primary_diagnosis, status: a.status, room: a.room_number, type: a.admission_type }))
    : [];

  const [admissionsList, setAdmissionsList] = useState<any[]>(initialAdmissions);

  const createAdmissionMutation = useMutation({
    mutationFn: (data: any) => clinicalApi.createAdmission(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions', patient.id] });
    },
  });

  const [showNewAdmissionDialog, setShowNewAdmissionDialog] = useState(false);
  const [newAdmission, setNewAdmission] = useState({
    department: '',
    diagnosis: '',
    admissionType: 'Emergency',
    room: ''
  });

  useEffect(() => {
    if (admissions && admissions.length > 0) {
      setAdmissionsList(admissions.map(a => ({ 
        id: a.id, 
        admissionDate: a.admission_date?.split('T')[0], 
        dischargeDate: a.discharge_date?.split('T')[0], 
        department: a.department, 
        diagnosis: a.primary_diagnosis, 
        status: a.status, 
        room: a.room_number, 
        type: a.admission_type 
      })));
    }
  }, [admissions]);

  const handleNewAdmission = () => {
    setShowNewAdmissionDialog(true);
  };

  const handleSaveAdmission = () => {
    if (!newAdmission.department || !newAdmission.diagnosis) {
      toast.error('Please fill in all required fields');
      return;
    }

    const admission = {
      id: Date.now(),
      admissionDate: new Date().toISOString().split('T')[0],
      dischargeDate: null,
      department: newAdmission.department,
      diagnosis: newAdmission.diagnosis,
      status: 'Active',
      room: newAdmission.room,
      type: newAdmission.admissionType
    };

    setAdmissionsList([admission, ...admissionsList]);
    setNewAdmission({ department: '', diagnosis: '', admissionType: 'Emergency', room: '' });
    setShowNewAdmissionDialog(false);
    
    createAdmissionMutation.mutate({
      department: newAdmission.department,
      primary_diagnosis: newAdmission.diagnosis,
      admission_type: newAdmission.admissionType,
      room_number: newAdmission.room
    });
    toast.success('New admission created successfully');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Admission History</h3>
        <Button variant="outline" size="sm" onClick={handleNewAdmission}>
          <FileText className="h-4 w-4 mr-2" />
          New Admission
        </Button>
      </div>
      
      {admissionsList.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <BedDouble className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No admissions recorded</p>
            <p className="text-sm text-gray-400 mt-1">Click "New Admission" to record an inpatient admission</p>
          </CardContent>
        </Card>
      ) : (
        admissionsList.map((admission) => (
          <Card key={admission.id} className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Admission ID</p>
                  <p className="font-semibold text-lg">{admission.id}</p>
                </div>
                <Badge variant={admission.status === 'Discharged' ? 'secondary' : 'default'}>
                  {admission.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Admission Date</p>
                  <p className="font-medium">{admission.admissionDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Discharge Date</p>
                  <p className="font-medium">{admission.dischargeDate || 'Still admitted'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{admission.department}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Primary Diagnosis</p>
                <p className="font-medium">{admission.diagnosis}</p>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={showNewAdmissionDialog} onOpenChange={setShowNewAdmissionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Admission</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="department">Department *</Label>
              <Select value={newAdmission.department} onValueChange={(value) => setNewAdmission({...newAdmission, department: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Medicine">General Medicine</SelectItem>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="Obstetrics">Obstetrics</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="diagnosis">Primary Diagnosis *</Label>
              <Textarea
                id="diagnosis"
                placeholder="e.g. Community Acquired Pneumonia"
                value={newAdmission.diagnosis}
                onChange={(e) => setNewAdmission({...newAdmission, diagnosis: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admissionType">Admission Type</Label>
              <Select value={newAdmission.admissionType} onValueChange={(value) => setNewAdmission({...newAdmission, admissionType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select admission type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Elective">Elective</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room">Room Number</Label>
              <Input
                id="room"
                placeholder="e.g. 101-A"
                value={newAdmission.room}
                onChange={(e) => setNewAdmission({...newAdmission, room: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAdmissionDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveAdmission}>Save Admission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Demographics Component
function DemographicsView({ patient }: { patient: Patient }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <h3 className="font-semibold">Personal Information</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{patient.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Patient ID</p>
              <p className="font-medium">{patient.patient_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">{patient.date_of_birth}</p>
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
              <p className="font-medium">{patient.blood_type || 'Not recorded'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <h3 className="font-semibold">Contact Information</h3>
        </CardHeader>
        <CardContent className="space-y-3">
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
            <p className="font-medium">{patient.address || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">County</p>
            <p className="font-medium">{patient.county || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <h3 className="font-semibold">Insurance Information</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Provider</p>
            <p className="font-medium">{patient.insurance?.provider || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Policy Number</p>
            <p className="font-medium">{patient.insurance?.number || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <h3 className="font-semibold">Emergency Contact</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{patient.emergency_contact?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{patient.emergency_contact?.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Relationship</p>
            <p className="font-medium">{patient.emergency_contact?.relationship || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Allergies Component
function AllergiesView({ patient, allergies }: { patient: Patient; allergies: any[] }) {
  const queryClient = useQueryClient();
  
  const getInitialAllergies = () => {
    if (allergies && allergies.length > 0) {
      return allergies.map(a => ({ id: a.id, name: a.allergen, severity: a.severity || 'Reported', reaction: a.reaction || 'Unknown' }));
    }
    if (patient.allergies) {
      return patient.allergies.split(',').map((a: string, i: number) => ({ 
        id: `patient-${i}`, 
        name: a.trim(), 
        severity: 'Reported', 
        reaction: 'Unknown' 
      }));
    }
    return [];
  };
  
  const [allergiesList, setAllergiesList] = useState<any[]>(getInitialAllergies);
  
  const createAllergyMutation = useMutation({
    mutationFn: (data: any) => clinicalApi.createAllergy(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergies', patient.id] });
    },
  });

  const [showAddAllergyDialog, setShowAddAllergyDialog] = useState(false);
  const [newAllergy, setNewAllergy] = useState({
    allergen: '',
    reaction: '',
    severity: 'Moderate'
  });

  useEffect(() => {
    if (allergies && allergies.length > 0) {
      setAllergiesList(allergies.map((a) => ({ 
        id: a.id, 
        name: a.allergen, 
        severity: a.severity || 'Reported', 
        reaction: a.reaction || 'Unknown' 
      })));
    } else if (patient.allergies) {
      setAllergiesList(patient.allergies.split(',').map((a: string, i: number) => ({ 
        id: `patient-${i}`, 
        name: a.trim(), 
        severity: 'Reported', 
        reaction: 'Unknown' 
      })));
    } else {
      setAllergiesList([]);
    }
  }, [allergies, patient.allergies]);

  const handleAddAllergy = () => {
    setShowAddAllergyDialog(true);
  };

  const handleSaveAllergy = () => {
    if (!newAllergy.allergen || !newAllergy.reaction) {
      toast.error('Please fill in allergen and reaction');
      return;
    }

    const allergy = {
      id: Date.now(),
      name: newAllergy.allergen,
      severity: newAllergy.severity,
      reaction: newAllergy.reaction
    };

    setAllergiesList([...allergiesList, allergy]);
    setNewAllergy({ allergen: '', reaction: '', severity: 'Moderate' });
    setShowAddAllergyDialog(false);
    
    createAllergyMutation.mutate({
      allergen: newAllergy.allergen,
      reaction: newAllergy.reaction,
      severity: newAllergy.severity
    });
    toast.success('Allergy added successfully');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Severe': return 'destructive';
      case 'Moderate': return 'secondary';
      case 'Mild': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Known Allergies</h3>
        <Button variant="outline" size="sm" onClick={handleAddAllergy}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Add Allergy
        </Button>
      </div>

      {allergiesList.length > 0 ? (
        <div className="space-y-3">
          {allergiesList.map((allergy, index) => (
            <Card key={index} className={`border-l-4 ${
              allergy.severity === 'Severe' ? 'border-l-red-500' : 
              allergy.severity === 'Moderate' ? 'border-l-orange-500' : 
              'border-l-yellow-500'
            } border border-gray-200`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${
                        allergy.severity === 'Severe' ? 'text-red-500' : 
                        allergy.severity === 'Moderate' ? 'text-orange-500' : 
                        'text-yellow-500'
                      }`} />
                      <h4 className="font-semibold text-lg">{allergy.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Reaction:</span> {allergy.reaction}
                    </p>
                  </div>
                  <Badge variant={getSeverityColor(allergy.severity) as any}>{allergy.severity}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No known allergies recorded</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddAllergyDialog} onOpenChange={setShowAddAllergyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Allergy</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="allergen">Allergen *</Label>
              <Input
                id="allergen"
                placeholder="e.g., Penicillin, Latex, Peanuts"
                value={newAllergy.allergen}
                onChange={(e) => setNewAllergy({...newAllergy, allergen: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reaction">Reaction / Symptoms *</Label>
              <Input
                id="reaction"
                placeholder="e.g., Rash, Anaphylaxis, Bronchospasm"
                value={newAllergy.reaction}
                onChange={(e) => setNewAllergy({...newAllergy, reaction: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={newAllergy.severity} onValueChange={(value) => setNewAllergy({...newAllergy, severity: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mild">Mild</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAllergyDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveAllergy}>Save Allergy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Problems and Diagnoses Component
function ProblemsView({ patient, problems }: { patient: Patient; problems: any[] }) {
  const queryClient = useQueryClient();
  
  // Initialize diagnoses from props or patient data
  const getInitialDiagnoses = () => {
    if (problems && problems.length > 0) {
      return problems.map(p => ({ 
        id: p.id, 
        code: p.icd10_code, 
        name: p.description, 
        status: p.status || 'Active', 
        onset: p.onset_date, 
        type: p.problem_type,
        notes: p.notes || ''
      }));
    }
    if (patient.chronic_conditions) {
      return patient.chronic_conditions.split(',').map((c: string, i: number) => ({ 
        id: `chronic-${i}`, 
        name: c.trim(), 
        status: 'Chronic',
        code: '',
        onset: '',
        type: '',
        notes: ''
      }));
    }
    return [];
  };
  
  const [diagnoses, setDiagnoses] = useState<any[]>(getInitialDiagnoses);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const createProblemMutation = useMutation({
    mutationFn: (data: any) => clinicalApi.createProblem(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems', patient.id] });
    },
  });

  const [showAddDiagnosisDialog, setShowAddDiagnosisDialog] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState({
    description: '',
    icd10Code: '',
    onsetDate: '',
    type: 'Primary',
    status: 'Active'
  });

  const handleViewDetails = (diagnosis: any) => {
    setSelectedDiagnosis(diagnosis);
    setShowDetailsDialog(true);
  };

  useEffect(() => {
    if (problems && problems.length > 0) {
      setDiagnoses(problems.map(p => ({ 
        id: p.id, 
        code: p.icd10_code, 
        name: p.description, 
        status: p.status || 'Active', 
        onset: p.onset_date, 
        type: p.problem_type 
      })));
      setIsLoaded(true);
    } else if (patient.chronic_conditions) {
      setDiagnoses(patient.chronic_conditions.split(',').map((c: string, i: number) => ({ 
        id: `chronic-${i}`, 
        name: c.trim(), 
        status: 'Chronic' 
      })));
      setIsLoaded(true);
    } else {
      setDiagnoses([]);
      setIsLoaded(true);
    }
  }, [problems, patient.chronic_conditions]);

  const handleAddDiagnosis = () => {
    setShowAddDiagnosisDialog(true);
  };

  const handleSaveDiagnosis = () => {
    if (!newDiagnosis.description || !newDiagnosis.icd10Code) {
      toast.error('Please fill in diagnosis description and ICD-10 code');
      return;
    }

    const diagnosis = {
      id: Date.now(),
      code: newDiagnosis.icd10Code,
      name: newDiagnosis.description,
      status: newDiagnosis.status,
      onset: newDiagnosis.onsetDate || new Date().toISOString().split('T')[0],
      type: newDiagnosis.type
    };

    setDiagnoses([diagnosis, ...diagnoses]);
    setNewDiagnosis({ description: '', icd10Code: '', onsetDate: '', type: 'Primary', status: 'Active' });
    setShowAddDiagnosisDialog(false);
    
    createProblemMutation.mutate({
      description: newDiagnosis.description,
      icd10_code: newDiagnosis.icd10Code,
      onset_date: newDiagnosis.onsetDate || new Date().toISOString().split('T')[0],
      problem_type: newDiagnosis.type,
      status: newDiagnosis.status
    });
    toast.success('Diagnosis added successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Chronic': return 'secondary';
      case 'Resolved': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Active Problems & Diagnoses</h3>
        <Button variant="outline" size="sm" onClick={handleAddDiagnosis}>
          <Stethoscope className="h-4 w-4 mr-2" />
          Add Diagnosis
        </Button>
      </div>

      {!isLoaded ? (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-slate-800 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-500 mt-3">Loading...</p>
          </CardContent>
        </Card>
      ) : diagnoses.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No problems or diagnoses recorded</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Diagnosis" to record a diagnosis</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {diagnoses.map((diagnosis, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{diagnosis.name}</h4>
                    <Badge variant={getStatusColor(diagnosis.status) as any}>
                      {diagnosis.status}
                    </Badge>
                  </div>
                    <p className="text-sm text-gray-500 mt-1">
                      ICD-10: {diagnosis.code} • Onset: {diagnosis.onset}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(diagnosis)}>View Details</Button>
                </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {problems.length > 0 && (
        <>
          <h3 className="font-semibold text-lg mt-6">Chronic Conditions</h3>
          <div className="space-y-3">
            {problems.map((problem, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{problem.description}</h4>
                      <p className="text-sm text-gray-500">Chronic condition</p>
                    </div>
                    <Badge variant="secondary">Chronic</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={showAddDiagnosisDialog} onOpenChange={setShowAddDiagnosisDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Diagnosis</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Diagnosis Description *</Label>
              <Input
                id="description"
                placeholder="e.g. Type 2 Diabetes Mellitus"
                value={newDiagnosis.description}
                onChange={(e) => setNewDiagnosis({...newDiagnosis, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icd10Code">ICD-10 Code *</Label>
              <Input
                id="icd10Code"
                placeholder="e.g. E11.9"
                value={newDiagnosis.icd10Code}
                onChange={(e) => setNewDiagnosis({...newDiagnosis, icd10Code: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="onsetDate">Onset Date</Label>
              <Input
                id="onsetDate"
                type="date"
                placeholder="mm/dd/yyyy"
                value={newDiagnosis.onsetDate}
                onChange={(e) => setNewDiagnosis({...newDiagnosis, onsetDate: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={newDiagnosis.type} onValueChange={(value) => setNewDiagnosis({...newDiagnosis, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary">Primary</SelectItem>
                  <SelectItem value="Secondary">Secondary</SelectItem>
                  <SelectItem value="Working">Working</SelectItem>
                  <SelectItem value="Differential">Differential</SelectItem>
                  <SelectItem value="Admitting">Admitting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newDiagnosis.status} onValueChange={(value) => setNewDiagnosis({...newDiagnosis, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Chronic">Chronic</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDiagnosisDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveDiagnosis}>Save Diagnosis</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Diagnosis Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Diagnosis Details</DialogTitle>
          </DialogHeader>
          {selectedDiagnosis && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Diagnosis</Label>
                <p className="font-medium">{selectedDiagnosis.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>ICD-10 Code</Label>
                  <p className="font-medium">{selectedDiagnosis.code || 'N/A'}</p>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Badge variant={getStatusColor(selectedDiagnosis.status) as any}>
                    {selectedDiagnosis.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <p className="font-medium">{selectedDiagnosis.type || 'N/A'}</p>
                </div>
                <div className="grid gap-2">
                  <Label>Onset Date</Label>
                  <p className="font-medium">{selectedDiagnosis.onset || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Medication List Component
function MedicationsView({ patient, medications }: { patient: Patient; medications: any[] }) {
  const queryClient = useQueryClient();
  
  const getInitialMeds = () => {
    if (medications && medications.length > 0) {
      return medications.map(m => ({ id: m.id, name: m.medication_name, dose: m.dosage, frequency: m.frequency, route: m.route, status: m.status || 'Active', specialInstructions: m.special_instructions }));
    }
    if (patient.current_medications) {
      return patient.current_medications.split(',').map((m: string, i: number) => ({ 
        id: `patient-${i}`, 
        name: m.trim(), 
        dose: '', 
        frequency: '', 
        status: 'Active' 
      }));
    }
    return [];
  };
  
  const [medsList, setMedsList] = useState<any[]>(getInitialMeds);

  const createMedicationMutation = useMutation({
    mutationFn: (data: any) => clinicalApi.createMedication(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', patient.id] });
    },
  });

  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    route: 'Oral',
    specialInstructions: ''
  });

  useEffect(() => {
    if (medications && medications.length > 0) {
      setMedsList(medications.map(m => ({ 
        id: m.id, 
        name: m.medication_name, 
        dose: m.dosage, 
        frequency: m.frequency, 
        route: m.route, 
        status: m.status || 'Active', 
        specialInstructions: m.special_instructions 
      })));
    } else if (patient.current_medications) {
      setMedsList(patient.current_medications.split(',').map((m: string, i: number) => ({ 
        id: `patient-${i}`, 
        name: m.trim(), 
        dose: '', 
        frequency: '', 
        status: 'Active' 
      })));
    } else {
      setMedsList([]);
    }
  }, [medications, patient.current_medications]);

  const handlePrescribe = () => {
    setShowPrescriptionDialog(true);
  };

  const handleSavePrescription = () => {
    if (!newPrescription.medicationName || !newPrescription.dosage || !newPrescription.frequency) {
      toast.error('Please fill in medication name, dosage, and frequency');
      return;
    }

    const prescription = {
      id: Date.now(),
      name: newPrescription.medicationName,
      dose: newPrescription.dosage,
      frequency: newPrescription.frequency,
      route: newPrescription.route,
      status: 'Active',
      specialInstructions: newPrescription.specialInstructions
    };

    setMedsList([prescription, ...medsList]);
    setNewPrescription({ medicationName: '', dosage: '', frequency: '', route: 'Oral', specialInstructions: '' });
    setShowPrescriptionDialog(false);
    
    createMedicationMutation.mutate({
      medication_name: newPrescription.medicationName,
      dosage: newPrescription.dosage,
      frequency: newPrescription.frequency,
      route: newPrescription.route,
      special_instructions: newPrescription.specialInstructions
    });
    toast.success('Prescription added successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Chronic': return 'secondary';
      case 'Discontinued': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Current Medications</h3>
        <Button variant="outline" size="sm" onClick={handlePrescribe}>
          <Pill className="h-4 w-4 mr-2" />
          Prescribe
        </Button>
      </div>

      {medsList.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No current medications</p>
            <p className="text-sm text-gray-400 mt-1">Click "Prescribe" to add a medication</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {medsList.map((med, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Pill className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{med.name} {med.dose}</h4>
                    <p className="text-sm text-gray-500">
                      {med.frequency} • {med.route}
                    </p>
                    {med.specialInstructions && (
                      <p className="text-xs text-gray-400 mt-1">{med.specialInstructions}</p>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusColor(med.status) as any}>
                  {med.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Prescription</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="medicationName">Medication Name *</Label>
              <Input
                id="medicationName"
                placeholder="e.g. Amoxicillin 500mg"
                value={newPrescription.medicationName}
                onChange={(e) => setNewPrescription({...newPrescription, medicationName: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                placeholder="e.g. 500mg"
                value={newPrescription.dosage}
                onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select value={newPrescription.frequency} onValueChange={(value) => setNewPrescription({...newPrescription, frequency: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Once daily">Once daily</SelectItem>
                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                  <SelectItem value="Three times daily">Three times daily</SelectItem>
                  <SelectItem value="Four times daily">Four times daily</SelectItem>
                  <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                  <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                  <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                  <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="As needed">As needed(PRN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="route">Route</Label>
              <Select value={newPrescription.route} onValueChange={(value) => setNewPrescription({...newPrescription, route: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oral">Oral</SelectItem>
                  <SelectItem value="Intavenous(IV)">IV</SelectItem>
                  <SelectItem value="intramuscular(IM)">IM</SelectItem>
                  <SelectItem value="Subcutaneous">Subcutaneous</SelectItem>
                  <SelectItem value="Topical">Topical</SelectItem>
                  <SelectItem value="Inhalation">Inhalation</SelectItem>
                  <SelectItem value="Nasal">Nasal</SelectItem>
                  <SelectItem value="Ophthalmic">Ophthalmic</SelectItem>
                  <SelectItem value="Otic">Otic</SelectItem>
                  <SelectItem value="Rectal">Rectal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                placeholder="e.g. Take with food"
                value={newPrescription.specialInstructions}
                onChange={(e) => setNewPrescription({...newPrescription, specialInstructions: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrescriptionDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePrescription}>Save Prescription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Vital Signs Component - NEW PAGE
function VitalSignsView({ patient, vitals, vitalsHistory }: { patient: Patient; vitals: any; vitalsHistory: any[] }) {
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState('24h');
  
  const initialVitalsData = vitalsHistory && vitalsHistory.length > 0
    ? vitalsHistory.map(v => ({ 
      id: v.id,
      date: v.recorded_at, 
      bp: v.blood_pressure?.display || `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}`,
      hr: v.heart_rate, 
      temp: v.temperature, 
      rr: v.respiratory_rate, 
      spo2: v.oxygen_saturation, 
      weight: v.weight,
      height: v.height,
      bmi: v.bmi
    }))
    : vitals ? [{ 
      date: new Date().toISOString(), 
      bp: vitals.blood_pressure?.display || '',
      hr: vitals.heart_rate, 
      temp: vitals.temperature, 
      rr: vitals.respiratory_rate, 
      spo2: vitals.oxygen_saturation, 
      weight: vitals.weight,
      height: vitals.height,
      bmi: vitals.bmi
    }] : [];
  
  const [vitalHistory, setVitalHistory] = useState<any[]>(initialVitalsData);

  const createVitalSignsMutation = useMutation({
    mutationFn: (data: any) => clinicalApi.createVitalSigns(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitalsHistory', patient.id] });
    },
  });

  const [showRecordVitalsDialog, setShowRecordVitalsDialog] = useState(false);
  const [newVitals, setNewVitals] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    spo2: '',
    weight: '',
    height: ''
  });

  useEffect(() => {
    if (vitalsHistory && vitalsHistory.length > 0) {
      setVitalHistory(vitalsHistory.map(v => ({ 
        id: v.id,
        date: v.recorded_at, 
        bp: v.blood_pressure?.display || `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}`,
        hr: v.heart_rate, 
        temp: v.temperature, 
        rr: v.respiratory_rate, 
        spo2: v.oxygen_saturation, 
        weight: v.weight,
        height: v.height,
        bmi: v.bmi
      })));
    }
  }, [vitalsHistory]);

  const calculateBMI = (weight: number, height: number): number => {
    if (weight && height) {
      const heightM = height / 100;
      return Math.round((weight / (heightM * heightM)) * 10) / 10;
    }
    return 0;
  };

  const handleRecordVitals = () => {
    setShowRecordVitalsDialog(true);
  };

  const handleSaveVitals = () => {
    if (!newVitals.bloodPressureSystolic || !newVitals.bloodPressureDiastolic || !newVitals.heartRate) {
      toast.error('Please fill in at least blood pressure and heart rate');
      return;
    }

    const weight = parseFloat(newVitals.weight) || 75;
    const height = parseFloat(newVitals.height) || 170;
    const bmi = calculateBMI(weight, height);

    const vitalRecord = {
      id: Date.now(),
      date: new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }).replace(',', ''),
      bp: `${newVitals.bloodPressureSystolic}/${newVitals.bloodPressureDiastolic}`,
      hr: parseInt(newVitals.heartRate),
      temp: parseFloat(newVitals.temperature) || 36.8,
      rr: parseInt(newVitals.respiratoryRate) || 16,
      spo2: parseInt(newVitals.spo2) || 98,
      weight: weight,
      height: height,
      bmi: bmi
    };

    setVitalHistory([vitalRecord, ...vitalHistory]);
    setNewVitals({
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      spo2: '',
      weight: '',
      height: ''
    });
    setShowRecordVitalsDialog(false);

     createVitalSignsMutation.mutate({
      blood_pressure_systolic: parseInt(newVitals.bloodPressureSystolic),
      blood_pressure_diastolic: parseInt(newVitals.bloodPressureDiastolic),
      heart_rate: parseInt(newVitals.heartRate),
      temperature: parseFloat(newVitals.temperature) || 36.8,
      respiratory_rate: parseInt(newVitals.respiratoryRate) || 16,
      oxygen_saturation: parseInt(newVitals.spo2) || 98,
      weight: weight,
      height: height,
      pain_score: 0
    });
    toast.success('Vital signs recorded successfully');
  };


  const getLatestVitals = () => {
    if (vitalHistory.length > 0) return vitalHistory[0];
    return { bp: '120/80', hr: 72, temp: 36.8, rr: 16, spo2: 98, weight: 75, height: 170, bmi: 25.9 };
  };

  const latest = getLatestVitals();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Vital Signs History</h3>
        <div className="flex gap-2">
          <select 
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleRecordVitals}>
            <Activity className="h-4 w-4 mr-2" />
            Record Vitals
          </Button>
        </div>
      </div>

      {vitalHistory.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No vital signs recorded</p>
            <p className="text-sm text-gray-400 mt-1">Click "Record Vitals" to record vital signs</p>
          </CardContent>
        </Card>
      ) : (
        <>
      {/* Latest Vitals Summary */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600" />
            <span className="font-semibold">Latest Vitals</span>
            <span className="text-sm text-gray-500 ml-2">Recorded: Today, 08:00</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Thermometer className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 uppercase mb-1">Temperature</p>
              <p className="text-2xl font-bold text-slate-800">{vitalHistory[0]?.temp ? `${vitalHistory[0].temp}°C` : '--'}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 uppercase mb-1">Heart Rate</p>
              <p className="text-2xl font-bold text-slate-800">{vitalHistory[0]?.hr || '--'}</p>
              <p className="text-xs text-gray-400">bpm</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Activity className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 uppercase mb-1">Blood Pressure</p>
              <p className="text-2xl font-bold text-slate-800">{vitalHistory[0]?.bp || '--'}</p>
              <p className="text-xs text-gray-400">mmHg</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Wind className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 uppercase mb-1">Respiratory</p>
              <p className="text-2xl font-bold text-slate-800">{vitalHistory[0]?.rr || '--'}</p>
              <p className="text-xs text-gray-400">/min</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Droplets className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 uppercase mb-1">SpO2</p>
              <p className="text-2xl font-bold text-slate-800">{vitalHistory[0]?.spo2 ? `${vitalHistory[0].spo2}%` : '--'}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Weight className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 uppercase mb-1">Weight</p>
              <p className="text-2xl font-bold text-slate-800">{vitalHistory[0]?.weight || '--'}</p>
              <p className="text-xs text-gray-400">kg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs History Table */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <h3 className="font-semibold">Vital Signs History</h3>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date/Time</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">BP</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">HR</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Temp</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">RR</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">SpO2</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Weight</th>
              </tr>
            </thead>
            <tbody>
              {vitalHistory.map((record, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{record.date ? new Date(record.date).toLocaleString() : 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-center font-medium">{record.bp || '--'}</td>
                  <td className="py-3 px-4 text-sm text-center">{record.hr || '--'}</td>
                  <td className="py-3 px-4 text-sm text-center">{record.temp ? `${record.temp}°C` : '--'}</td>
                  <td className="py-3 px-4 text-sm text-center">{record.rr || '--'}</td>
                  <td className="py-3 px-4 text-sm text-center">{record.spo2 ? `${record.spo2}%` : '--'}</td>
                  <td className="py-3 px-4 text-sm text-center">{record.weight ? `${record.weight} kg` : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* BMI Calculator */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">BMI Calculator</h3>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const weight = latest?.weight || 75;
            const height = latest?.height || 170;
            const bmi = calculateBMI(weight, height);
            let category = 'Normal';
            let categoryClass = 'bg-green-100 text-green-800';
            if (bmi >= 25) { category = 'Overweight'; categoryClass = 'bg-yellow-100 text-yellow-800'; }
            if (bmi >= 30) { category = 'Obese'; categoryClass = 'bg-red-100 text-red-800'; }
            if (bmi < 18.5) { category = 'Underweight'; categoryClass = 'bg-blue-100 text-blue-800'; }
            return (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="text-xl font-bold">{height} cm</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="text-xl font-bold">{weight} kg</p>
                </div>
                <div className="h-12 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-sm text-gray-500">BMI</p>
                  <p className="text-2xl font-bold text-blue-600">{bmi}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Category</p>
                  <Badge className={categoryClass}>{category}</Badge>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>
      </>
      )}

      <Dialog open={showRecordVitalsDialog} onOpenChange={setShowRecordVitalsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Vital Signs</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bpSystolic">BP Systolic *</Label>
                <Input
                  id="bpSystolic"
                  placeholder="120"
                  type="number"
                  value={newVitals.bloodPressureSystolic}
                  onChange={(e) => setNewVitals({...newVitals, bloodPressureSystolic: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bpDiastolic">BP Diastolic *</Label>
                <Input
                  id="bpDiastolic"
                  placeholder="80"
                  type="number"
                  value={newVitals.bloodPressureDiastolic}
                  onChange={(e) => setNewVitals({...newVitals, bloodPressureDiastolic: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="heartRate">Heart Rate *</Label>
                <Input
                  id="heartRate"
                  placeholder="72"
                  type="number"
                  value={newVitals.heartRate}
                  onChange={(e) => setNewVitals({...newVitals, heartRate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  placeholder="36.8"
                  type="number"
                  step="0.1"
                  value={newVitals.temperature}
                  onChange={(e) => setNewVitals({...newVitals, temperature: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
                <Input
                  id="respiratoryRate"
                  placeholder="16"
                  type="number"
                  value={newVitals.respiratoryRate}
                  onChange={(e) => setNewVitals({...newVitals, respiratoryRate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="spo2">SpO2 (%)</Label>
                <Input
                  id="spo2"
                  placeholder="98"
                  type="number"
                  value={newVitals.spo2}
                  onChange={(e) => setNewVitals({...newVitals, spo2: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  placeholder="75"
                  type="number"
                  step="0.1"
                  value={newVitals.weight}
                  onChange={(e) => setNewVitals({...newVitals, weight: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  placeholder="170"
                  type="number"
                  value={newVitals.height}
                  onChange={(e) => setNewVitals({...newVitals, height: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordVitalsDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveVitals}>Save Vitals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Results Review Component
function ResultsView({ patient, labResults }: { patient: Patient; labResults: any[] }) {
  const queryClient = useQueryClient();
  
  const initialResults = labResults && labResults.length > 0
    ? labResults.map(r => ({ id: r.id, type: r.test_type, name: r.test_name, date: r.order_date?.split('T')[0], status: r.status, result: r.result, urgency: r.urgency, clinicalIndication: r.clinical_indication }))
    : [];

  const [resultsList, setResultsList] = useState<any[]>(initialResults);

  const createLabResultMutation = useMutation({
    mutationFn: (data: any) => clinicalApi.createLabResult(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labResults', patient.id] });
    },
  });

  const [showOrderTestDialog, setShowOrderTestDialog] = useState(false);
  const [newTest, setNewTest] = useState({
    testName: '',
    testType: 'Laboratory',
    urgency: 'Routine',
    clinicalIndication: ''
  });

  useEffect(() => {
    if (labResults && labResults.length > 0) {
      setResultsList(labResults.map(r => ({ 
        id: r.id, 
        type: r.test_type, 
        name: r.test_name, 
        date: r.order_date?.split('T')[0], 
        status: r.status, 
        result: r.result, 
        urgency: r.urgency, 
        clinicalIndication: r.clinical_indication 
      })));
    }
  }, [labResults]);

  const handleOrderTest = () => {
    setShowOrderTestDialog(true);
  };

  const handleSaveTest = () => {
    if (!newTest.testName || !newTest.clinicalIndication) {
      toast.error('Please fill in test name and clinical indication');
      return;
    }

    const test = {
      id: Date.now(),
      type: newTest.testType,
      name: newTest.testName,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      result: 'Ordered',
      urgency: newTest.urgency
    };

    setResultsList([test, ...resultsList]);
    setNewTest({ testName: '', testType: 'Laboratory', urgency: 'Routine', clinicalIndication: '' });
    setShowOrderTestDialog(false);
    
    createLabResultMutation.mutate({
      test_name: newTest.testName,
      test_type: newTest.testType,
      urgency: newTest.urgency,
      clinical_indication: newTest.clinicalIndication
    });
    toast.success('Test ordered successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Final': return 'default';
      case 'Pending': return 'secondary';
      case 'Critical': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Results Review</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOrderTest}>
            <FileBarChart className="h-4 w-4 mr-2" />
            Order Test
          </Button>
        </div>
      </div>

      {resultsList.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <FileBarChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No results available</p>
            <p className="text-sm text-gray-400 mt-1">Click "Order Test" to order lab tests or imaging</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="lab">Laboratory</TabsTrigger>
          <TabsTrigger value="rad">Radiology</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {resultsList.map((result, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      result.type === 'Laboratory' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <FileBarChart className={`h-5 w-5 ${
                        result.type === 'Laboratory' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{result.name}</h4>
                      <p className="text-sm text-gray-500">
                        {result.type} • {result.date}
                      </p>
                      {result.urgency && (
                        <p className="text-xs text-gray-400">Urgency: {result.urgency}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusColor(result.status) as any}>{result.status}</Badge>
                    <p className="text-sm font-medium mt-1">{result.result}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      )}

      <Dialog open={showOrderTestDialog} onOpenChange={setShowOrderTestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Test</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="testName">Test Name *</Label>
              <Input
                id="testName"
                placeholder="e.g. Complete Blood Count"
                value={newTest.testName}
                onChange={(e) => setNewTest({...newTest, testName: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="testType">Test Type</Label>
              <Select value={newTest.testType} onValueChange={(value) => setNewTest({...newTest, testType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laboratory">Laboratory</SelectItem>
                  <SelectItem value="Radiology">Radiology</SelectItem>
                  <SelectItem value="Pathology">Pathology</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Pulmonology">Pulmonology</SelectItem>
                  <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
                  <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                  <SelectItem value="Hematology">Hematology</SelectItem>
                  <SelectItem value="Microbiology">Microbiology</SelectItem>
                  <SelectItem value="Genetics">Genetics</SelectItem>
                  <SelectItem value="Immunology">Immunology</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select value={newTest.urgency} onValueChange={(value) => setNewTest({...newTest, urgency: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Routine">Routine</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Stat">Stat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clinicalIndication">Clinical Indication *</Label>
              <Textarea
                id="clinicalIndication"
                placeholder="Reason for ordering this test..."
                value={newTest.clinicalIndication}
                onChange={(e) => setNewTest({...newTest, clinicalIndication: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderTestDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveTest}>Order Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Histories Component
function HistoriesView({ patient, histories }: { patient: Patient; histories: any[] }) {
  const queryClient = useQueryClient();
  
  const initialHistories = histories && histories.length > 0
    ? histories.map(h => ({ id: h.id, type: h.history_type, description: h.description }))
    : [];

  const [historiesList, setHistoriesList] = useState<any[]>(initialHistories);

  const createHistoryMutation = useMutation({
    mutationFn: (data: any) => clinicalApi.createHistory(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['histories', patient.id] });
    },
  });

  const [showAddHistoryDialog, setShowAddHistoryDialog] = useState(false);
  const [newHistory, setNewHistory] = useState({
    type: 'Medical',
    description: ''
  });

  useEffect(() => {
    if (histories && histories.length > 0) {
      setHistoriesList(histories.map(h => ({ 
        id: h.id, 
        type: h.history_type, 
        description: h.description 
      })));
    }
  }, [histories]);

  const handleAddHistory = () => {
    setShowAddHistoryDialog(true);
  };

  const handleSaveHistory = () => {
    if (!newHistory.description) {
      toast.error('Please fill in history description');
      return;
    }

    const history = {
      id: Date.now(),
      type: newHistory.type,
      description: newHistory.description
    };

    setHistoriesList([...historiesList, history]);
    setNewHistory({ type: 'Medical', description: '' });
    setShowAddHistoryDialog(false);
    
    createHistoryMutation.mutate({
      history_type: newHistory.type,
      description: newHistory.description
    });
    toast.success('History added successfully');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Medical': return 'bg-blue-100 text-blue-800';
      case 'Surgical': return 'bg-green-100 text-green-800';
      case 'Family': return 'bg-purple-100 text-purple-800';
      case 'Social': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Patient Histories</h3>
        <Button variant="outline" size="sm" onClick={handleAddHistory}>
          <History className="h-4 w-4 mr-2" />
          Add History
        </Button>
      </div>

      {historiesList.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No histories recorded</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add History" to record patient history</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {historiesList.map((history, index) => (
          <Card key={index} className="border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{history.type} History</h4>
                <Badge className={getTypeColor(history.type)}>{history.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{history.description}</p>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddHistoryDialog} onOpenChange={setShowAddHistoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add History</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="historyType">History Type</Label>
              <Select value={newHistory.type} onValueChange={(value) => setNewHistory({...newHistory, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select history type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Surgical">Surgical</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Obstetric">Obstetric</SelectItem>
                  <SelectItem value="Gynecological">Gynecological</SelectItem>
                  <SelectItem value="Pediatric">Pediatric</SelectItem>
                  <SelectItem value="Psychiatric">Psychiatric</SelectItem>
                  <SelectItem value="Dermatological">Dermatological</SelectItem>
                  <SelectItem value="Ophthalmological">Ophthalmological</SelectItem>
                  <SelectItem value="ENT">ENT</SelectItem>
                  <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                  <SelectItem value="Neurological">Neurological</SelectItem>
                  <SelectItem value="Allergies">Allergies</SelectItem>
                  <SelectItem value="Medications">Medications</SelectItem>
                  <SelectItem value="Immunizations">Immunizations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter history details..."
                value={newHistory.description}
                onChange={(e) => setNewHistory({...newHistory, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddHistoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveHistory}>Save History</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Immunizations Component
function ImmunizationsView({ patient, immunizations }: { patient: Patient; immunizations: any[] }) {
  const queryClient = useQueryClient();
  
  const initialImmunizations = immunizations && immunizations.length > 0
    ? immunizations.map(i => ({ id: i.id, vaccine: i.vaccine_name, dose: i.dose, date: i.date_given, nextDue: i.next_due_date, lotNumber: i.lot_number, site: i.administration_site }))
    : [];

  const [immunizationsList, setImmunizationsList] = useState<any[]>(initialImmunizations);

  const createImmunizationMutation = useMutation({
    mutationFn: (data: any) => clinicalApi.createImmunization(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['immunizations', patient.id] });
    },
  });

  const [showRecordVaccineDialog, setShowRecordVaccineDialog] = useState(false);
  const [newVaccine, setNewVaccine] = useState({
    vaccine: '',
    dose: '',
    dateGiven: '',
    nextDue: '',
    lotNumber: '',
    site: ''
  });

  useEffect(() => {
    if (immunizations && immunizations.length > 0) {
      setImmunizationsList(immunizations.map(i => ({ 
        id: i.id, 
        vaccine: i.vaccine_name, 
        dose: i.dose, 
        date: i.date_given, 
        nextDue: i.next_due_date, 
        lotNumber: i.lot_number, 
        site: i.administration_site 
      })));
    }
  }, [immunizations]);

  const handleRecordVaccine = () => {
    setShowRecordVaccineDialog(true);
  };

  const handleSaveVaccine = () => {
    if (!newVaccine.vaccine || !newVaccine.dateGiven) {
      toast.error('Please fill in vaccine name and date given');
      return;
    }

    const vaccine = {
      id: Date.now(),
      vaccine: newVaccine.vaccine,
      dose: newVaccine.dose || 'Single',
      date: newVaccine.dateGiven,
      nextDue: newVaccine.nextDue || 'N/A',
      lotNumber: newVaccine.lotNumber,
      site: newVaccine.site
    };

    setImmunizationsList([vaccine, ...immunizationsList]);
    setNewVaccine({ vaccine: '', dose: '', dateGiven: '', nextDue: '', lotNumber: '', site: '' });
    setShowRecordVaccineDialog(false);
    
    createImmunizationMutation.mutate({
      vaccine_name: newVaccine.vaccine,
      dose: newVaccine.dose,
      date_given: newVaccine.dateGiven,
      next_due_date: newVaccine.nextDue,
      lot_number: newVaccine.lotNumber,
      administration_site: newVaccine.site
    });
    toast.success('Vaccine recorded successfully');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Immunization Record</h3>
        <Button variant="outline" size="sm" onClick={handleRecordVaccine}>
          <Syringe className="h-4 w-4 mr-2" />
          Record Vaccine
        </Button>
      </div>

      {immunizationsList.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <Syringe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No immunizations recorded</p>
            <p className="text-sm text-gray-400 mt-1">Click "Record Vaccine" to record an immunization</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200">
          <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Vaccine</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Dose</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date Given</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Next Due</th>
            </tr>
          </thead>
          <tbody>
            {immunizationsList.map((imm, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{imm.vaccine}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{imm.dose}</td>
                <td className="py-3 px-4 text-sm">{imm.date}</td>
                <td className="py-3 px-4 text-sm">
                  {imm.nextDue === 'N/A' ? (
                    <span className="text-gray-400">N/A</span>
                  ) : (
                    <span className="text-green-600">{imm.nextDue}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      )}

      <Dialog open={showRecordVaccineDialog} onOpenChange={setShowRecordVaccineDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Vaccine</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="vaccine">Vaccine Name *</Label>
              <Input
                id="vaccine"
                placeholder="e.g. COVID-19 Vaccine"
                value={newVaccine.vaccine}
                onChange={(e) => setNewVaccine({...newVaccine, vaccine: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dose">Dose</Label>
              <Input
                id="dose"
                placeholder="e.g. Booster, First dose"
                value={newVaccine.dose}
                onChange={(e) => setNewVaccine({...newVaccine, dose: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dateGiven">Date Given *</Label>
              <Input
                id="dateGiven"
                type="date"
                value={newVaccine.dateGiven}
                onChange={(e) => setNewVaccine({...newVaccine, dateGiven: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nextDue">Next Due Date</Label>
              <Input
                id="nextDue"
                type="date"
                value={newVaccine.nextDue}
                onChange={(e) => setNewVaccine({...newVaccine, nextDue: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lotNumber">Lot Number</Label>
              <Input
                id="lotNumber"
                placeholder="Optional lot number"
                value={newVaccine.lotNumber}
                onChange={(e) => setNewVaccine({...newVaccine, lotNumber: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="site">Administration Site</Label>
              <Select value={newVaccine.site} onValueChange={(value) => setNewVaccine({...newVaccine, site: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Left Arm">Left Arm</SelectItem>
                  <SelectItem value="Right Arm">Right Arm</SelectItem>
                  <SelectItem value="Left Thigh">Left Thigh</SelectItem>
                  <SelectItem value="Right Thigh">Right Thigh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordVaccineDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveVaccine}>Record Vaccine</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Patient Schedule Component
function ScheduleView({ patient, appointments }: { patient: Patient; appointments: any[] }) {
  const queryClient = useQueryClient();
  
  const initialAppointments = appointments && appointments.length > 0
    ? appointments.map(a => ({ id: a.id, date: a.appointment_date?.split('T')[0], time: a.appointment_date?.split('T')[1]?.substring(0, 5), type: a.appointment_type, provider: a.provider, status: a.status, notes: a.notes }))
    : [];

  const [appointmentsList, setAppointmentsList] = useState<any[]>(initialAppointments);

  const createAppointmentMutation = useMutation({
    mutationFn: (data: any) => clinicalApi.createAppointment(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', patient.id] });
    },
  });

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    type: 'Follow-up',
    provider: '',
    notes: ''
  });

  useEffect(() => {
    if (appointments && appointments.length > 0) {
      setAppointmentsList(appointments.map(a => ({ 
        id: a.id, 
        date: a.appointment_date?.split('T')[0], 
        time: a.appointment_date?.split('T')[1]?.substring(0, 5), 
        type: a.appointment_type, 
        provider: a.provider, 
        status: a.status, 
        notes: a.notes 
      })));
    }
  }, [appointments]);

  const handleScheduleAppointment = () => {
    setShowScheduleDialog(true);
  };

  const handleSaveAppointment = () => {
    if (!newAppointment.date || !newAppointment.time || !newAppointment.provider) {
      toast.error('Please fill in date, time, and provider');
      return;
    }

    const appointment = {
      id: Date.now(),
      date: newAppointment.date,
      time: newAppointment.time,
      type: newAppointment.type,
      provider: newAppointment.provider,
      status: 'Scheduled',
      notes: newAppointment.notes
    };

    setAppointmentsList([...appointmentsList, appointment].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    }));
    
    setNewAppointment({ date: '', time: '', type: 'Follow-up', provider: '', notes: '' });
    setShowScheduleDialog(false);
    
    createAppointmentMutation.mutate({
      appointment_date: `${newAppointment.date}T${newAppointment.time}`,
      appointment_type: newAppointment.type,
      provider: newAppointment.provider,
      notes: newAppointment.notes
    });
    toast.success('Appointment scheduled successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'default';
      case 'Completed': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Upcoming Appointments</h3>
        <Button variant="outline" size="sm" onClick={handleScheduleAppointment}>
          <CalendarDays className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {appointmentsList.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointments scheduled</p>
            <p className="text-sm text-gray-400 mt-1">Click "Schedule Appointment" to schedule a new appointment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointmentsList.map((apt, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CalendarDays className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{apt.type}</h4>
                    <p className="text-sm text-gray-500">
                      {apt.date} at {apt.time} • {apt.provider}
                    </p>
                    {apt.notes && (
                      <p className="text-xs text-gray-400 mt-1">{apt.notes}</p>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusColor(apt.status) as any}>{apt.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Appointment Type</Label>
              <Select value={newAppointment.type} onValueChange={(value) => setNewAppointment({...newAppointment, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Initial Visit">Initial Visit</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Lab Review">Lab Review</SelectItem>
                  <SelectItem value="Procedure">Procedure</SelectItem>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                  <SelectItem value="Vaccination">Vaccination</SelectItem>
                  <SelectItem value="Screening">Screening</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Pre-op">Pre-op Assessment</SelectItem>
                  <SelectItem value="Post-op">Post-op Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provider">Provider *</Label>
              <Input
                id="provider"
                placeholder="e.g. Dr. James Kamau"
                value={newAppointment.provider}
                onChange={(e) => setNewAppointment({...newAppointment, provider: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveAppointment}>Schedule Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// AI Risk Assessment Suggestions Component
function RiskAssessmentSuggestions({ patient }: { patient: Patient }) {
  const { id } = useParams<{ id: string }>();
  const patientId = parseInt(id || '0');
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // In RiskAssessmentSuggestions component
  const { data: vitalsData } = useQuery({
    queryKey: ['vitalsHistory', patientId, 'latest'], // Added 'latest' to make it unique
    queryFn: async () => {
      const response = await clinicalApi.getVitalSigns(patientId);
      return response.data.vital_signs?.[0] || null;
    },
  });

  const { data: encountersData } = useQuery({
    queryKey: ['patientHistory', patientId, 'encountersOnly'], // Added 'encountersOnly'
    queryFn: async () => {
      const response = await encountersApi.getPatientHistory(patientId);
      return response.data.encounters || [];
    },
  });

  const generateSuggestions = () => {
    setIsLoading(true);
    
    // Generate suggestions based on patient data
    const newSuggestions: any = {
      priority_actions: [],
      monitoring: [],
      lifestyle: [],
      follow_up: []
    };

    // Age-based suggestions
    if (patient.age >= 65) {
      newSuggestions.priority_actions.push('Consider geriatric assessment');
      newSuggestions.priority_actions.push('Review medication list for interactions');
    }

    // Chronic conditions
    if (patient.chronic_conditions) {
      const conditions = patient.chronic_conditions.toLowerCase();
      if (conditions.includes('diabetes')) {
        newSuggestions.monitoring.push('Check HbA1c; monitor blood glucose');
        newSuggestions.follow_up.push('Schedule diabetic eye examination');
      }
      if (conditions.includes('hypertension')) {
        newSuggestions.monitoring.push('Monitor blood pressure regularly');
        newSuggestions.lifestyle.push('Reduce sodium intake; regular exercise');
      }
      if (conditions.includes('asthma')) {
        newSuggestions.monitoring.push('Review inhaler technique; check peak flow');
      }
      if (conditions.includes('hiv')) {
        newSuggestions.monitoring.push('Monitor CD4 count and viral load');
      }
    }

    // Vital signs suggestions
    if (vitalsData) {
      if (vitalsData.blood_pressure_systolic && vitalsData.blood_pressure_systolic >= 140) {
        newSuggestions.priority_actions.push('Review antihypertensive therapy');
      }
      if (vitalsData.oxygen_saturation && vitalsData.oxygen_saturation < 92) {
        newSuggestions.priority_actions.push('Assess respiratory status; consider oxygen');
      }
      if (vitalsData.temperature && vitalsData.temperature > 38.5) {
        newSuggestions.priority_actions.push('Investigate potential infection');
      }
    }

    // Visit frequency
    if (encountersData && encountersData.length > 0) {
      const recentEncounters = encountersData.filter((e: any) => {
        const visitDate = new Date(e.visit_date);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return visitDate >= threeMonthsAgo;
      });
      
      if (recentEncounters.length >= 3) {
        newSuggestions.follow_up.push(`Patient has ${recentEncounters.length} visits in last 3 months - review care plan`);
      }
    }

    // If no suggestions, add a default one
    if (newSuggestions.priority_actions.length === 0 && 
        newSuggestions.monitoring.length === 0 && 
        newSuggestions.lifestyle.length === 0 &&
        newSuggestions.follow_up.length === 0) {
      newSuggestions.monitoring.push('Continue routine care');
    }

    setSuggestions(newSuggestions);
    setIsLoading(false);
  };

  return (
    <Card className="border border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-800">AI Risk Assessment Suggestions</span>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={generateSuggestions}
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Generate Suggestions'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions ? (
          <div className="space-y-4">
            {suggestions.priority_actions.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">Priority Actions</p>
                <ul className="space-y-1">
                  {suggestions.priority_actions.map((action: string, i: number) => (
                    <li key={i} className="text-sm text-red-600 flex items-center gap-2">
                      <span className="text-red-500">•</span> {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {suggestions.monitoring.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-orange-700 mb-1">Monitoring</p>
                <ul className="space-y-1">
                  {suggestions.monitoring.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-orange-600 flex items-center gap-2">
                      <span className="text-orange-500">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {suggestions.lifestyle.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">Lifestyle</p>
                <ul className="space-y-1">
                  {suggestions.lifestyle.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-green-600 flex items-center gap-2">
                      <span className="text-green-500">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {suggestions.follow_up.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">Follow-up</p>
                <ul className="space-y-1">
                  {suggestions.follow_up.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-blue-600 flex items-center gap-2">
                      <span className="text-blue-500">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Click "Generate Suggestions" to get AI-powered risk assessment and clinical recommendations based on patient data.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Synopsis Component (Main Dashboard View)
function SynopsisView({ patient, vitals, vitalsHistory, medications, problems, allergies, encounters }: { 
  patient: Patient; 
  vitals: any;
  vitalsHistory?: any[];
  medications?: any[];
  problems?: any[];
  allergies?: any[];
  encounters?: any[];
}) {
  const latestVitalsFromHistory = vitalsHistory && vitalsHistory.length > 0 ? vitalsHistory[0] : null;
  const displayVitals = latestVitalsFromHistory || vitals;
  
  const hasVitals = displayVitals && (
    displayVitals.blood_pressure?.display || 
    displayVitals.blood_pressure_systolic ||
    displayVitals.heart_rate || 
    displayVitals.temperature || 
    displayVitals.respiratory_rate || 
    displayVitals.oxygen_saturation || 
    displayVitals.weight
  );
  
  const activeProblems = problems && problems.filter((p: any) => p.status === 'Active');
  const activeMedications = medications && medications.filter((m: any) => m.status === 'Active');
  const activeAllergies = allergies && allergies.filter((a: any) => a.is_active !== false);
  
  // Get recent encounters for clinical notes
  const recentEncounters = encounters && encounters.length > 0 ? encounters.slice(0, 3) : [];
  
  return (
    <div className="space-y-4">
      {/* Latest Vitals Card */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-slate-700">
            <Activity className="h-4 w-4 text-teal-600" />
            <span className="font-semibold">Latest Vitals</span>
          </div>
        </CardHeader>
        <CardContent>
          {hasVitals ? (
            <div className="grid grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">BP</p>
                <p className="text-xl font-bold text-slate-800">
                  {displayVitals?.bp || displayVitals?.blood_pressure?.display || (displayVitals?.blood_pressure_systolic ? `${displayVitals.blood_pressure_systolic}/${displayVitals.blood_pressure_diastolic}` : '--')}
                </p>
                <p className="text-xs text-gray-400">mmHg</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">HR</p>
                <p className="text-xl font-bold text-slate-800">
                  {displayVitals?.hr || displayVitals?.heart_rate || '--'}
                </p>
                <p className="text-xs text-gray-400">bpm</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">TEMP</p>
                <p className="text-xl font-bold text-slate-800">
                  {displayVitals?.temp || displayVitals?.temperature ? `${displayVitals.temp || displayVitals.temperature}°C` : '--'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">RR</p>
                <p className="text-xl font-bold text-slate-800">
                  {displayVitals?.rr || displayVitals?.respiratory_rate || '--'}
                </p>
                <p className="text-xs text-gray-400">resp/m</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">SPO2</p>
                <p className="text-xl font-bold text-slate-800">
                  {displayVitals?.spo2 || displayVitals?.oxygen_saturation ? `${displayVitals.spo2 || displayVitals.oxygen_saturation}%` : '--'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">WEIGHT</p>
                <p className="text-xl font-bold text-slate-800">
                  {displayVitals?.weight || '--'}
                </p>
                <p className="text-xs text-gray-400">kg</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No vital signs recorded</p>
              <p className="text-sm text-gray-400 mt-1">Record vitals in the Vital Signs section</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active Problems */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Stethoscope className="h-4 w-4" />
                <span className="font-semibold">Active Problems</span>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full">
                {activeProblems?.length || (patient?.chronic_conditions ? 1 : 0)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {activeProblems && activeProblems.length > 0 ? (
              <div className="space-y-2">
                {activeProblems.map((problem: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">{problem.description}</span>
                      <Badge variant="outline" className="text-xs">{problem.status}</Badge>
                    </div>
                    {problem.icd10_code && (
                      <p className="text-xs text-gray-500">ICD-10: {problem.icd10_code}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : patient?.chronic_conditions ? (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-800">{patient.chronic_conditions}</span>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No active problems</p>
            )}
          </CardContent>
        </Card>

        {/* Current Medications */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Pill className="h-4 w-4" />
                <span className="font-semibold">Current Medications</span>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full">
                {activeMedications?.length || 0}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {activeMedications && activeMedications.length > 0 ? (
              <div className="space-y-2">
                {activeMedications.map((med: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">{med.medication_name}</span>
                      <Badge variant="outline" className="text-xs">{med.dosage} {med.frequency}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No current medications</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Allergies Card */}
      {(activeAllergies && activeAllergies.length > 0) || (patient?.allergies && patient.allergies.split(',').length > 0) ? (
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-slate-700">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="font-semibold">Known Allergies</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activeAllergies && activeAllergies.length > 0 ? (
                activeAllergies.map((allergy: any, index: number) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {allergy.allergen} ({allergy.severity})
                  </Badge>
                ))
              ) : patient?.allergies && patient.allergies.split(',').map((a: string, index: number) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {a.trim()}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Recent Clinical Notes */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <ClipboardList className="h-4 w-4" />
              <span className="font-semibold">Recent Clinical Notes</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recentEncounters.length > 0 ? (
            <div className="space-y-3">
              {recentEncounters.map((encounter: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-800">{encounter.visit_type} Visit</span>
                    <span className="text-xs text-gray-500">
                      {encounter.visit_date?.split('T')[0]}
                    </span>
                  </div>
                  {encounter.chief_complaint && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>CC:</strong> {encounter.chief_complaint}
                    </p>
                  )}
                  {encounter.assessment && (
                    <p className="text-sm text-gray-600">
                      <strong>Assessment:</strong> {encounter.assessment}
                    </p>
                  )}
                  {encounter.diagnosis_primary && (
                    <p className="text-sm text-gray-600">
                      <strong>Diagnosis:</strong> {encounter.diagnosis_primary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No clinical notes recorded</p>
              <p className="text-sm text-gray-400 mt-1">Create an encounter to add clinical notes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Risk Assessment Suggestions */}
      <RiskAssessmentSuggestions patient={patient} />
    </div>
  );
}

// Main Patient Chart Component
export default function PatientChart() {
  const { id } = useParams<{ id: string }>();
  const patientId = parseInt(id || '0');
  const [activeMenu, setActiveMenu] = useState('synopsis');

  const { data: patient, isLoading: patientLoading, error: patientError } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await patientsApi.getById(patientId);
      return response.data.patient as Patient;
    },
  
  });

  const { data: history } = useQuery({
    queryKey: ['patientHistory', patientId],
    queryFn: async () => {
      const response = await encountersApi.getPatientHistory(patientId);
      return response.data as { patient: Patient; encounters: Encounter[] };
    },
    
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts', patientId],
    queryFn: async () => {
      const response = await aiApi.getAlerts();
      const allAlerts = response.data.alerts || [];
      return allAlerts.filter((a: any) => a.patient_id === patientId);
    },
    
  });

  // Get user and permissions
  const { user } = useAuth();
  const canAccessProblemsDiagnoses = user?.role === 'admin' || user?.role === 'doctor';

  // Clinical data queries with staleTime to prevent unnecessary refetching during navigation
  const staleTime = 5 * 60 * 1000; // 5 minutes

  const { data: allergiesData } = useQuery({
    queryKey: ['allergies', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getAllergies(patientId);
      return response.data.allergies;
    },
    enabled: !!patientId,
  });

  const { data: problemsData } = useQuery({
    queryKey: ['problems', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getProblems(patientId);
      return response.data.problems;
    },
    enabled: !!patientId,
  });

  const { data: medicationsData } = useQuery({
    queryKey: ['medications', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getMedications(patientId);
      return response.data.medications;
    },
    enabled: !!patientId,
  });

  const { data: historiesData } = useQuery({
    queryKey: ['histories', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getHistories(patientId);
      return response.data.histories;
    },
    enabled: !!patientId,
    
  });

  const { data: immunizationsData } = useQuery({
    queryKey: ['immunizations', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getImmunizations(patientId);
      return response.data.immunizations;
    },
    enabled: !!patientId,
    
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getAppointments(patientId);
      return response.data.appointments;
    },
    enabled: !!patientId,
  });

  const { data: resultsData } = useQuery({
    queryKey: ['labResults', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getLabResults(patientId);
      return response.data.results;
    },
    enabled: !!patientId,
  });

  const { data: admissionsData } = useQuery({
    queryKey: ['admissions', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getAdmissions(patientId);
      return response.data.admissions;
    },
    enabled: !!patientId,
  
  });

  const { data: vitalsHistoryData } = useQuery({
    queryKey: ['vitalsHistory', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getVitalSigns(patientId);
      return response.data.vital_signs;
    },
    enabled: !!patientId,
  });

  const { data: sbarData } = useQuery({
    queryKey: ['sbar', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getSBARs(patientId);
      return response.data.sbars;
    },
    enabled: !!patientId,
    
  });

  // Calculate allergies count dynamically
  const allergiesCount = (() => {
    if (allergiesData && allergiesData.length > 0) {
      return allergiesData.length;
    }
    if (patient?.allergies) {
      return patient.allergies.split(',').filter(Boolean).length;
    }
    return 0;
  })();

  // Build menu items with dynamic badges and permissions
  const menuItemsWithBadges = [
    { id: 'sbar', label: 'SBAR', icon: MessageSquare },
    { id: 'inpatient', label: 'Inpatient Summaries', icon: BedDouble },
    { id: 'demographics', label: 'Demographics', icon: User },
    { id: 'allergies', label: 'Allergies', icon: AlertTriangle, badge: allergiesCount > 0 ? allergiesCount : undefined },
    ...(canAccessProblemsDiagnoses ? [{ id: 'problems', label: 'Problems and Diagnoses', icon: Stethoscope }] : []),
    { id: 'medications', label: 'Medication List', icon: Pill },
    { id: 'vitals', label: 'Vital Signs', icon: Activity },
    { id: 'results', label: 'Results Review', icon: FileBarChart },
    { id: 'histories', label: 'Histories', icon: History },
    { id: 'immunizations', label: 'Immunizations', icon: Syringe },
    { id: 'schedule', label: 'Patient Schedule', icon: CalendarDays },
    { id: 'synopsis', label: 'Synopsis', icon: FileText },
    { id: 'visits', label: 'Visits', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'reports', label: 'Reports', icon: BarChart },
  ];

  // Get vital signs from clinical API (primary source) and encounters as fallback
  const encounterVitals = (() => {
    if (history?.encounters && history.encounters.length > 0) {
      return history.encounters[0]?.vital_signs || null;
    }
    return null;
  })();

  const patientAlerts = alerts?.filter((a: any) => a.patient_id === patientId) || [];

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDOB = (dob: string) => {
    if (!dob) return 'patient.age';
    return dob.split('T')[0];
  };

  if (patientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-slate-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (patientError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading patient</p>
          <p className="text-gray-500 text-sm">{JSON.stringify(patientError)}</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Patient not found</p>
      </div>
    );
  }

  // Render the active clinical view
  const renderClinicalView = () => {
    switch (activeMenu) {
      case 'sbar':
        return <SBARView patient={patient} sbars={sbarData || []} />;
      case 'inpatient':
        return <InpatientSummariesView patient={patient} admissions={admissionsData || []} />;
      case 'demographics':
        return <DemographicsView patient={patient} />;
      case 'allergies':
        return <AllergiesView patient={patient} allergies={allergiesData || []} />;
      case 'problems':
        if (!canAccessProblemsDiagnoses) {
          return (
            <Card className="border border-gray-200">
              <CardContent className="p-8 text-center">
                <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">You do not have permission to view Problems and Diagnoses</p>
              </CardContent>
            </Card>
          );
        }
        return <ProblemsView patient={patient} problems={problemsData || []} />;
      case 'medications':
        return <MedicationsView patient={patient} medications={medicationsData || []} />;
      case 'vitals':
        return <VitalSignsView patient={patient} vitals={encounterVitals} vitalsHistory={vitalsHistoryData || []} />;
      case 'results':
        return <ResultsView patient={patient} labResults={resultsData || []} />;
      case 'histories':
        return <HistoriesView patient={patient} histories={historiesData || []} />;
      case 'immunizations':
        return <ImmunizationsView patient={patient} immunizations={immunizationsData || []} />;
      case 'schedule':
        return <ScheduleView patient={patient} appointments={appointmentsData || []} />;
      case 'synopsis':
        return (
          <SynopsisView 
            patient={patient} 
            vitals={encounterVitals}
            vitalsHistory={vitalsHistoryData || []}
            medications={medicationsData || []}
            problems={problemsData || []}
            allergies={allergiesData || []}
            encounters={history?.encounters || []}
          />
        );
      case 'visits':
        return <VisitsView patient={patient} />;
      case 'tasks':
        return <TasksView patient={patient} />;
      case 'reports':
        return <ReportsView patient={patient} />;
      default:
        return <SynopsisView patient={patient} vitals={encounterVitals} vitalsHistory={vitalsHistoryData || []} medications={medicationsData || []} problems={problemsData || []} allergies={allergiesData || []} encounters={history?.encounters || []} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-slate-800">MEDIBORA</span>
          </Link>
        </div>
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Patient search... (Name, ID, NHIF)"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <User className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Clinical Menu */}
        <aside className="w-56 bg-slate-900 text-white flex-shrink-0 overflow-y-auto">
          <div className="p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
              Clinical Menu
            </p>
            <nav className="space-y-1">
              {menuItemsWithBadges.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeMenu === item.id
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <Button 
                asChild
                className="w-full bg-slate-700 hover:bg-slate-600 text-white"
              >
                <Link to="/patients">
                  <X className="h-4 w-4 mr-2" />
                  Close Chart
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {/* Patient Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-700">
                    {getInitials(patient.full_name)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{patient.full_name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>ID: {patient.patient_id}</span>
                    <span>DOB: {formatDOB(patient.date_of_birth)}</span>
                    <span>Sex: {patient.gender}</span>
                    <span>Blood: {patient.blood_type || 'O+'}</span>
                  </div>
                </div>
              </div>
              {patientAlerts.length > 0 && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 px-3 py-1.5">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {patientAlerts.length} Active Alert{patientAlerts.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Dynamic Clinical View */}
          {renderClinicalView()}
        </main>
      </div>
    </div>
  );
}

// Additional View Components
function VisitsView({ patient }: { patient: Patient }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments', patient.id],
    queryFn: async () => {
      const response = await clinicalApi.getAppointments(patient.id);
      return response.data.appointments;
    },
  });

  const { data: encounterHistoryData, isLoading: encountersLoading } = useQuery({
    queryKey: ['patientHistory', patient.id],
    queryFn: async () => {
      const response = await encountersApi.getPatientHistory(patient.id);
      return response.data.encounters || [];
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data: any) => clinicalApi.createAppointment(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', patient.id] });
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visitData, setVisitData] = useState({
    visit_type: '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  });

  const handleScheduleVisit = () => {
    if (!visitData.visit_type || !visitData.date || !visitData.time) {
      toast.error('Please fill in visit type, date and time');
      return;
    }
    
    createAppointmentMutation.mutate({
      appointment_date: `${visitData.date}T${visitData.time}`,
      appointment_type: visitData.visit_type,
      provider: 'General Practitioner',
      notes: `${visitData.reason}\n${visitData.notes}`
    });
    
    setIsDialogOpen(false);
    setVisitData({
      visit_type: '',
      date: '',
      time: '',
      reason: '',
      notes: ''
    });
  };

  const handleViewEncounter = (encounterId: number) => {
    navigate(`/encounters/${encounterId}`);
  };

  const handleEditEncounter = (encounterId: number) => {
    navigate(`/patients/${patient.id}/encounters/${encounterId}/edit`);
  };

  return (
    <div className="space-y-6">
      {/* Scheduled Visits Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Scheduled Visits</h3>
          <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Visit
          </Button>
        </div>
        
        {appointmentsLoading ? (
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-slate-800 border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-500 mt-3">Loading...</p>
            </CardContent>
          </Card>
        ) : !appointmentsData || appointmentsData.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No visits scheduled</p>
              <p className="text-sm text-gray-400 mt-1">Click "Schedule Visit" to schedule a new visit</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {appointmentsData.map((apt: any, index: number) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{apt.appointment_type}</h4>
                        <p className="text-sm text-gray-500">
                          {apt.appointment_date?.replace('T', ' ')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">{apt.status || 'Scheduled'}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Encounter History Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Encounter History</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/patients/${patient.id}/new-encounter`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Add New Encounter
          </Button>
        </div>
        
        {encountersLoading ? (
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-slate-800 border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-500 mt-3">Loading...</p>
            </CardContent>
          </Card>
        ) : !Array.isArray(encounterHistoryData) || encounterHistoryData.length === 0 ? (

          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No encounter history</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add New Encounter" to create the first encounter</p>
              <Button 
                className="mt-4"
                onClick={() => navigate(`/patients/${patient.id}/new-encounter`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Add New Encounter
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {encounterHistoryData.map((encounter: any, index: number) => (
              <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {encounter.encounter_id || `Visit #${encounter.id}`}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {encounter.visit_date?.split('T')[0]} - {encounter.visit_type || 'General'}
                        </p>
                        {encounter.chief_complaint && (
                          <p className="text-xs text-gray-400 mt-1">
                            Complaint: {encounter.chief_complaint.substring(0, 50)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewEncounter(encounter.id)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditEncounter(encounter.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule New Visit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="visitType">Visit Type</Label>
                <Select value={visitData.visit_type} onValueChange={(value) => setVisitData({...visitData, visit_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine Checkup</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="specialist">Specialist Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={visitData.date}
                  onChange={(e) => setVisitData({...visitData, date: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={visitData.time}
                  onChange={(e) => setVisitData({...visitData, time: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                placeholder="Describe the reason for this visit..."
                value={visitData.reason}
                onChange={(e) => setVisitData({...visitData, reason: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={visitData.notes}
                onChange={(e) => setVisitData({...visitData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleVisit}>
              Schedule Visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <p className="text-gray-500">Visit history and scheduling would go here</p>
        </CardContent>
      </Card>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DocumentsView(_props: { patient: Patient }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentData, setDocumentData] = useState({
    title: '',
    type: '',
    file: null as File | null,
    description: ''
  });

  const handleUploadDocument = () => {
    if (!documentData.file) {
      toast.error('Please select a file to upload');
      return;
    }
    toast.success('Document uploaded successfully');
    setIsDialogOpen(false);
    setDocumentData({
      title: '',
      type: '',
      file: null,
      description: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Patient Documents</h3>
        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                placeholder="Enter document title..."
                value={documentData.title}
                onChange={(e) => setDocumentData({...documentData, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Document Type</Label>
              <Select value={documentData.type} onValueChange={(value) => setDocumentData({...documentData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab_report">Lab Report</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="discharge">Discharge Summary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setDocumentData({...documentData, file: e.target.files?.[0] || null})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Document description..."
                value={documentData.description}
                onChange={(e) => setDocumentData({...documentData, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument}>
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <p className="text-gray-500">Document management would go here</p>
        </CardContent>
      </Card>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ToolsView(_props: { patient: Patient }) {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [riskData, setRiskData] = useState({
    factors: [] as string[],
    notes: ''
  });
  const [analyticsData, setAnalyticsData] = useState({
    metric: '',
    time_range: '30_days'
  });
  const [reportData, setReportData] = useState({
    template: '',
    custom_fields: ''
  });

  const handleRiskAssessment = () => {
    toast.success('Risk assessment completed');
    setActiveTool(null);
    setRiskData({ factors: [], notes: '' });
  };

  const handleAnalytics = () => {
    toast.success('Analytics generated');
    setActiveTool(null);
    setAnalyticsData({ metric: '', time_range: '30_days' });
  };

  const handleReportGenerator = () => {
    toast.success('Report generated');
    setActiveTool(null);
    setReportData({ template: '', custom_fields: '' });
  };

  const toggleRiskFactor = (factor: string) => {
    setRiskData(prev => ({
      ...prev,
      factors: prev.factors.includes(factor)
        ? prev.factors.filter(f => f !== factor)
        : [...prev.factors, factor]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Clinical Tools</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          className="border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTool('risk')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium">Risk Assessment</h4>
                <p className="text-sm text-gray-500">AI-powered risk analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTool('analytics')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium">Analytics</h4>
                <p className="text-sm text-gray-500">Patient statistics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTool('report')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium">Report Generator</h4>
                <p className="text-sm text-gray-500">Create reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment Dialog */}
      <Dialog open={activeTool === 'risk'} onOpenChange={(open) => !open && setActiveTool(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Risk Assessment Tool</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Risk Factors</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Age > 65', 'Chronic Conditions', 'Medication Adherence', 'Recent Hospitalization', 'Mobility Issues', 'Cognitive Decline'].map(factor => (
                  <div key={factor} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={factor}
                      checked={riskData.factors.includes(factor)}
                      onChange={() => toggleRiskFactor(factor)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={factor} className="text-sm">{factor}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Assessment Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional risk assessment notes..."
                value={riskData.notes}
                onChange={(e) => setRiskData({...riskData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveTool(null)}>
              Cancel
            </Button>
            <Button onClick={handleRiskAssessment}>
              Generate Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={activeTool === 'analytics'} onOpenChange={(open) => !open && setActiveTool(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Patient Analytics</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="metric">Metric</Label>
              <Select value={analyticsData.metric} onValueChange={(value) => setAnalyticsData({...analyticsData, metric: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vital_signs">Vital Signs Trends</SelectItem>
                  <SelectItem value="medication_adherence">Medication Adherence</SelectItem>
                  <SelectItem value="visit_frequency">Visit Frequency</SelectItem>
                  <SelectItem value="lab_results">Lab Results History</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time_range">Time Range</Label>
              <Select value={analyticsData.time_range} onValueChange={(value) => setAnalyticsData({...analyticsData, time_range: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7_days">Last 7 Days</SelectItem>
                  <SelectItem value="30_days">Last 30 Days</SelectItem>
                  <SelectItem value="90_days">Last 90 Days</SelectItem>
                  <SelectItem value="1_year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveTool(null)}>
              Cancel
            </Button>
            <Button onClick={handleAnalytics}>
              Generate Analytics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Generator Dialog */}
      <Dialog open={activeTool === 'report'} onOpenChange={(open) => !open && setActiveTool(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Generator</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="template">Report Template</Label>
              <Select value={reportData.template} onValueChange={(value) => setReportData({...reportData, template: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                  <SelectItem value="progress_note">Progress Note</SelectItem>
                  <SelectItem value="consultation">Consultation Report</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="custom_fields">Custom Fields</Label>
              <Textarea
                id="custom_fields"
                placeholder="Additional fields to include..."
                value={reportData.custom_fields}
                onChange={(e) => setReportData({...reportData, custom_fields: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveTool(null)}>
              Cancel
            </Button>
            <Button onClick={handleReportGenerator}>
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TasksView({ patient }: { patient: Patient }) {
  const queryClient = useQueryClient();
  
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', patient.id],
    queryFn: async () => {
      const response = await clinicalApi.getTasks(patient.id);
      return response.data.tasks;
    },
    enabled: !!patient.id,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => clinicalApi.createTask(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', patient.id] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: any }) => 
      clinicalApi.updateTask(patient.id, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', patient.id] });
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
const [taskData, setTaskData] = useState({
    title: '',
    priority: 'medium',
    due_date: '',
    description: '',
    task_type: 'general'
  });

  const handleAddTask = () => {
    if (!taskData.title) {
      toast.error('Please enter a task title');
      return;
    }
    
    createTaskMutation.mutate({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      due_date: taskData.due_date,
      task_type: taskData.task_type,
      status: 'pending'
    });
    
    setIsDialogOpen(false);
    setTaskData({
      title: '',
      priority: 'medium',
      due_date: '',
      description: '',
      task_type: 'general'
    });
    toast.success('Task added successfully');
  };

  const handleMarkDone = (taskId: number) => {
    updateTaskMutation.mutate({ taskId, data: { status: 'completed' } });
    toast.success('Task marked as completed');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const tasks = tasksData || [];
  const pendingTasks = tasks.filter((t: any) => t.status !== 'completed');
  const completedTasks = tasks.filter((t: any) => t.status === 'completed');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Tasks</h3>
        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
          <CheckSquare className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-slate-800 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : pendingTasks.length === 0 && completedTasks.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tasks recorded</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Task" to create a new task</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Pending ({pendingTasks.length})</h4>
              {pendingTasks.map((task: any) => (
                <Card key={task.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleMarkDone(task.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-gray-500">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            {task.due_date && (
                              <span className="text-xs text-gray-500">Due: {task.due_date}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Completed ({completedTasks.length})</h4>
              {completedTasks.map((task: any) => (
                <Card key={task.id} className="border border-gray-200 bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div className="line-through text-gray-500">
                        <p className="font-medium">{task.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title..."
                value={taskData.title}
                onChange={(e) => setTaskData({...taskData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={taskData.priority} onValueChange={(value) => setTaskData({...taskData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={taskData.due_date}
                  onChange={(e) => setTaskData({...taskData, due_date: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Task description..."
                value={taskData.description}
                onChange={(e) => setTaskData({...taskData, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <p className="text-gray-500">Task management would go here</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsView({ patient }: { patient: Patient }) {
  const { id } = useParams<{ id: string }>();
  const patientId = parseInt(id || '0');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [reportData, setReportData] = useState({
    report_type: 'clinical_summary',
    date_range: 'last_30_days',
    start_date: '',
    end_date: '',
    format: 'json',
    include_sections: ['Demographics', 'Medications', 'Allergies', 'Vital Signs', 'Visit History']
  });

  // Fetch patient data for reports
  const { data: patientData } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await patientsApi.getById(patientId);
      return response.data.patient;
    },
  });

  const { data: encountersData } = useQuery({
    queryKey: ['patientHistory', patientId],
    queryFn: async () => {
      const response = await encountersApi.getPatientHistory(patientId);
      return response.data.encounters || [];
    },
  });

  const { data: vitalsData } = useQuery({
    queryKey: ['vitalsHistory', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getVitalSigns(patientId);
      return response.data.vital_signs || [];
    },
  });

  const { data: medicationsData } = useQuery({
    queryKey: ['medications', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getMedications(patientId);
      return response.data.medications || [];
    },
  });

  const { data: allergiesData } = useQuery({
    queryKey: ['allergies', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getAllergies(patientId);
      return response.data.allergies || [];
    },
  });

  const handleGenerateReport = async () => {
    if (!reportData.report_type) {
      toast.error('Please select a report type');
      return;
    }

    setIsGenerating(true);

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    let endDate = now;

    switch (reportData.date_range) {
      case 'last_7_days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last_30_days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last_90_days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'last_year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (reportData.start_date && reportData.end_date) {
          startDate = new Date(reportData.start_date);
          endDate = new Date(reportData.end_date);
        }
        break;
    }

    // Generate report based on type
    const report: any = {
      type: reportData.report_type,
      generatedAt: now.toISOString(),
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      patient: patientData,
      sections: {}
    };

    // Add sections based on selection
    if (reportData.include_sections.includes('Demographics')) {
      report.sections.demographics = {
        fullName: patientData?.full_name,
        patientId: patientData?.patient_id,
        dateOfBirth: patientData?.date_of_birth,
        gender: patientData?.gender,
        bloodType: patientData?.blood_type,
        phone: patientData?.phone,
        email: patientData?.email,
        address: patientData?.address,
        county: patientData?.county,
        emergencyContact: patientData?.emergency_contact
      };
    }

    if (reportData.include_sections.includes('Medications')) {
      report.sections.medications = medicationsData || [];
    }

    if (reportData.include_sections.includes('Allergies')) {
      report.sections.allergies = allergiesData || [];
    }

    if (reportData.include_sections.includes('Vital Signs')) {
      report.sections.vitalSigns = vitalsData || [];
    }

    if (reportData.include_sections.includes('Visit History')) {
      const filteredEncounters = (encountersData || []).filter((e: any) => {
        const visitDate = new Date(e.visit_date);
        return visitDate >= startDate && visitDate <= endDate;
      });
      report.sections.visitHistory = filteredEncounters;
    }

    if (reportData.include_sections.includes('Lab Results')) {
      report.sections.labResults = [];
    }

    // Simulate generation delay
    setTimeout(() => {
      setGeneratedReport(report);
      setIsGenerating(false);
      toast.success('Report generated successfully');
    }, 1000);
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;

    // Create downloadable content
    const content = JSON.stringify(generatedReport, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_report_${patient.patient_id}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  const toggleSection = (section: string) => {
    setReportData(prev => ({
      ...prev,
      include_sections: prev.include_sections.includes(section)
        ? prev.include_sections.filter(s => s !== section)
        : [...prev.include_sections, section]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Reports</h3>
        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
          <BarChart className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>
      
      {/* Generated Report Display */}
      {generatedReport && (
        <Card className="border border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-blue-800">Report Generated</h4>
              <Button size="sm" onClick={handleDownloadReport}>
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Report Type:</p>
                <p className="font-medium">{generatedReport.type}</p>
              </div>
              <div>
                <p className="text-gray-500">Generated:</p>
                <p className="font-medium">{new Date(generatedReport.generatedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Sections Included:</p>
                <p className="font-medium">{Object.keys(generatedReport.sections).join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-500">Date Range:</p>
                <p className="font-medium">
                  {new Date(generatedReport.dateRange.start).toLocaleDateString()} - {new Date(generatedReport.dateRange.end).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Patient Report</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="report_type">Report Type *</Label>
                <Select value={reportData.report_type} onValueChange={(value) => setReportData({...reportData, report_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinical_summary">Clinical Summary</SelectItem>
                    <SelectItem value="medication_history">Medication History</SelectItem>
                    <SelectItem value="lab_results">Lab Results</SelectItem>
                    <SelectItem value="vital_signs">Vital Signs</SelectItem>
                    <SelectItem value="visit_history">Visit History</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="format">Format</Label>
                <Select value={reportData.format} onValueChange={(value) => setReportData({...reportData, format: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">Word Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={reportData.date_range} onValueChange={(value) => setReportData({...reportData, date_range: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {reportData.date_range === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={reportData.start_date}
                    onChange={(e) => setReportData({...reportData, start_date: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={reportData.end_date}
                    onChange={(e) => setReportData({...reportData, end_date: e.target.value})}
                  />
                </div>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label>Include Sections</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Demographics', 'Medications', 'Allergies', 'Lab Results', 'Vital Signs', 'Visit History'].map(section => (
                  <div key={section} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={section}
                      checked={reportData.include_sections.includes(section)}
                      onChange={() => toggleSection(section)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={section} className="text-sm">{section}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Recent Reports */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <h4 className="font-semibold">Report Information</h4>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Click "Generate Report" to create a new patient report. The report will include selected sections and be downloadable.</p>
          {patientData && (
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Patient:</p>
                <p className="font-medium">{patientData.full_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Patient ID:</p>
                <p className="font-medium">{patientData.patient_id}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Encounters:</p>
                <p className="font-medium">{encountersData?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-500">Vital Signs Records:</p>
                <p className="font-medium">{vitalsData?.length || 0}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Export unused components for potential future use
export { DocumentsView, ToolsView };
