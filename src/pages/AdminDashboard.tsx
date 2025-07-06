import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { SubjectManager } from '@/components/SubjectManager';
import { ChapterManager } from '@/components/ChapterManager';
import { CardManager } from '@/components/CardManager';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { BookOpen, FileText, CreditCard, Users, LogOut, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalSubjects: number;
  totalChapters: number;
  totalCards: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subjects');
  const [selectedClass, setSelectedClass] = useState('6');
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
  }, [user, selectedClass]);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      
      // Fetch subjects count for selected class
      const { count: subjectsCount } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true })
        .eq('class', selectedClass);

      // Fetch chapters count for selected class
      const { count: chaptersCount } = await supabase
        .from('chapters')
        .select('*', { count: 'exact', head: true })
        .eq('class', selectedClass);

      // Fetch cards count for selected class
      const { count: cardsCount } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('class', selectedClass);

      // Fetch users count for selected class
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('class', selectedClass);

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

  const handleLogout = async () => {
    const { signOut } = useAuth();
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 relative overflow-hidden">
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage subjects, chapters, and study cards</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex gap-2 items-center"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Class Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Select Class</span>
            </CardTitle>
            <CardDescription>Choose the class to manage content for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Label htmlFor="class-select">Class:</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Class 6</SelectItem>
                  <SelectItem value="7">Class 7</SelectItem>
                  <SelectItem value="8">Class 8</SelectItem>
                  <SelectItem value="9">Class 9</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class {selectedClass} Subjects</CardTitle>
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
              <CardTitle className="text-sm font-medium">Class {selectedClass} Chapters</CardTitle>
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
              <CardTitle className="text-sm font-medium">Class {selectedClass} Cards</CardTitle>
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
              <CardTitle className="text-sm font-medium">Class {selectedClass} Students</CardTitle>
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
            <CardTitle>Content Management - Class {selectedClass}</CardTitle>
            <CardDescription>
              Manage your educational content and study materials for Class {selectedClass}
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
                <SubjectManager selectedClass={selectedClass} />
              </TabsContent>
              
              <TabsContent value="chapters" className="mt-6">
                <ChapterManager selectedClass={selectedClass} />
              </TabsContent>
              
              <TabsContent value="cards" className="mt-6">
                <CardManager selectedClass={selectedClass} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}