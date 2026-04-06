import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientsApi } from '@/services/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PatientForm from '@/components/PatientForm';
import { toast } from 'sonner';
import type { Patient } from '@/types';

export default function PatientsDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['patients', searchQuery, page],
    queryFn: async () => {
      const response = await patientsApi.getAll({
        search: searchQuery,
        page,
        per_page: 10,
      });
      return response.data as { patients: Patient[]; total: number; pages: number };
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handlePatientCreated = () => {
    setIsAddDialogOpen(false);
    refetch();
    toast.success('Patient registered successfully');
  };

  // Format name as "Lastname, Firstname"
  const formatName = (patient: Patient) => {
    return `${patient.last_name}, ${patient.first_name}`;
  };

  // Format DOB as "YYYY-MM-DD • gender"
  const formatDOBGender = (patient: Patient) => {
    const dob = patient.date_of_birth 
      ? new Date(patient.date_of_birth).toISOString().split('T')[0]
      : 'N/A';
    return `${dob} • ${patient.gender}`;
  };

  // Format last visit date
  const formatLastVisit = (patient: Patient) => {
    if (!patient.last_visit) return 'New';
    const date = new Date(patient.last_visit);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
  };

  // Get NHIF number or default
  const getNHIFNumber = (patient: Patient) => {
    return patient.insurance?.number || 'NHIF' + String(patient.id).padStart(6, '0');
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Directory</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and search clinical records</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-800 hover:bg-slate-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Register New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Patient</DialogTitle>
              </DialogHeader>
              <PatientForm onSuccess={handlePatientCreated} onCancel={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, ID, NHIF..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-gray-200"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    DOB / Gender
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    NHIF No.
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-slate-800 border-t-transparent rounded-full" />
                      </div>
                    </td>
                  </tr>
                ) : data?.patients && data.patients.length > 0 ? (
                  data.patients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {patient.patient_id}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-slate-800">
                          {formatName(patient)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatDOBGender(patient)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {getNHIFNumber(patient)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatLastVisit(patient)}
                      </td>
                      <td className="py-4 px-4">
                        <Button 
                          asChild 
                          variant="outline" 
                          size="sm"
                          className="text-slate-700 border-gray-200 hover:bg-gray-100"
                        >
                          <Link to={`/patients/${patient.id}/chart`}>
                            Open Chart
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {data?.patients?.length || 0} of {data?.total || 0} patients
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-gray-600 border-gray-300"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data?.pages || 1, p + 1))}
                disabled={page === (data?.pages || 1)}
                className="text-gray-600 border-gray-300"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
