import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/services/api';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Alert } from '@/types';

export default function AlertsPage() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await aiApi.getAlerts();
      return response.data.alerts as Alert[];
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <Activity className="h-5 w-5 text-yellow-600" />;
      default:
        return <Activity className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Critical Alerts</h1>
          <p className="text-gray-500 mt-1">
            AI-generated alerts based on vital signs and patient data
          </p>
        </div>

        {/* Alerts Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700">
                    {alerts?.filter((a) => a.severity === 'critical').length || 0}
                  </p>
                  <p className="text-sm text-red-600">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-700">
                    {alerts?.filter((a) => a.severity === 'high').length || 0}
                  </p>
                  <p className="text-sm text-orange-600">High</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-700">
                    {alerts?.filter((a) => a.severity === 'medium').length || 0}
                  </p>
                  <p className="text-sm text-yellow-600">Medium</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">
                    {alerts?.filter((a) => a.severity === 'low').length || 0}
                  </p>
                  <p className="text-sm text-blue-600">Low</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>All Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{alert.patient_name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {alert.patient_id_number}
                            </Badge>
                          </div>
                          <p className="text-sm mt-1">{alert.description}</p>
                          <p className="text-xs opacity-75 mt-2">
                            Recorded: {new Date(alert.recorded_at).toLocaleString()}
                          </p>
                          
                          {/* Vital Signs Summary */}
                          {alert.vital_signs && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {alert.vital_signs.temperature && (
                                <Badge variant="outline" className="text-xs">
                                  Temp: {alert.vital_signs.temperature}°C
                                </Badge>
                              )}
                              {alert.vital_signs.heart_rate && (
                                <Badge variant="outline" className="text-xs">
                                  HR: {alert.vital_signs.heart_rate} bpm
                                </Badge>
                              )}
                              {alert.vital_signs.blood_pressure?.display && (
                                <Badge variant="outline" className="text-xs">
                                  BP: {alert.vital_signs.blood_pressure.display}
                                </Badge>
                              )}
                              {alert.vital_signs.oxygen_saturation && (
                                <Badge variant="outline" className="text-xs">
                                  SpO2: {alert.vital_signs.oxygen_saturation}%
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/patients/${alert.patient_id}`}>
                          View Patient
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts</h3>
                <p className="text-gray-500">All patient vitals are within normal ranges</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
