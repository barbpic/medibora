import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { encountersApi } from '@/services/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Encounter } from '@/types';

export default function EncountersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['encounters', page],
    queryFn: async () => {
      const response = await encountersApi.getAll({ page, per_page: 10 });
      return response.data as { encounters: Encounter[]; total: number; pages: number };
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisitTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <Badge variant="destructive">Emergency</Badge>;
      case 'inpatient':
        return <Badge variant="default">Inpatient</Badge>;
      case 'follow_up':
        return <Badge variant="secondary">Follow-up</Badge>;
      default:
        return <Badge variant="outline">Outpatient</Badge>;
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Encounters</h1>
            <p className="text-gray-500 mt-1">View and manage patient encounters</p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search encounters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Encounters Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : data?.encounters && data.encounters.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Encounter ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Chief Complaint</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.encounters.map((encounter) => (
                      <TableRow key={encounter.id}>
                        <TableCell className="font-medium">{encounter.encounter_id}</TableCell>
                        <TableCell>
                          {new Date(encounter.visit_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getVisitTypeIcon(encounter.visit_type)}</TableCell>
                        <TableCell>{encounter.provider_name || 'Unknown'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {encounter.chief_complaint || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(encounter.status)}>
                            {encounter.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/encounters/${encounter.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <p className="text-sm text-gray-500">
                    Showing {data.encounters.length} of {data.total} encounters
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {data.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                      disabled={page === data.pages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No encounters found</h3>
                <p className="text-gray-500">Encounters will appear here when created</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
