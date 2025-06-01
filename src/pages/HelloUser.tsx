
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { User, MapPin, Mail, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  address: string | null;
  pincode: string | null;
  created_at: string;
}

const HelloUser = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white">
          <div className="flex items-center">
            <User className="h-16 w-16 text-yellow-300 mr-6" />
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Hello, {profile?.full_name || user?.email?.split('@')[0] || 'Pizza Lover'}! 👋
              </h1>
              <p className="text-xl text-orange-100">
                Welcome to your personalized dashboard
              </p>
            </div>
          </div>
        </div>

        {/* User Profile Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-red-600 mr-2" />
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Full Name:</span>
                <p className="text-gray-900">{profile?.full_name || 'Not provided'}</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-gray-900">{profile?.email || user?.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <span className="text-sm font-medium text-gray-600">Member Since:</span>
                  <p className="text-gray-900">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-red-600 mr-2" />
              <h2 className="text-xl font-semibold">Delivery Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Address:</span>
                <p className="text-gray-900">{profile?.address || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Pincode:</span>
                <p className="text-gray-900">{profile?.pincode || 'Not provided'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Account Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Favorite Pizzas</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <div className="text-sm text-gray-600">Loyalty Points</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HelloUser;
