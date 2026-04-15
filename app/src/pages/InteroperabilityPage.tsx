import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { patientsApi, aiApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileJson, 
  FileText, 
  Download, 
  Copy, 
  Check,
  Globe,
  Share2,
  Database,
  Activity,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function InteroperabilityPage() {
  const [copied, setCopied] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [fhirExportData, setFhirExportData] = useState<any>(null);
  const [hl7ExportData, setHl7ExportData] = useState<string>('');

  // Fetch patients list
  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await patientsApi.getAll({ per_page: 100 });
      return response.data.patients || [];
    },
  });

  // FHIR Export mutation
  const { data: fhirData, isFetching: isFhirFetching, refetch: exportFhir } = useQuery({
    queryKey: ['exportFHIR', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return null;
      const response = await aiApi.exportFHIR(selectedPatientId);
      return response.data.data;
    },
    enabled: false,
  });

  // HL7 Export mutation  
  const { data: hl7Data, isFetching: isHl7Fetching, refetch: exportHl7 } = useQuery({
    queryKey: ['exportHL7', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return null;
      const response = await aiApi.exportHL7(selectedPatientId);
      return response.data.message;
    },
    enabled: false,
  });

  // FHIR Bundle Export
  const { refetch: exportBundle } = useQuery({
    queryKey: ['exportFHIRBundle', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return null;
      const response = await aiApi.exportFHIRBundle(selectedPatientId);
      return response.data.data;
    },
    enabled: false,
  });

  const handleExportFHIR = async () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    try {
      const result = await exportFhir();
      if (result.data) {
        setFhirExportData(result.data);
        toast.success('FHIR data exported successfully');
      }
    } catch (error) {
      toast.error('Failed to export FHIR data');
    }
  };

  const handleExportHL7 = async () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    try {
      const result = await exportHl7();
      if (result.data) {
        setHl7ExportData(result.data);
        toast.success('HL7 data exported successfully');
      }
    } catch (error) {
      toast.error('Failed to export HL7 data');
    }
  };

  const handleExportBundle = async () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    try {
      const result = await exportBundle();
      if (result.data) {
        setFhirExportData(result.data);
        toast.success('FHIR Bundle exported successfully');
      }
    } catch (error) {
      toast.error('Failed to export FHIR Bundle');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interoperability</h1>
          <p className="text-gray-500 mt-1">
            Export patient data in FHIR and HL7 formats for external system integration
          </p>
        </div>

        {/* Standards Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileJson className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">FHIR R4</CardTitle>
                  <p className="text-sm text-gray-500">Fast Healthcare Interoperability Resources</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Patient resource conversion
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Observation (Vital Signs)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Encounter documentation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Bundle export support
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">HL7 v2.x</CardTitle>
                  <p className="text-sm text-gray-500">Health Level 7 Messaging Standard</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  ADT^A04 (Patient Registration)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  ORU^R01 (Observation Results)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Vital signs transmission
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Pipe-delimited format
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Export Interface */}
        <Tabs defaultValue="fhir" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fhir">
              <FileJson className="h-4 w-4 mr-2" />
              FHIR Export
            </TabsTrigger>
            <TabsTrigger value="hl7">
              <FileText className="h-4 w-4 mr-2" />
              HL7 Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fhir" className="space-y-4">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  FHIR Resource Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <select 
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2"
                    value={selectedPatientId || ''}
                    onChange={(e) => {
                      setSelectedPatientId(e.target.value ? parseInt(e.target.value) : null);
                      setFhirExportData(null);
                    }}
                  >
                    <option value="">Select a patient...</option>
                    {patientsData?.map((patient: any) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.full_name} ({patient.patient_id})
                      </option>
                    ))}
                  </select>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleExportFHIR}
                    disabled={isFhirFetching || !selectedPatientId}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isFhirFetching ? 'Exporting...' : 'Export FHIR'}
                  </Button>
                </div>

                {fhirExportData && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">FHIR JSON Output</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCopy(fhirExportData)}
                      >
                        {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                      {JSON.stringify(fhirExportData, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  FHIR Bundle Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Export complete patient summary including encounters, vital signs, and conditions as a FHIR Bundle.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleExportBundle}
                  disabled={!selectedPatientId}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Export Complete Bundle
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hl7" className="space-y-4">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  HL7 Message Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <select 
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2"
                    value={selectedPatientId || ''}
                    onChange={(e) => {
                      setSelectedPatientId(e.target.value ? parseInt(e.target.value) : null);
                      setHl7ExportData('');
                    }}
                  >
                    <option value="">Select a patient...</option>
                    {patientsData?.map((patient: any) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.full_name} ({patient.patient_id})
                      </option>
                    ))}
                  </select>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleExportHL7}
                    disabled={isHl7Fetching || !selectedPatientId}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isHl7Fetching ? 'Exporting...' : 'Export HL7'}
                  </Button>
                </div>

                {hl7ExportData && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">HL7 Message</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCopy(hl7ExportData)}
                      >
                        {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">
                      {hl7ExportData}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-orange-600" />
                  HL7 Message Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">ADT^A04</p>
                      <p className="text-sm text-gray-500">Patient Registration</p>
                    </div>
                    <Badge>Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">ORU^R01</p>
                      <p className="text-sm text-gray-500">Observation Results</p>
                    </div>
                    <Badge>Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">MDM^T02</p>
                      <p className="text-sm text-gray-500">Medical Document</p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Integration Guide */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Integration Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">API Endpoints</h4>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                  <p className="text-blue-600">GET /api/ai/export/fhir/patient/&#123;id&#125;</p>
                  <p className="text-gray-500 mt-1">Export patient data in FHIR R4 format</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                <p className="text-green-600">GET /api/ai/export/hl7/patient/&#123;id&#125;</p>
                <p className="text-gray-500 mt-1">Export patient data in HL7 v2.5 format</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                <p className="text-purple-600">GET /api/ai/export/fhir/bundle/&#123;id&#125;</p>
                <p className="text-gray-500 mt-1">Export complete patient summary as FHIR Bundle</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
