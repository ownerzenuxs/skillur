import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { BookOpen, Coins, Users, GraduationCap, LogOut } from 'lucide-react';
import { ReferralModal } from '@/components/ReferralModal';

interface Subject {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
}

interface Referral {
  id: string;
  created_at: string;
  coins_awarded: number;
  referred_user: {
    scs_number: string;
  } | null;
}

export default function StudentDashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showReferralModal, setShowReferralModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          created_at,
          coins_awarded,
          referred_id,
          profiles!referrals_referred_id_fkey(scs_number)
        `)
        .eq('referrer_id', user?.id)
        .order('created_at', { ascending: false });
      if (referralsError) throw referralsError;

      const transformedReferrals = (referralsData || []).map(referral => ({
        id: referral.id,
        created_at: referral.created_at,
        coins_awarded: referral.coins_awarded,
        referred_user: referral.profiles
          ? { scs_number: referral.profiles.scs_number || 'Unknown' }
          : null,
      }));

      setReferrals(transformedReferrals);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 relative overflow-hidden">
        <Navbar />
        <div className="text-center py-32">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 relative overflow-hidden">
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-2">Continue your learning journey</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects Enrolled</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
              <p className="text-xs text-muted-foreground">Available subjects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coins</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.coins || 0}</div>
              <p className="text-xs text-muted-foreground">Total earned</p>

              <div className="mt-4">
                <Button
                  onClick={() => setShowReferralModal(true)}
                  className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-full px-4 py-2 text-sm"
                >
                  Get Referral Link
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.referral_count || 0}</div>
              <p className="text-xs text-muted-foreground">Friends referred</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.class || 'Not Set'}
              </div>
              <p className="text-xs text-muted-foreground">Current class level</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>Track your referral rewards and progress</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="text-center py-8">Loading referral history...</div>
            ) : referrals.length > 0 ? (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Friend Referred</p>
                      <p className="text-sm text-gray-600">
                        {referral.referred_user?.scs_number || 'Unknown'} -{' '}
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        +{referral.coins_awarded || 0} coins
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
                <p className="text-gray-600">Invite friends to earn coins together!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ReferralModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} />
    </div>
  );
}
