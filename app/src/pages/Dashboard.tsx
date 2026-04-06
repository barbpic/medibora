import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/services/api';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  Activity,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  FileText,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardStats, Patient } from '@/types';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await aiApi.getDashboardStats();
      return response.data as { stats: DashboardStats; recent_patients: Patient[] };
    },
  });

  const statCards = [
    {
      title: 'Total Patients',
      value: stats?.stats.total_patients || 0,
      icon: Users,
      color: 'bg-blue-500',
      link: '/patients',
    },
    {
      title: 'Today\'s Encounters',
      value: stats?.stats.today_encounters || 0,
      icon: Calendar,
      color: 'bg-green-500',
      link: '/encounters',
    },
    {
      title: 'Total Encounters',
      value: stats?.stats.total_encounters || 0,
      icon: FileText,
      color: 'bg-purple-500',
      link: '/encounters',
    },
    {
      title: 'Critical Alerts',
      value: stats?.stats.critical_alerts || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/alerts',
      alert: stats?.stats.critical_alerts ? true : false,
    },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back! Here's what's happening in your clinic today.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/patients">
                <UserPlus className="h-4 w-4 mr-2" />
                New Patient
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {statsLoading ? '-' : stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={stat.link}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    View details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Patients */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Recent Patients</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/patients">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : stats?.recent_patients && stats.recent_patients.length > 0 ? (
                <div className="space-y-4">
                  {stats.recent_patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {patient.full_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.full_name}</p>
                          <p className="text-sm text-gray-500">
                            {patient.patient_id} • {patient.age} years • {patient.gender}
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/patients/${patient.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent patients found.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/patients">
                  <UserPlus className="h-4 w-4 mr-3" />
                  Register New Patient
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/encounters">
                  <FileText className="h-4 w-4 mr-3" />
                  View All Encounters
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/alerts">
                  <AlertTriangle className="h-4 w-4 mr-3" />
                  Check Alerts
                  {stats?.stats.critical_alerts ? (
                    <Badge variant="destructive" className="ml-auto">
                      {stats.stats.critical_alerts}
                    </Badge>
                  ) : null}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/search">
                  <Search className="h-4 w-4 mr-3" />
                  Smart Search
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Intelligent Search</h4>
                <p className="text-sm text-blue-700">
                  Use AI-powered search to quickly find patient records using natural language queries.
                </p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-blue-600">
                  <Link to="/search">Try it now →</Link>
                </Button>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Risk Assessment</h4>
                <p className="text-sm text-green-700">
                  AI analyzes patient data to identify potential health risks and provides recommendations.
                </p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-green-600">
                  <Link to="/patients">View patients →</Link>
                </Button>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">Critical Alerts</h4>
                <p className="text-sm text-orange-700">
                  Real-time monitoring of vital signs with automatic alerts for critical values.
                </p>
                <Button asChild variant="link" className="p-0 h-auto mt-2 text-orange-600">
                  <Link to="/alerts">Check alerts →</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
