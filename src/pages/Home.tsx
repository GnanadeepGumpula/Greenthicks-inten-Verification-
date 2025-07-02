import React, { useState, useEffect } from 'react';
import { Award, Users, Clock, TrendingUp, Search } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import InternCard from '../components/InternCard';
import InternDetails from '../components/InternDetails';
import { googleSheetsService } from '../services/googleSheets';
import { googleDriveService } from '../services/googleDrive';
import { Intern } from '../types';

const Home: React.FC = () => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [searchResults, setSearchResults] = useState<Intern[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterns();
  }, []);

  const loadInterns = async () => {
    try {
      setLoading(true);
      const internsData = await googleSheetsService.getInterns();
      
      // Convert Google Drive file IDs to viewable URLs
      const internsWithPhotos = internsData.map(intern => ({
        ...intern,
        photo: intern.photo ? googleDriveService.getPhotoUrl(intern.photo) : 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300'
      }));
      
      setInterns(internsWithPhotos);
    } catch (error) {
      console.error('Error loading interns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string, type: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const results = interns.filter((intern) => {
      const searchQuery = query.toLowerCase();
      
      switch (type) {
        case 'name':
          return `${intern.firstName} ${intern.lastName}`.toLowerCase().includes(searchQuery);
        case 'id':
          return intern.uniqueId.toLowerCase().includes(searchQuery);
        case 'phone':
          return intern.phoneNumber.includes(searchQuery);
        case 'email':
          return intern.email.toLowerCase().includes(searchQuery);
        default:
          return (
            `${intern.firstName} ${intern.lastName}`.toLowerCase().includes(searchQuery) ||
            intern.uniqueId.toLowerCase().includes(searchQuery) ||
            intern.phoneNumber.includes(searchQuery) ||
            intern.email.toLowerCase().includes(searchQuery)
          );
      }
    });

    setSearchResults(results);
    setHasSearched(true);
  };

  const stats = [
    { icon: Users, label: 'Total Interns', value: interns.length.toString(), color: 'text-blue-600' },
    { icon: Award, label: 'Certificates Issued', value: interns.filter(i => i.certificateIssued).length.toString(), color: 'text-green-600' },
    { icon: Clock, label: 'Training Weeks', value: interns.reduce((acc, i) => acc + i.totalOnlineWeeks + i.totalOfflineWeeks, 0).toString(), color: 'text-purple-600' },
    { icon: TrendingUp, label: 'Success Rate', value: interns.length > 0 ? Math.round((interns.filter(i => i.certificateIssued).length / interns.length) * 100) + '%' : '0%', color: 'text-orange-600' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading intern data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Green Thicks Internship
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              Fresh From Farm To Table - Nurturing Tech Talent
            </p>
            <p className="text-lg mb-12 max-w-3xl mx-auto text-green-50">
              Verify internship certificates and explore the achievements of our talented interns. 
              Search by name, ID, phone number, or email to view detailed profiles and project portfolios.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Find an Intern
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Search our database to verify certificates and view intern profiles
            </p>
          </div>
          
          <SearchBar onSearch={handleSearch} />

          {/* Search Results */}
          {hasSearched && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Search Results ({searchResults.length})
              </h3>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((intern) => (
                    <InternCard
                      key={intern.id}
                      intern={intern}
                      onClick={() => setSelectedIntern(intern)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search terms or search type
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Building the future of technology, one intern at a time
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                <stat.icon className={`h-12 w-12 ${stat.color} mx-auto mb-4`} />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Green Thicks?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Industry-Recognized Certificates
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our certificates are valued by top tech companies and include QR verification for authenticity.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Expert Mentorship
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Learn from industry professionals with hands-on experience in cutting-edge technologies.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Career Growth
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                95% of our interns secure full-time positions or advance their careers within 6 months.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intern Details Modal */}
      {selectedIntern && (
        <InternDetails
          intern={selectedIntern}
          onClose={() => setSelectedIntern(null)}
        />
      )}
    </div>
  );
};

export default Home;