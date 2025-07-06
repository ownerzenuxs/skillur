
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { SubjectManager } from '@/components/SubjectManager';
import { ChapterManager } from '@/components/ChapterManager';
import { CardManager } from '@/components/CardManager';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { BookOpen, FileText, CreditCard, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalSubjects: number;
  totalChapters: number;
  totalCards: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('subjects');
  const [stats, setStats] = useState<DashboardStats>({
    totalSubjects: 0,
    totalChapters: 0,
    totalCards: 0,
    totalUsers: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      
      // Fetch subjects count
      const { count: subjectsCount } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });

      // Fetch chapters count
      const { count: chaptersCount } = await supabase
        .from('chapters')
        .select('*', { count: 'exact', head: true });

      // Fetch cards count
      const { count: cardsCount } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true });

      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalSubjects: subjectsCount || 0,
        totalChapters: chaptersCount || 0,
        totalCards: cardsCount || 0,
        totalUsers: usersCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse transform -translate-x-1/2" />
        </div>
        <Navbar />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse transform -translate-x-1/2" />
      </div>
      
      <Navbar />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage subjects, chapters, and study cards</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats.totalSubjects}
              </div>
              <p className="text-xs text-muted-foreground">Active subjects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats.totalChapters}
              </div>
              <p className="text-xs text-muted-foreground">Available chapters</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Cards</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats.totalCards}
              </div>
              <p className="text-xs text-muted-foreground">Total cards created</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground">Registered students</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>
              Manage your educational content and study materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                <TabsTrigger value="chapters">Chapters</TabsTrigger>
                <TabsTrigger value="cards">Study Cards</TabsTrigger>
              </TabsList>
              
              <TabsContent value="subjects" className="mt-6">
                <SubjectManager />
              </TabsContent>
              
              <TabsContent value="chapters" className="mt-6">
                <ChapterManager />
              </TabsContent>
              
              <TabsContent value="cards" className="mt-6">
                <CardManager />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
