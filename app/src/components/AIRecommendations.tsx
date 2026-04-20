// frontend/src/components/AIRecommendations.tsx
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Activity, Heart, Droplets } from 'lucide-react';

interface Recommendation {
  action?: string;
  suggestion?: string;
  advice?: string;
  priority?: string;
  reason?: string;
  frequency?: string;
  duration?: string;
  category?: string;
}

interface RecommendationsData {
  patient_id: number;
  patient_name: string;
  assessment_time: string;
  risk_summary: {
    level: string;
    score: number;
    percentage: string;
  };
  abnormal_findings?: string[];
  news2_score?: number;
  news2_interpretation?: string;
  full_recommendation?: string;
  recommendations: {
    priority_actions: Recommendation[];
    monitoring: Recommendation[];
    lifestyle: Recommendation[];
  };
}

export default function AIRecommendations({ patientId }: { patientId: number }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ai-recommendations', patientId],
    queryFn: async () => {
      const response = await aiApi.getRecommendations(patientId);
      return response.data as RecommendationsData;
    },
    enabled: !!patientId,
    retry: 1,
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH RISK': return 'bg-red-100 text-red-800 border-red-200';
      case 'MODERATE RISK': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Generating AI recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('AI Recommendations error:', error);
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Unable to load recommendations</p>
          <p className="text-sm text-gray-400 mb-4">The AI service may be unavailable</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Safely access nested properties with optional chaining
  const riskSummary = data.risk_summary;
  const abnormalFindings = data.abnormal_findings || [];
  const recommendations = data.recommendations || { priority_actions: [], monitoring: [], lifestyle: [] };
  const priorityActions = recommendations.priority_actions || [];
  const monitoring = recommendations.monitoring || [];
  const lifestyle = recommendations.lifestyle || [];

  return (
    <div className="space-y-4">
      {/* Risk Summary Card */}
      {riskSummary && (
        <Card className={`border-2 ${getRiskColor(riskSummary.level)}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                AI Risk Assessment
              </CardTitle>
              <Badge className={getRiskColor(riskSummary.level)}>
                {riskSummary.level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">Risk Score</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(riskSummary.score || 0) * 100}%` }}
                ></div>
              </div>
              <div className="text-right text-sm font-medium mt-1">
                {riskSummary.percentage || `${((riskSummary.score || 0) * 100).toFixed(1)}%`}
              </div>
            </div>
            
            {abnormalFindings.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">Abnormal Findings:</div>
                <ul className="space-y-1">
                  {abnormalFindings.slice(0, 3).map((finding, idx) => (
                    <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                      <span className="text-red-500">⚠️</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* NEWS2 Score Display */}
      {data.news2_score !== undefined && data.news2_score > 0 && (
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">NEWS2 Score</p>
                <p className="text-2xl font-bold text-blue-600">{data.news2_score}</p>
              </div>
              <div className="flex-1 ml-4">
                <p className="text-sm text-gray-500">Interpretation</p>
                <p className="font-medium text-blue-800">{data.news2_interpretation || 'Clinical assessment recommended'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Text Recommendation */}
      {data.full_recommendation && (
        <Card className="border border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
              <Activity className="h-5 w-5 text-purple-600" />
              Clinical Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                {data.full_recommendation}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Priority Actions */}
      {priorityActions.length > 0 && (
        <Card className="border border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityActions.map((action, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-red-100">
                  <div className="flex items-start gap-3">
                    <Badge className={getPriorityColor(action.priority)}>
                      {action.priority?.toUpperCase() || 'ACTION'}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{action.action}</p>
                      {action.reason && (
                        <p className="text-sm text-gray-500 mt-1">{action.reason}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monitoring Suggestions */}
      {monitoring.length > 0 && (
        <Card className="border border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
              <Heart className="h-5 w-5 text-blue-600" />
              Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monitoring.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">{item.suggestion}</p>
                    {item.frequency && (
                      <p className="text-sm text-gray-500">
                        Frequency: {item.frequency} | Duration: {item.duration || 'Ongoing'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lifestyle Advice */}
      {lifestyle.length > 0 && (
        <Card className="border border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
              <Droplets className="h-5 w-5 text-green-600" />
              Lifestyle & Wellness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lifestyle.map((item, idx) => (
                <div key={idx} className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 flex-shrink-0">✓</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.advice}</p>
                      {item.category && (
                        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center mt-4">
        ⚠️ AI-generated recommendations - Clinical judgment should always take precedence
      </p>
    </div>
  );
}