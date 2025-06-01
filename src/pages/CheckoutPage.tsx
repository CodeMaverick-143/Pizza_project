import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pizza, CreditCard, Truck, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createOrder } from '@/services/orderService';
import { getProfile, updateProfile } from '@/services/profileService';
import { toast } from '@/components/ui/use-toast';
import type { OrderInsert, OrderItemInsert } from '@/services/orderService';
import type { Profile } from '@/services/profileService';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, cartTotal, loyaltyPointsToEarn } = location.state || { cart: [], cartTotal: 0, loyaltyPointsToEarn: 0 };
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    // Redirect if cart is empty
    if (!cart || cart.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Your cart is empty. Please add items before checkout.',
        variant: 'destructive',
      });
      navigate('/menu');
      return;
    }

    // Get user profile
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          toast({
            title: 'Login required',
            description: 'Please login to place an order',
            variant: 'destructive',
          });
          navigate('/auth');
          return;
        }

        const { data: userProfile } = await getProfile(session.user.id);
        if (userProfile) {
          setProfile(userProfile);
          setAddress(userProfile.address || '');
          setPincode(userProfile.pincode || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [cart, navigate]);

  const placeOrder = async () => {
    // Validate user is logged in
    if (!profile) {
      toast({
        title: 'Login required',
        description: 'Please login to place an order',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    // Validate cart is not empty
    if (!cart || cart.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Your cart is empty. Please add items before checkout.',
        variant: 'destructive',
      });
      navigate('/menu');
      return;
    }

    // Validate delivery information
    if (!address || !pincode) {
      toast({
        title: 'Missing information',
        description: 'Please provide your delivery address and pincode',
        variant: 'destructive',
      });
      return;
    }

    // Validate pincode format (assuming 6-digit Indian pincode)
    if (!/^\d{6}$/.test(pincode)) {
      toast({
        title: 'Invalid pincode',
        description: 'Please enter a valid 6-digit pincode',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create order object
      const orderData: OrderInsert = {
        user_id: profile.id,
        status: 'pending',
        total_amount: cartTotal,
        shipping_address: `${address}, ${pincode}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create order items
      const orderItems: OrderItemInsert[] = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Save order to database
      const newOrder = await createOrder(orderData, orderItems);
      console.log('Order created successfully:', newOrder);

      // Update user profile with new address and add loyalty points
      const currentLoyaltyPoints = profile.loyalty_points || 0;
      await updateProfile(profile.id, {
        address,
        pincode,
        loyalty_points: currentLoyaltyPoints + loyaltyPointsToEarn,
      });

      toast({
        title: 'Order placed successfully!',
        description: `Your order #${newOrder.id.substring(0, 8)} has been placed. You earned ${loyaltyPointsToEarn} loyalty points!`,
      });

      // Navigate to order confirmation page
      navigate('/order-confirmation', { 
        state: { 
          orderId: newOrder.id,
          orderTotal: cartTotal,
          loyaltyPointsEarned: loyaltyPointsToEarn 
        } 
      });
    } catch (error) {
      console.error('Error placing order:', error);
      let errorMessage = 'There was an error placing your order. Please try again.';
      
      // Provide more specific error messages if possible
      if (error instanceof Error) {
        if (error.message.includes('Failed to create order items')) {
          errorMessage = 'There was an issue with your order items. Please try again or contact support.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      toast({
        title: 'Order failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-1">Complete your order</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={() => navigate('/menu')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Menu</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Pizza className="h-5 w-5 text-red-600" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x ₹{item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                
                <div className="flex justify-between pt-2 font-bold">
                  <p>Total Amount</p>
                  <p className="text-red-600">₹{cartTotal.toFixed(2)}</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="font-medium text-orange-800">
                    You will earn {loyaltyPointsToEarn} loyalty points with this order!
                  </p>
                  {profile?.loyalty_points ? (
                    <p className="text-sm text-orange-700 mt-1">
                      Current loyalty points: {profile.loyalty_points}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-red-600" />
                  <span>Delivery Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    type="text"
                    placeholder="Enter your pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  <span>Payment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <p className="text-gray-600">Subtotal</p>
                    <p>₹{cartTotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <p className="text-gray-600">Delivery Fee</p>
                    <p>₹0.00</p>
                  </div>
                  <div className="flex justify-between py-2 font-bold">
                    <p>Total</p>
                    <p className="text-red-600">₹{cartTotal.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={placeOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⚪</span>
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CheckoutPage;
