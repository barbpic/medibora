import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/services/api';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, User, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SearchResult } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return { results: [] };
      const response = await aiApi.search(searchQuery);
      return response.data as { results: SearchResult[] };
    },
    enabled: !!searchQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <User className="h-5 w-5 text-blue-600" />;
      case 'encounter':
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <Search className="h-5 w-5 text-gray-600" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'patient':
        return 'bg-blue-50 border-blue-200';
      case 'encounter':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const suggestedSearches = [
    'Patients with diabetes',
    'Recent encounters',
    'High blood pressure',
    'Patients from Nairobi',
    'Fever complaints',
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">AI-Powered Search</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Intelligent Search</h1>
          <p className="text-gray-500 mt-2">
            Search patients, encounters, and medical records using natural language
          </p>
        </div>

        {/* Search Bar */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by name, diagnosis, symptoms..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" className="h-12 px-6 bg-blue-600 hover:bg-blue-700">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
            </form>

            {/* Suggested Searches */}
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Try searching for:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedSearches.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion);
                      setSearchQuery(suggestion);
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchQuery && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Search Results for "{searchQuery}"
              </h2>
              {results?.results && (
                <p className="text-sm text-gray-500">
                  {results.results.length} result{results.results.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : results?.results && results.results.length > 0 ? (
              <div className="space-y-3">
                {results.results.map((result: SearchResult, index: number) => (
                  <Card
                    key={index}
                    className={`hover:shadow-md transition-shadow ${getResultColor(result.type)}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            {getResultIcon(result.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{result.title}</h3>
                              <Badge variant="outline" className="text-xs capitalize">
                                {result.type}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {result.relevance_score}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{result.subtitle}</p>
                            <p className="text-sm text-gray-500 mt-1">{result.details}</p>
                          </div>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link to={result.url}>
                            View
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500">Try adjusting your search query</p>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        {!searchQuery && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Search Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Search by patient name: "John Kamau" or "patient ID"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Search by diagnosis: "diabetes", "hypertension", "malaria"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Search by symptoms: "fever", "chest pain", "headache"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Search by location: "Nairobi", "Machakos", "Kisumu"
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
