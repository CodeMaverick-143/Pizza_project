import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '@/services/profileService';
import type { Profile } from '@/services/profileService';
import { Pizza, Gift, Trophy } from 'lucide-react';

const LoyaltyPointsCard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const { data: userProfile } = await getProfile(session.user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Calculate rewards tier based on points
  const getTier = (points: number | null) => {
    if (!points) return 'Bronze';
    if (points >= 1000) return 'Platinum';
    if (points >= 500) return 'Gold';
    if (points >= 200) return 'Silver';
    return 'Bronze';
  };

  // Get tier icon
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return <Trophy className="h-8 w-8 text-purple-500" />;
      case 'Gold':
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'Silver':
        return <Trophy className="h-8 w-8 text-gray-400" />;
      default:
        return <Trophy className="h-8 w-8 text-amber-700" />;
    }
  };

  // Calculate next tier threshold
  const getNextTierThreshold = (points: number | null) => {
    if (!points) return 200;
    if (points < 200) return 200;
    if (points < 500) return 500;
    if (points < 1000) return 1000;
    return null; // Already at highest tier
  };

  const points = profile?.loyalty_points || 0;
  const tier = getTier(points);
  const nextTier = getNextTierThreshold(points);

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Gift className="h-5 w-5 text-red-600" />
          <span>Loyalty Program</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-16 flex items-center justify-center">
            <span className="text-gray-500">Loading loyalty points...</span>
          </div>
        ) : !profile ? (
          <div className="h-16 flex items-center justify-center">
            <span className="text-gray-500">Login to view your loyalty points</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Pizza className="h-6 w-6 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{points}</p>
                  <p className="text-sm text-gray-600">Loyalty Points</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getTierIcon(tier)}
                <span className="font-bold text-lg">{tier} Tier</span>
              </div>
            </div>
            
            {nextTier && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress to {tier === 'Bronze' ? 'Silver' : tier === 'Silver' ? 'Gold' : 'Platinum'}</span>
                  <span>{points}/{nextTier}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (points / nextTier) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">
                  Earn {nextTier - points} more points to reach the next tier!
                </p>
              </div>
            )}
            
            <div className="text-sm text-gray-700 mt-2">
              <p>• Earn 5% of your order value as loyalty points</p>
              <p>• Points can be redeemed for discounts on future orders</p>
              <p>• Higher tiers earn bonus points on every order</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoyaltyPointsCard;
