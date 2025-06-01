import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pizza, Clock, CheckCircle, Truck, Package, Ban, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getUserOrders, getOrderWithItems } from '@/services/orderService';
import { toast } from '@/components/ui/use-toast';
import type { Order, OrderItem } from '@/services/orderService';

interface OrderWithItems extends Order {
  items?: (OrderItem & { products: any })[];
  productNames?: string[];
}

const PizzaOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Get the current logged in user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          // Not logged in
          toast({
            title: 'Login required',
            description: 'Please login to view your orders',
          });
          navigate('/auth');
          return;
        }

        const userId = session.user.id;
        
        // Get recent orders (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .gt('created_at', thirtyDaysAgo.toISOString())
          .neq('status', 'delivered')
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false });

        if (!data || data.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // Fetch items for each order
        const ordersWithItems = await Promise.all(data.map(async (order) => {
          try {
            const { items } = await getOrderWithItems(order.id);
            const productNames = items.map(item => item.products.name);
            return { ...order, items, productNames };
          } catch (error) {
            console.error(`Error fetching items for order ${order.id}:`, error);
            return { ...order, items: [], productNames: [] };
          }
        }));

        setOrders(ordersWithItems);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your orders. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Set up a real-time subscription for order updates
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        // When an order is updated, refresh the orders
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'preparing':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Package className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
        return <Ban className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'preparing':
        return 'Preparing';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'pending':
        return 'Order Received';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Estimated delivery times based on status
  const getEstimatedDelivery = (status: string) => {
    switch (status) {
      case 'pending':
        return '45-60 mins';
      case 'preparing':
        return '25-30 mins';
      case 'out_for_delivery':
        return '10-15 mins';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white">
          <div className="flex items-center">
            <Pizza className="h-16 w-16 text-yellow-300 mr-6" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Pizza Orders 🍕</h1>
              <p className="text-xl text-orange-100">
                Track your delicious pizza orders
              </p>
            </div>
          </div>
        </div>

        {/* New Order Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => navigate('/menu')}
          >
            <Pizza className="h-4 w-4 mr-2" />
            Order New Pizza
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <Loader2 className="h-16 w-16 text-red-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading your orders...</h3>
              <p className="text-gray-500">Please wait while we fetch your active orders</p>
            </Card>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-lg">Order #{order.id.substring(0, 8)}</span>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </div>
                    </div>
                    
                    <div className="text-gray-600 mb-2">
                      <strong>Items:</strong> {order.productNames?.join(', ') || 'No items found'}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Ordered: {new Date(order.created_at).toLocaleString()}</span>
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          ETA: {getEstimatedDelivery(order.status)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600 mb-2">
                      ₹{order.total_amount.toFixed(2)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/orders?id=${order.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <Pizza className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No active orders</h3>
              <p className="text-gray-500 mb-4">You don't have any active orders. Start by ordering a delicious pizza!</p>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => navigate('/menu')}
              >
                Order Your Pizza Now
              </Button>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PizzaOrders;
