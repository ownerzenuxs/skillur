
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PlanType {
  id: string;
  name: string;
  price: number;
  coins_per_month: number;
}

export function PremiumPlans() {
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe to a premium plan.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Coming Soon",
      description: "Payment integration will be available soon!",
    });
  };

  const planIcons = [Star, Crown, Zap];
  const planColors = ['border-blue-200', 'border-purple-200', 'border-yellow-200'];

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading plans...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Premium Plan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get monthly coins to unlock premium content and accelerate your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = planIcons[index] || Star;
            const borderColor = planColors[index] || 'border-blue-200';
            
            return (
              <Card key={plan.id} className={`relative overflow-hidden ${borderColor} border-2 hover:shadow-lg transition-all duration-300`}>
                {index === 1 && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={index === 1 ? "pt-12" : ""}>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                      index === 0 ? 'bg-blue-100 text-blue-600' :
                      index === 1 ? 'bg-purple-100 text-purple-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mt-2">
                      ₹{plan.price}
                      <span className="text-lg font-normal text-gray-600">/month</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-600">{plan.coins_per_month}</div>
                    <div className="text-gray-600">coins/month</div>
                  </div>
                  
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Monthly coin rewards</span>
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full mt-6 ${
                      index === 1 ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {profile?.is_premium ? 'Current Plan' : 'Subscribe Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
