import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientsApi, encountersApi, aiApi } from '@/services/api';
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

// Clinical Menu Items - Complete list from document
const clinicalMenuItems = [
  { id: 'sbar', label: 'SBAR', icon: MessageSquare },
  { id: 'inpatient', label: 'Inpatient Summaries', icon: BedDouble },
  { id: 'demographics', label: 'Demographics', icon: User },
  { id: 'allergies', label: 'Allergies', icon: AlertTriangle, badge: 1 },
  { id: 'problems', label: 'Problems and Diagnoses', icon: Stethoscope },
  { id: 'medications', label: 'Medication List', icon: Pill },
  { id: 'vitals', label: 'Vital Signs', icon: Activity },
  { id: 'results', label: 'Results Review', icon: FileBarChart },
  { id: 'histories', label: 'Histories', icon: History },
  { id: 'immunizations', label: 'Immunizations', icon: Syringe },
  { id: 'schedule', label: 'Patient Schedule', icon: CalendarDays },
  { id: 'synopsis', label: 'Synopsis', icon: FileText },
  { id: 'visits', label: 'Visits', icon: Calendar },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { id: 'tools', label: 'Tools', icon: Settings },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'reports', label: 'Reports', icon: BarChart },
];

// SBAR Component
function SBARView({ patient }: { patient: Patient }) {
  const [sbarData, setSbarData] = useState({
    situation: '',
    background: '',
    assessment: '',
    recommendation: ''
  });

  const handleSaveDraft = () => {
    // Save to localStorage for persistence
    const draftData = {
      patientId: patient.id,
      ...sbarData,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`sbar_draft_${patient.id}`, JSON.stringify(draftData));
    toast.success('SBAR saved as draft');
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!sbarData.situation || !sbarData.background || !sbarData.assessment || !sbarData.recommendation) {
      toast.error('Please fill in all SBAR sections');
      return;
    }
    
    // Here you would normally send to API
    const sbarSubmission = {
      patientId: patient.id,
      ...sbarData,
      submittedAt: new Date().toISOString()
    };
    console.log('SBAR submitted:', sbarSubmission);
    toast.success('SBAR submitted successfully');
    
    // Clear form after successful submission
    setSbarData({
      situation: '',
      background: '',
      assessment: '',
      recommendation: ''
    });
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
function InpatientSummariesView({ patient }: { patient: Patient }) {
  const [admissions, setAdmissions] = useState([
    {
      id: 'ADM25001',
      admissionDate: '2025-03-10',
      dischargeDate: '2025-03-15',
      department: 'General Medicine',
      diagnosis: 'Community Acquired Pneumonia',
      status: 'Discharged'
    }
  ]);
  const [showNewAdmissionDialog, setShowNewAdmissionDialog] = useState(false);
  const [newAdmission, setNewAdmission] = useState({
    department: '',
    diagnosis: '',
    admissionType: 'Emergency',
    room: ''
  });

  const handleNewAdmission = () => {
    setShowNewAdmissionDialog(true);
  };

  const handleSaveAdmission = () => {
    if (!newAdmission.department || !newAdmission.diagnosis) {
      toast.error('Please fill in all required fields');
      return;
    }

    const admission = {
      id: `ADM${Date.now()}`,
      admissionDate: new Date().toISOString().split('T')[0],
      dischargeDate: null,
      department: newAdmission.department,
      diagnosis: newAdmission.diagnosis,
      status: 'Active',
      room: newAdmission.room,
      type: newAdmission.admissionType
    };

    setAdmissions([admission, ...admissions]);
    setNewAdmission({ department: '', diagnosis: '', admissionType: 'Emergency', room: '' });
    setShowNewAdmissionDialog(false);
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
      
      {admissions.map((admission) => (
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
      ))}

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
function AllergiesView({ patient }: { patient: Patient }) {
  const [allergies, setAllergies] = useState([
    { name: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis' },
    { name: 'Sulfa drugs', severity: 'Moderate', reaction: 'Rash' },
    ...(patient.allergies ? patient.allergies.split(',').map(a => ({ name: a.trim(), severity: 'Reported', reaction: 'Unknown' })) : [])
  ]);
  
  const [showAddAllergyDialog, setShowAddAllergyDialog] = useState(false);
  const [newAllergy, setNewAllergy] = useState({
    allergen: '',
    reaction: '',
    severity: 'Moderate'
  });

  const handleAddAllergy = () => {
    setShowAddAllergyDialog(true);
  };

  const handleSaveAllergy = () => {
    if (!newAllergy.allergen || !newAllergy.reaction) {
      toast.error('Please fill in allergen and reaction');
      return;
    }

    const allergy = {
      name: newAllergy.allergen,
      severity: newAllergy.severity,
      reaction: newAllergy.reaction
    };

    setAllergies([...allergies, allergy]);
    setNewAllergy({ allergen: '', reaction: '', severity: 'Moderate' });
    setShowAddAllergyDialog(false);
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

      {allergies.length > 0 ? (
        <div className="space-y-3">
          {allergies.map((allergy, index) => (
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
function ProblemsView({ patient }: { patient: Patient }) {
  const problems = patient.chronic_conditions ? 
    patient.chronic_conditions.split(',').map(c => c.trim()).filter(c => c) : [];

  const [diagnoses, setDiagnoses] = useState([
    { code: 'J10.0', name: 'Influenza with pneumonia', status: 'Active', onset: '2025-03-10' },
    { code: 'I10', name: 'Essential hypertension', status: 'Chronic', onset: '2020-01-15' },
  ]);

  const [showAddDiagnosisDialog, setShowAddDiagnosisDialog] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState({
    description: '',
    icd10Code: '',
    onsetDate: '',
    type: 'Primary',
    status: 'Active'
  });

  const handleAddDiagnosis = () => {
    setShowAddDiagnosisDialog(true);
  };

  const handleSaveDiagnosis = () => {
    if (!newDiagnosis.description || !newDiagnosis.icd10Code) {
      toast.error('Please fill in diagnosis description and ICD-10 code');
      return;
    }

    const diagnosis = {
      code: newDiagnosis.icd10Code,
      name: newDiagnosis.description,
      status: newDiagnosis.status,
      onset: newDiagnosis.onsetDate || new Date().toISOString().split('T')[0],
      type: newDiagnosis.type
    };

    setDiagnoses([diagnosis, ...diagnoses]);
    setNewDiagnosis({ description: '', icd10Code: '', onsetDate: '', type: 'Primary', status: 'Active' });
    setShowAddDiagnosisDialog(false);
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
                <Button variant="ghost" size="sm">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {problems.length > 0 && (
        <>
          <h3 className="font-semibold text-lg mt-6">Chronic Conditions</h3>
          <div className="space-y-3">
            {problems.map((problem, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{problem}</h4>
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
    </div>
  );
}

// Medication List Component
function MedicationsView({ patient: _patient }: { patient: Patient }) {
  const [medications, setMedications] = useState([
    { name: 'Paracetamol', dose: '500mg', frequency: 'Every 6 hours', route: 'Oral', status: 'Active' },
    { name: 'Oseltamivir', dose: '75mg', frequency: 'Twice daily', route: 'Oral', status: 'Active' },
    { name: 'Amlodipine', dose: '5mg', frequency: 'Once daily', route: 'Oral', status: 'Chronic' },
  ]);

  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    route: 'Oral',
    specialInstructions: ''
  });

  const handlePrescribe = () => {
    setShowPrescriptionDialog(true);
  };

  const handleSavePrescription = () => {
    if (!newPrescription.medicationName || !newPrescription.dosage || !newPrescription.frequency) {
      toast.error('Please fill in medication name, dosage, and frequency');
      return;
    }

    const prescription = {
      name: newPrescription.medicationName,
      dose: newPrescription.dosage,
      frequency: newPrescription.frequency,
      route: newPrescription.route,
      status: 'Active',
      specialInstructions: newPrescription.specialInstructions
    };

    setMedications([prescription, ...medications]);
    setNewPrescription({ medicationName: '', dosage: '', frequency: '', route: 'Oral', specialInstructions: '' });
    setShowPrescriptionDialog(false);
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

      <div className="space-y-3">
        {medications.map((med, index) => (
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
function VitalSignsView({ patient: _patient, vitals }: { patient: Patient; vitals: any }) {
  const [timeRange, setTimeRange] = useState('24h');
  const [vitalHistory, setVitalHistory] = useState([
    { date: '2025-03-17 08:00', bp: '120/80', hr: 72, temp: 36.8, rr: 16, spo2: 98, weight: 75 },
    { date: '2025-03-17 14:00', bp: '118/78', hr: 70, temp: 36.6, rr: 15, spo2: 99, weight: 75 },
    { date: '2025-03-16 08:00', bp: '122/82', hr: 74, temp: 36.9, rr: 17, spo2: 97, weight: 75.2 },
    { date: '2025-03-15 08:00', bp: '125/85', hr: 76, temp: 37.1, rr: 18, spo2: 96, weight: 75.5 },
  ]);

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

  const handleRecordVitals = () => {
    setShowRecordVitalsDialog(true);
  };

  const handleSaveVitals = () => {
    if (!newVitals.bloodPressureSystolic || !newVitals.bloodPressureDiastolic || !newVitals.heartRate) {
      toast.error('Please fill in at least blood pressure and heart rate');
      return;
    }

    const vitalRecord = {
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
      weight: parseFloat(newVitals.weight) || 75
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
    toast.success('Vital signs recorded successfully');
  };

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
              <p className="text-2xl font-bold text-slate-800">{vitalHistory[0]?.temp || '36.8'}°C</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 uppercase mb-1">Heart Rate</p>
              <p className="text-2xl font-bold text-slate-800">{vitalHistory[0]?.hr || '72'}</p>
              <p className="text-xs text-gray-400">bpm</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Activity className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 uppercase mb-1">Blood Pressure</p>
              <p className="text-2xl font-bold text-slate-800">{vitalHistory[0]?.bp || '120/80'}</p>
              <p className="text-xs text-gray-400">mmHg</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Wind className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 uppercase mb-1">Respiratory</p>
              <p className="text-2xl font-bold text-slate-800">{vitalHistory[0]?.rr || '16'}</p>
              <p className="text-xs text-gray-400">/min</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Droplets className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 uppercase mb-1">SpO2</p>
              <p className="text-2xl font-bold text-slate-800">{vitalHistory[0]?.spo2 || '98'}%</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Weight className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 uppercase mb-1">Weight</p>
              <p className="text-2xl font-bold text-slate-800">{vitalHistory[0]?.weight || '75'}</p>
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
                  <td className="py-3 px-4 text-sm">{record.date}</td>
                  <td className="py-3 px-4 text-sm text-center font-medium">{record.bp}</td>
                  <td className="py-3 px-4 text-sm text-center">{record.hr}</td>
                  <td className="py-3 px-4 text-sm text-center">{record.temp}°C</td>
                  <td className="py-3 px-4 text-sm text-center">{record.rr}</td>
                  <td className="py-3 px-4 text-sm text-center">{record.spo2}%</td>
                  <td className="py-3 px-4 text-sm text-center">{record.weight} kg</td>
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
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Height</p>
              <p className="text-xl font-bold">{vitals?.height || '170'} cm</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Weight</p>
              <p className="text-xl font-bold">{vitalHistory[0]?.weight || '75'} kg</p>
            </div>
            <div className="h-12 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-sm text-gray-500">BMI</p>
              <p className="text-2xl font-bold text-blue-600">{vitals?.bmi || '25.9'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Category</p>
              <Badge className="bg-yellow-100 text-yellow-800">Overweight</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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
function ResultsView({ patient: _patient }: { patient: Patient }) {
  const [results, setResults] = useState([
    { type: 'Laboratory', name: 'Complete Blood Count', date: '2025-03-17', status: 'Final', result: 'Normal' },
    { type: 'Laboratory', name: 'Rapid Influenza Test', date: '2025-03-17', status: 'Final', result: 'Positive (Type A)' },
    { type: 'Radiology', name: 'Chest X-Ray', date: '2025-03-16', status: 'Final', result: 'Bilateral infiltrates' },
  ]);

  const [showOrderTestDialog, setShowOrderTestDialog] = useState(false);
  const [newTest, setNewTest] = useState({
    testName: '',
    testType: 'Laboratory',
    urgency: 'Routine',
    clinicalIndication: ''
  });

  const handleOrderTest = () => {
    setShowOrderTestDialog(true);
  };

  const handleSaveTest = () => {
    if (!newTest.testName || !newTest.clinicalIndication) {
      toast.error('Please fill in test name and clinical indication');
      return;
    }

    const test = {
      type: newTest.testType,
      name: newTest.testName,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      result: 'Ordered',
      urgency: newTest.urgency
    };

    setResults([test, ...results]);
    setNewTest({ testName: '', testType: 'Laboratory', urgency: 'Routine', clinicalIndication: '' });
    setShowOrderTestDialog(false);
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

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="lab">Laboratory</TabsTrigger>
          <TabsTrigger value="rad">Radiology</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {results.map((result, index) => (
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
function HistoriesView({ patient: _patient }: { patient: Patient }) {
  const [histories, setHistories] = useState([
    { type: 'Medical', description: 'Hypertension diagnosed 2020, on Amlodipine' },
    { type: 'Surgical', description: 'Appendectomy 2015' },
    { type: 'Family', description: 'Father: Diabetes, Mother: Hypertension' },
    { type: 'Social', description: 'Non-smoker, occasional alcohol' },
  ]);

  const [showAddHistoryDialog, setShowAddHistoryDialog] = useState(false);
  const [newHistory, setNewHistory] = useState({
    type: 'Medical',
    description: ''
  });

  const handleAddHistory = () => {
    setShowAddHistoryDialog(true);
  };

  const handleSaveHistory = () => {
    if (!newHistory.description) {
      toast.error('Please fill in history description');
      return;
    }

    const history = {
      type: newHistory.type,
      description: newHistory.description
    };

    setHistories([...histories, history]);
    setNewHistory({ type: 'Medical', description: '' });
    setShowAddHistoryDialog(false);
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

      <div className="grid grid-cols-2 gap-4">
        {histories.map((history, index) => (
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
function ImmunizationsView({ patient: _patient }: { patient: Patient }) {
  const [immunizations, setImmunizations] = useState([
    { vaccine: 'COVID-19 Vaccine', dose: 'Booster', date: '2024-01-15', nextDue: 'N/A' },
    { vaccine: 'Influenza', dose: 'Annual', date: '2024-10-01', nextDue: '2025-10-01' },
    { vaccine: 'Tetanus', dose: '10-year', date: '2020-05-20', nextDue: '2030-05-20' },
  ]);

  const [showRecordVaccineDialog, setShowRecordVaccineDialog] = useState(false);
  const [newVaccine, setNewVaccine] = useState({
    vaccine: '',
    dose: '',
    dateGiven: '',
    nextDue: '',
    lotNumber: '',
    site: ''
  });

  const handleRecordVaccine = () => {
    setShowRecordVaccineDialog(true);
  };

  const handleSaveVaccine = () => {
    if (!newVaccine.vaccine || !newVaccine.dateGiven) {
      toast.error('Please fill in vaccine name and date given');
      return;
    }

    const vaccine = {
      vaccine: newVaccine.vaccine,
      dose: newVaccine.dose || 'Single',
      date: newVaccine.dateGiven,
      nextDue: newVaccine.nextDue || 'N/A',
      lotNumber: newVaccine.lotNumber,
      site: newVaccine.site
    };

    setImmunizations([vaccine, ...immunizations]);
    setNewVaccine({ vaccine: '', dose: '', dateGiven: '', nextDue: '', lotNumber: '', site: '' });
    setShowRecordVaccineDialog(false);
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
            {immunizations.map((imm, index) => (
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
function ScheduleView({ patient: _patient }: { patient: Patient }) {
  const [appointments, setAppointments] = useState([
    { date: '2025-03-24', time: '09:00', type: 'Follow-up', provider: 'Dr. James Kamau', status: 'Scheduled' },
    { date: '2025-04-15', time: '10:30', type: 'Lab Review', provider: 'Dr. James Kamau', status: 'Scheduled' },
  ]);

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    type: 'Follow-up',
    provider: '',
    notes: ''
  });

  const handleScheduleAppointment = () => {
    setShowScheduleDialog(true);
  };

  const handleSaveAppointment = () => {
    if (!newAppointment.date || !newAppointment.time || !newAppointment.provider) {
      toast.error('Please fill in date, time, and provider');
      return;
    }

    const appointment = {
      date: newAppointment.date,
      time: newAppointment.time,
      type: newAppointment.type,
      provider: newAppointment.provider,
      status: 'Scheduled',
      notes: newAppointment.notes
    };

    setAppointments([...appointments, appointment].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    }));
    
    setNewAppointment({ date: '', time: '', type: 'Follow-up', provider: '', notes: '' });
    setShowScheduleDialog(false);
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

      <div className="space-y-3">
        {appointments.map((apt, index) => (
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

// Synopsis Component (Main Dashboard View)
function SynopsisView({ patient, vitals }: { patient: Patient; vitals: any }) {
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
          <div className="grid grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">BP</p>
              <p className="text-xl font-bold text-slate-800">
                {vitals?.blood_pressure?.display || '120/80'}
              </p>
              <p className="text-xs text-gray-400">mmHg</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">HR</p>
              <p className="text-xl font-bold text-slate-800">
                {vitals?.heart_rate || '72'}
              </p>
              <p className="text-xs text-gray-400">bpm</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">TEMP</p>
              <p className="text-xl font-bold text-slate-800">
                {vitals?.temperature || '36.8'}°C
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">RR</p>
              <p className="text-xl font-bold text-slate-800">
                {vitals?.respiratory_rate || '16'}
              </p>
              <p className="text-xs text-gray-400">resp/m</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">SPO2</p>
              <p className="text-xl font-bold text-slate-800">
                {vitals?.oxygen_saturation || '98'}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">WEIGHT</p>
              <p className="text-xl font-bold text-slate-800">
                {vitals?.weight || '75'}
              </p>
              <p className="text-xs text-gray-400">kg</p>
            </div>
          </div>
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
                {patient.chronic_conditions ? 1 : 0}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {patient.chronic_conditions ? (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-800">{patient.chronic_conditions}</span>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
                <p className="text-xs text-gray-500">ICD: J10.0</p>
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
                2
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="font-medium text-slate-800">Paracetamol 500mg</p>
              <p className="text-sm text-gray-500">500mg - Every 6 hours - Oral</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="font-medium text-slate-800">Oseltamivir 75mg</p>
              <p className="text-sm text-gray-500">75mg - Twice daily - Oral</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clinical Notes */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <ClipboardList className="h-4 w-4" />
              <span className="font-semibold">Recent Clinical Notes</span>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              New Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-slate-700 text-white text-xs">SOAP</Badge>
              <span className="text-xs text-gray-500">17 Mar 2026, 13:58</span>
            </div>
            <p className="font-medium text-slate-800 mb-1">Dr. James Kamau</p>
            <p className="text-sm text-gray-600">
              Clinical presentation consistent with influenza. Rapid influenza test pending.
            </p>
          </div>
        </CardContent>
      </Card>
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
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await aiApi.getAlerts();
      return response.data.alerts;
    },
  });

  const patientAlerts = alerts?.filter((a: any) => a.patient_id === patientId) || [];
  const latestVitals = history?.encounters?.[0]?.vital_signs;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDOB = (dob: string) => {
    if (!dob) return 'N/A';
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
        return <SBARView patient={patient} />;
      case 'inpatient':
        return <InpatientSummariesView patient={patient} />;
      case 'demographics':
        return <DemographicsView patient={patient} />;
      case 'allergies':
        return <AllergiesView patient={patient} />;
      case 'problems':
        return <ProblemsView patient={patient} />;
      case 'medications':
        return <MedicationsView patient={patient} />;
      case 'vitals':
        return <VitalSignsView patient={patient} vitals={latestVitals} />;
      case 'results':
        return <ResultsView patient={patient} />;
      case 'histories':
        return <HistoriesView patient={patient} />;
      case 'immunizations':
        return <ImmunizationsView patient={patient} />;
      case 'schedule':
        return <ScheduleView patient={patient} />;
      case 'synopsis':
        return <SynopsisView patient={patient} vitals={latestVitals} />;
      case 'visits':
        return <VisitsView patient={patient} />;
      case 'documents':
        return <DocumentsView patient={patient} />;
      case 'prescriptions':
        return <PrescriptionsView patient={patient} />;
      case 'tools':
        return <ToolsView patient={patient} />;
      case 'tasks':
        return <TasksView patient={patient} />;
      case 'reports':
        return <ReportsView patient={patient} />;
      default:
        return <SynopsisView patient={patient} vitals={latestVitals} />;
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
              {clinicalMenuItems.map((item) => (
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
                  {item.badge && (
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visitData, setVisitData] = useState({
    visit_type: '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  });

  const handleScheduleVisit = () => {
    toast.success('Visit scheduled successfully');
    setIsDialogOpen(false);
    setVisitData({
      visit_type: '',
      date: '',
      time: '',
      reason: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Patient Visits</h3>
        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Visit
        </Button>
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

function DocumentsView({ patient }: { patient: Patient }) {
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

function PrescriptionsView({ patient }: { patient: Patient }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Prescriptions</h3>
        <Button variant="outline" size="sm">
          <Pill className="h-4 w-4 mr-2" />
          New Prescription
        </Button>
      </div>
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <p className="text-gray-500">Prescription management would go here</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ToolsView({ patient }: { patient: Patient }) {
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    priority: 'medium',
    due_date: '',
    description: '',
    assigned_to: ''
  });

  const handleAddTask = () => {
    if (!taskData.title) {
      toast.error('Please enter a task title');
      return;
    }
    toast.success('Task added successfully');
    setIsDialogOpen(false);
    setTaskData({
      title: '',
      priority: 'medium',
      due_date: '',
      description: '',
      assigned_to: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Tasks</h3>
        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
          <CheckSquare className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      
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
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Input
                id="assigned_to"
                placeholder="Assign to..."
                value={taskData.assigned_to}
                onChange={(e) => setTaskData({...taskData, assigned_to: e.target.value})}
              />
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reportData, setReportData] = useState({
    report_type: '',
    date_range: 'custom',
    start_date: '',
    end_date: '',
    format: 'pdf',
    include_sections: [] as string[]
  });

  const handleGenerateReport = () => {
    if (!reportData.report_type) {
      toast.error('Please select a report type');
      return;
    }
    toast.success('Report generated successfully');
    setIsDialogOpen(false);
    setReportData({
      report_type: '',
      date_range: 'custom',
      start_date: '',
      end_date: '',
      format: 'pdf',
      include_sections: []
    });
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
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">Word Document</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
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
            <Button onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <p className="text-gray-500">Report generation would go here</p>
        </CardContent>
      </Card>
    </div>
  );
}
