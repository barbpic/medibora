import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '@/services/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ---------------------------------------------------------
    // ULTRA-STRICT MODE: Force logout on refresh or project start
    // ---------------------------------------------------------
    const forceLogoutOnLoad = () => {
      // 1. Wipe any saved tokens from a previous session
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // 2. Ensure user state is null
      setUser(null);
      
      // 3. Stop the loading spinner
      setIsLoading(false);
    };

    forceLogoutOnLoad();
  }, []); // Empty dependency array means this runs ONCE when the app refreshes or starts

  const login = async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    const { access_token, user } = response.data;
    
    // We STILL save it to localStorage here because your api.ts file 
    // likely looks for 'access_token' in localStorage to make requests!
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore error
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const rolePermissions: Record<string, string[]> = {
      admin: ['all', 'view_patient', 'register_patient', 'edit_patient', 'delete_patient', 'view_all_patients', 'view_assigned_patients', 'create_encounter', 'edit_encounter', 'view_encounter', 'view_all_records', 'view_assigned_records', 'view_vitals', 'record_vitals', 'view_diagnoses', 'write_diagnoses', 'view_prescriptions', 'write_prescriptions', 'ai_features', 'ai_alerts', 'ai_risk_assessment', 'ai_diagnosis_suggestions', 'export_fhir', 'export_reports', 'view_audit_logs', 'manage_users', 'view_counters', 'view_ai_dashboard', 'send_appointment_email'],
      doctor: ['view_patient', 'register_patient', 'edit_patient', 'view_all_patients', 'view_assigned_patients', 'create_encounter', 'edit_encounter', 'view_encounter', 'view_all_records', 'view_assigned_records', 'view_vitals', 'record_vitals', 'view_diagnoses', 'write_diagnoses', 'view_prescriptions', 'write_prescriptions', 'ai_features', 'ai_alerts', 'ai_risk_assessment', 'ai_diagnosis_suggestions', 'export_fhir', 'export_reports', 'view_audit_logs', 'send_appointment_email'],
      nurse: ['view_patient', 'register_patient', 'edit_patient', 'view_assigned_patients', 'create_encounter', 'view_encounter', 'view_assigned_records', 'view_vitals', 'record_vitals', 'view_diagnoses', 'view_prescriptions', 'ai_alerts', 'send_appointment_email'],
      records_officer: ['view_patient', 'register_patient', 'view_all_patients', 'view_assigned_patients', 'view_encounter', 'view_all_records', 'view_vitals', 'view_diagnoses', 'view_prescriptions', 'export_fhir', 'export_reports', 'view_counters', 'view_ai_dashboard', 'view_audit_logs'],
    };
    
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes('all') || permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}