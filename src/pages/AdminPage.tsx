import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Database, CheckCircle2, ChefHat, Users, Settings, ShoppingBag, Layout } from 'lucide-react';

const AdminPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAndFetchStats = async () => {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          toast({
            title: 'Login required',
            description: 'Please login to access admin dashboard',
          });
          navigate('/auth');
          return;
        }

        // For demo purposes - check if user email contains 'admin'
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const userIsAdmin = profile?.email?.includes('admin') || false;
        setIsAdmin(userIsAdmin);

        if (!userIsAdmin) {
          toast({
            title: 'Access denied',
            description: 'You do not have admin privileges',
            variant: 'destructive',
          });
          navigate('/dashboard');
          return;
        }

        // Fetch order statistics
        const { data: totalOrders } = await supabase
          .from('orders')
          .select('id', { count: 'exact' });

        const { data: pendingOrders } = await supabase
          .from('orders')
          .select('id', { count: 'exact' })
          .eq('status', 'pending');

        const { data: preparingOrders } = await supabase
          .from('orders')
          .select('id', { count: 'exact' })
          .eq('status', 'preparing');

        const { data: deliveredOrders } = await supabase
          .from('orders')
          .select('id', { count: 'exact' })
          .eq('status', 'delivered');

        setOrderStats({
          total: totalOrders?.length || 0,
          pending: pendingOrders?.length || 0,
          preparing: preparingOrders?.length || 0,
          delivered: deliveredOrders?.length || 0
        });

      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          title: 'Error',
          description: 'Failed to load admin dashboard',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mr-2" />
          <span className="text-lg">Loading admin dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return null; // Already redirected in useEffect
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        
        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-2xl font-bold text-orange-700">{orderStats.total}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-2xl font-bold text-yellow-700">{orderStats.pending}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Preparing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ChefHat className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-blue-700">{orderStats.preparing}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-green-700">{orderStats.delivered}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Initialize or reset the database with pizza menu items and categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                Use the Database Initialization page to seed your database with pizza categories and menu items. 
                All prices are set in Indian Rupees (₹) and products are organized by category.              
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => navigate('/database-init')}
              >
                <Database className="mr-2 h-4 w-4" />
                Database Initialization
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>
                View and manage all orders in the system regardless of customer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                The All Orders page allows you to view orders from all customers, update order status, 
                filter by status, and search by customer name or order ID.              
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/all-orders')}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage All Orders
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
