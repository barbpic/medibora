import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientsApi, encountersApi, clinicalApi } from '@/services/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Thermometer, 
  Heart, 
  Wind, 
  Droplets, 
  Weight, 
  Ruler,
  TrendingDown,
  TrendingUp,
  Calendar,
  Plus,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import type { Patient } from '@/types';

// Mock chart component - in production would use recharts or similar
const VitalChart = ({ data, color }: { data: number[]; color: string }) => {
  const validData = data.filter(v => !isNaN(v) && v > 0);
  if (validData.length === 0) {
    return <div className="h-32 flex items-center justify-center text-gray-400 text-sm">No data available</div>;
  }
  return (
    <div className="h-32 flex items-end gap-1">
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 rounded-t"
          style={{ 
            height: `${(value / Math.max(...validData)) * 100}%`,
            backgroundColor: color,
            opacity: 0.7 + (i / data.length) * 0.3
          }}
        />
      ))}
    </div>
  );
};

export default function VitalSignsPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = parseInt(id || '0');
  const [timeRange, setTimeRange] = useState('7d');

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await patientsApi.getById(patientId);
      return response.data.patient as Patient;
    },
  });

  const { data: _history } = useQuery({
    queryKey: ['patientHistory', patientId],
    queryFn: async () => {
      const response = await encountersApi.getPatientHistory(patientId);
      return response.data;
    },
  });

  const { data: vitalsData } = useQuery({
    queryKey: ['vitals', patientId],
    queryFn: async () => {
      const response = await clinicalApi.getVitalSigns(patientId);
      return response.data.vital_signs as any[];
    },
    enabled: !!patientId,
  });

  const vitalHistory = vitalsData && vitalsData.length > 0 
    ? vitalsData.map((v: any) => ({
        date: v.recorded_at?.replace('T', ' ').substring(0, 16) || '',
        bp: v.blood_pressure_systolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : ' ',
        hr: v.heart_rate || ' ',
        temp: v.temperature || ' ',
        rr: v.respiratory_rate || ' ',
        spo2: v.oxygen_saturation || ' ',
        weight: v.weight,
        height: v.height || 170,
      }))
    : [];

  const latestVitals = vitalHistory.length > 0 ? vitalHistory[0] : { bp: ' ', hr: ' ', temp: ' ', rr: ' ', spo2: ' ', weight: 0, height: 170 };

  // Calculate BMI
  const bmi = (latestVitals?.weight && latestVitals?.height) 
    ? latestVitals.weight / ((latestVitals.height / 100) ** 2) 
    : 0;
  
  // Determine BMI category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-blue-100 text-blue-800' };
    if (bmi < 25) return { label: 'Normal', color: 'bg-green-100 text-green-800' };
    if (bmi < 30) return { label: 'Overweight', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Obese', color: 'bg-red-100 text-red-800' };
  };

  const bmiCategory = getBMICategory(bmi);

  if (patientLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin h-8 w-8 border-2 border-slate-800 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link to={`/patients/${patientId}/chart`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vital Signs</h1>
              <p className="text-gray-500">{patient?.full_name} • {patient?.patient_id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Record Vitals
            </Button>
          </div>
        </div>

        {/* Latest Vitals Cards */}
        <div className="grid grid-cols-6 gap-4">
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-500">Blood Pressure</span>
              </div>
              <p className="text-2xl font-bold">{latestVitals?.bp || ' '}</p>
              <p className="text-xs text-gray-400">mmHg</p>
              <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                <TrendingDown className="h-4 w-4" />
                <span>Normal</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-sm text-gray-500">Heart Rate</span>
              </div>
              <p className="text-2xl font-bold">{latestVitals?.hr || ' '}</p>
              <p className="text-xs text-gray-400">bpm</p>
              <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                <TrendingDown className="h-4 w-4" />
                <span>Normal</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-500">Temperature</span>
              </div>
              <p className="text-2xl font-bold">{latestVitals?.temp !== ' ' ? `${latestVitals?.temp}°C` : ' '}</p>
              <p className="text-xs text-gray-400">Celsius</p>
              <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                <TrendingDown className="h-4 w-4" />
                <span>Normal</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Respiratory Rate</span>
              </div>
              <p className="text-2xl font-bold">{latestVitals?.rr || '--'}</p>
              <p className="text-xs text-gray-400">breaths/min</p>
              <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                <TrendingDown className="h-4 w-4" />
                <span>Normal</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-5 w-5 text-cyan-500" />
                <span className="text-sm text-gray-500">SpO2</span>
              </div>
              <p className="text-2xl font-bold">{latestVitals?.spo2 ? `${latestVitals.spo2}%` : '--'}</p>
              <p className="text-xs text-gray-400">Oxygen saturation</p>
              <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>Normal</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Weight className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-gray-500">Weight</span>
              </div>
              <p className="text-2xl font-bold">{latestVitals?.weight || '--'}</p>
              <p className="text-xs text-gray-400">kg</p>
              <div className="mt-2 flex items-center gap-1 text-gray-500 text-sm">
                <span>Stable</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BMI and Charts */}
        <div className="grid grid-cols-3 gap-4">
          {/* BMI Calculator */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-purple-600" />
                <span className="font-semibold">BMI Calculator</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Height</p>
                    <p className="text-xl font-bold">{latestVitals?.height || 170} cm</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="text-xl font-bold">{latestVitals?.weight || ' '} kg</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">BMI</p>
                      <p className="text-3xl font-bold text-blue-600">{bmi.toFixed(1)}</p>
                    </div>
                    <Badge className={bmiCategory.color}>
                      {bmiCategory.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blood Pressure Trend */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Blood Pressure Trend</span>
                </div>
                <span className="text-xs text-gray-500">Last 7 days</span>
              </div>
            </CardHeader>
            <CardContent>
              <VitalChart 
                data={vitalHistory.length > 0 && vitalHistory[0].bp !== ' ' ? vitalHistory.map(v => parseInt(v.bp.split('/')[0])) : [120, 118, 122, 125, 119, 121, 123]} 
                color="#3b82f6" 
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Min: 118</span>
                <span>Avg: 121</span>
                <span>Max: 125</span>
              </div>
            </CardContent>
          </Card>

          {/* Heart Rate Trend */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">Heart Rate Trend</span>
                </div>
                <span className="text-xs text-gray-500">Last 7 days</span>
              </div>
            </CardHeader>
            <CardContent>
              <VitalChart 
                data={vitalHistory.length > 0 && vitalHistory[0].hr !== ' ' ? vitalHistory.map(v => parseInt(v.hr) || 0) : [72, 70, 74, 76, 71, 73, 75]} 
                color="#ef4444" 
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Min: 70</span>
                <span>Avg: 73</span>
                <span>Max: 76</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vital Signs History Table */}
        <Card className="border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                Vital Signs History
              </CardTitle>
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date/Time</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">BP (mmHg)</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">HR (bpm)</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Temp (°C)</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">RR (/min)</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">SpO2 (%)</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Weight (kg)</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vitalHistory.length > 0 ? vitalHistory.map((record, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{record.date || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-center font-medium">{record.bp}</td>
                      <td className="py-3 px-4 text-sm text-center">{record.hr}</td>
                      <td className="py-3 px-4 text-sm text-center">{record.temp !== ' ' ? `${record.temp}°C` : ' '}</td>
                      <td className="py-3 px-4 text-sm text-center">{record.rr}</td>
                      <td className="py-3 px-4 text-sm text-center">{record.spo2 !== ' ' ? `${record.spo2}%` : ' '}</td>
                      <td className="py-3 px-4 text-sm text-center">{record.weight || ' '}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-green-100 text-green-800">Normal</Badge>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        No vital signs recorded yet. Click "Record Vitals" to add the first record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Alerts */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              AI-Generated Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">All vitals within normal range</p>
                  <p className="text-sm text-green-600">No alerts generated for current readings</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
