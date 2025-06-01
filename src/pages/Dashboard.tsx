
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pizza, ShoppingCart, Clock, User, Star, Trophy, FireExtinguisher, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    favoriteCategory: 'Loading...',
    avgDeliveryTime: 'Loading...',
    loyaltyPoints: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        setLoading(true);
        // Get user data
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (!user) {
          navigate('/auth');
          return;
        }
        
        // Get profile data including loyalty points
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        setProfile(profileData);
        
        // Get order statistics
        const { data: orders } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id);
        
        // Calculate stats
        if (orders && orders.length > 0) {
          // Total orders
          const totalOrders = orders.length;
          
          // Determine favorite category
          const categoryCount: Record<string, number> = {};
          orders.forEach(order => {
            order.order_items?.forEach((item: any) => {
              if (item.products?.category) {
                const category = item.products.category;
                categoryCount[category] = (categoryCount[category] || 0) + 1;
              }
            });
          });
          
          // Find the category with the highest count
          let favoriteCategory = 'None yet';
          let maxCount = 0;
          
          for (const [category, count] of Object.entries(categoryCount)) {
            if (count > maxCount) {
              maxCount = count;
              favoriteCategory = category;
            }
          }
          
          // Format the category name for display
          if (favoriteCategory === 'veg') favoriteCategory = 'Vegetarian';
          else if (favoriteCategory === 'non-veg') favoriteCategory = 'Non-Vegetarian';
          else if (favoriteCategory === 'specialty') favoriteCategory = 'Specialty';
          else if (favoriteCategory === 'sides') favoriteCategory = 'Sides & Extras';
          
          // Average delivery time (for now, just a placeholder based on status)
          const avgDeliveryTime = '30 mins';
          
          // Loyalty points from profile
          const loyaltyPoints = profileData?.loyalty_points || 0;
          
          setOrderStats({
            totalOrders,
            favoriteCategory,
            avgDeliveryTime,
            loyaltyPoints
          });
        } else {
          setOrderStats({
            totalOrders: 0,
            favoriteCategory: 'Order your first pizza!',
            avgDeliveryTime: '30 mins',
            loyaltyPoints: profileData?.loyalty_points || 0
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndStats();
  }, [navigate]);

  const stats = [
    { 
      name: 'Total Orders', 
      value: loading ? <Skeleton className="h-8 w-16" /> : orderStats.totalOrders.toString(), 
      icon: ShoppingCart, 
      color: 'bg-red-500' 
    },
    { 
      name: 'Favorite Category', 
      value: loading ? <Skeleton className="h-8 w-24" /> : orderStats.favoriteCategory, 
      icon: Star, 
      color: 'bg-orange-500' 
    },
    { 
      name: 'Avg Delivery', 
      value: loading ? <Skeleton className="h-8 w-16" /> : orderStats.avgDeliveryTime, 
      icon: Clock, 
      color: 'bg-yellow-500' 
    },
    { 
      name: 'Loyalty Points', 
      value: loading ? <Skeleton className="h-8 w-16" /> : orderStats.loyaltyPoints.toString(), 
      icon: Trophy, 
      color: 'bg-green-500' 
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Hello, {profile?.full_name || user?.email?.split('@')[0] || 'Pizza Lover'}! 🍕
              </h1>
              <p className="text-xl text-orange-100">
                Ready to order your next delicious pizza?
              </p>
            </div>
            <div className="hidden md:block">
              <Pizza className="h-24 w-24 text-yellow-300 animate-pulse" />
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-400 text-red-900 font-semibold"
              onClick={() => navigate('/orders')}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              View My Orders
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-red-600"
              onClick={() => navigate('/menu')}
            >
              <Pizza className="h-5 w-5 mr-2" />
              Order Now
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} className="p-6 bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-20 bg-red-600 hover:bg-red-700 text-white flex-col"
              onClick={() => navigate('/orders')}
            >
              <ShoppingCart className="h-6 w-6 mb-2" />
              View Orders
            </Button>
            <Button 
              className="h-20 bg-orange-600 hover:bg-orange-700 text-white flex-col"
              onClick={() => navigate('/menu')}
            >
              <Pizza className="h-6 w-6 mb-2" />
              Order Pizza
            </Button>
            <Button className="h-20 bg-yellow-600 hover:bg-yellow-700 text-white flex-col">
              <User className="h-6 w-6 mb-2" />
              My Profile
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
