
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [loginData, setLoginData] = useState({ scsNumber: '', password: '' });
  const [signupData, setSignupData] = useState({
    scsNumber: '',
    password: '',
    phoneNumber: '',
    class: '6'
  });
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referrerScs = searchParams.get('ref');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginData.scsNumber, loginData.password);
    if (!error) navigate('/');
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.scsNumber.length !== 7) {
      toast({
        title: 'Invalid SCS Number',
        description: 'SCS number must be exactly 7 digits',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(
      signupData.scsNumber,
      signupData.password,
      signupData.phoneNumber,
      referrerScs || undefined,
      signupData.class
    );

    if (!error) {
      toast({
        title: 'Account Created Successfully!',
        description: 'Welcome to Skillur! Redirecting to home...',
      });
      setTimeout(() => navigate('/'), 1500);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Skillur</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Your learning journey starts here</p>
          {referrerScs && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              🎉 You've been referred by a friend! You'll both earn rewards.
            </p>
          )}
        </div>

        <Card className="border-yellow-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Access Your Account</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Login or create a new account to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-yellow-100 dark:bg-gray-700">
                <TabsTrigger value="login" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white dark:data-[state=active]:bg-yellow-600">Login</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white dark:data-[state=active]:bg-yellow-600">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginScs" className="text-gray-900 dark:text-white">SCS Number</Label>
                    <Input id="loginScs" type="text" value={loginData.scsNumber} onChange={(e) => setLoginData({ ...loginData, scsNumber: e.target.value })} maxLength={7} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword" className="text-gray-900 dark:text-white">Password</Label>
                    <Input id="loginPassword" type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupScs" className="text-gray-900 dark:text-white">SCS Number</Label>
                    <Input id="signupScs" type="text" value={signupData.scsNumber} onChange={(e) => setSignupData({ ...signupData, scsNumber: e.target.value })} maxLength={7} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPhone" className="text-gray-900 dark:text-white">Phone Number</Label>
                    <Input id="signupPhone" type="tel" value={signupData.phoneNumber} onChange={(e) => setSignupData({ ...signupData, phoneNumber: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupClass" className="text-gray-900 dark:text-white">Class</Label>
                    <select
                      id="signupClass"
                      value={signupData.class}
                      onChange={(e) => setSignupData({ ...signupData, class: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2"
                      required
                    >
                      <option value="6">Class 6</option>
                      <option value="7">Class 7</option>
                      <option value="8">Class 8</option>
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-gray-900 dark:text-white">Password</Label>
                    <Input id="signupPassword" type="password" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
