// frontend/src/components/VitalsRiskIndicator.tsx
import { useState, useEffect } from 'react';
import api from '../services/api';

interface RiskAssessment {
  risk_score: number;
  risk_percentage: string;
  risk_level: string;
  recommendation: string;
  color_code: string;
  action_required: boolean;
}

export function VitalsRiskIndicator({ patientId }: { patientId: number }) {
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRisk = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/ai/vitals-risk/patient/${patientId}`);
      setRisk(response.data);
    } catch (error) {
      console.error('Failed to fetch risk:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchRisk();
  }, [patientId]);

  if (loading) return <div>Loading risk assessment...</div>;
  if (!risk) return null;

  return (
    <div className={`alert alert-${risk.color_code}`}>
      <h5>Clinical Risk Assessment</h5>
      <div className="risk-score">
        Risk Score: <strong>{risk.risk_percentage}</strong>
      </div>
      <div className="risk-level">
        Level: <span className={`badge bg-${risk.color_code}`}>{risk.risk_level}</span>
      </div>
      <div className="recommendation">
        Recommendation: {risk.recommendation}
      </div>
      {risk.action_required && (
        <button className="btn btn-danger mt-2">Review Patient Now</button>
      )}
    </div>
  );
}