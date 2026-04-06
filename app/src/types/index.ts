export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'records_officer';
  department?: string;
  phone?: string;
  is_active: boolean;
  last_login?: string;
  created_at?: string;
}

export interface Patient {
  id: number;
  patient_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  blood_type?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  county?: string;
  emergency_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  insurance?: {
    provider?: string;
    number?: string;
  };
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  encounter_count?: number;
  last_visit?: string;
}

export interface VitalSigns {
  id: number;
  patient_id: number;
  encounter_id?: number;
  recorded_at?: string;
  temperature?: number;
  temperature_site?: string;
  heart_rate?: number;
  respiratory_rate?: number;
  blood_pressure?: {
    systolic?: number;
    diastolic?: number;
    display?: string;
  };
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  pain_score?: number;
  alert?: {
    generated: boolean;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    description?: string;
  };
}

export interface Encounter {
  id: number;
  encounter_id: string;
  patient_id: number;
  provider_id: number;
  provider_name?: string;
  visit_date: string;
  visit_type: 'outpatient' | 'inpatient' | 'emergency' | 'follow_up';
  chief_complaint?: string;
  history_of_present_illness?: string;
  physical_examination?: string;
  assessment?: string;
  diagnosis_primary?: string;
  diagnosis_secondary?: string;
  treatment_plan?: string;
  medications_prescribed?: string;
  procedures?: string;
  lab_tests_ordered?: string;
  lab_results?: string;
  follow_up_instructions?: string;
  follow_up_date?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at?: string;
  vital_signs?: VitalSigns;
}

export interface Alert {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_id_number: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recorded_at: string;
  vital_signs: VitalSigns;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  username?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
  success: boolean;
}

export interface DashboardStats {
  total_patients: number;
  total_encounters: number;
  today_encounters: number;
  critical_alerts: number;
}

export interface SearchResult {
  type: 'patient' | 'encounter';
  id: number;
  title: string;
  subtitle: string;
  details: string;
  relevance_score: number;
  url: string;
}

export interface RiskAssessment {
  risk_score: number;
  risk_level: {
    level: 'low' | 'moderate' | 'high' | 'critical';
    color: string;
    description: string;
  };
  risk_factors: string[];
  recommendations: string[];
  assessed_at: string;
}
