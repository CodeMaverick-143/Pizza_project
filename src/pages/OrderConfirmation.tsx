import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pizza, Clock, CreditCard, Check, Home, Receipt } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface OrderConfirmationState {
  orderId: string;
  orderTotal: number;
  orderItems: number;
  loyaltyPointsEarned: number;
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderConfirmationState | null>(null);
  const [orderTime, setOrderTime] = useState<string>('');

  useEffect(() => {
    // Format the current time for the order timestamp
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const formattedDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setOrderTime(`${formattedTime}, ${formattedDate}`);

    // Get order details from navigation state
    const state = location.state as OrderConfirmationState;
    if (state && state.orderId) {
      setOrderDetails(state);
    } else {
      toast({
        title: 'Order information missing',
        description: 'We could not find your order details.',
        variant: 'destructive',
      });
      // Redirect to menu if no order details found
      setTimeout(() => navigate('/menu'), 3000);
    }
  }, [location.state, navigate]);

  // Estimate delivery time (30-45 minutes from now)
  const getEstimatedDeliveryTime = () => {
    const now = new Date();
    const minDelivery = new Date(now.getTime() + 30 * 60000);
    const maxDelivery = new Date(now.getTime() + 45 * 60000);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };
    
    return `${formatTime(minDelivery)} - ${formatTime(maxDelivery)}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        {orderDetails ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-green-700 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600">Thank you for your order.</p>
            </div>

            <Card className="mb-6 border-green-200 shadow-md">
              <CardHeader className="bg-green-50 border-b border-green-100">
                <CardTitle className="flex items-center text-green-800">
                  <Receipt className="mr-2 h-5 w-5" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  Order #{orderDetails.orderId.substring(0, 6)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <Pizza className="mr-2 h-5 w-5 text-red-500" />
                      <span>Total Items</span>
                    </div>
                    <span className="font-semibold">{orderDetails.orderItems}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
                      <span>Order Total</span>
                    </div>
                    <span className="font-semibold">₹{orderDetails.orderTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-orange-500" />
                      <span>Order Time</span>
                    </div>
                    <span className="font-semibold">{orderTime}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2">
                    <div className="flex items-center">
                      <Home className="mr-2 h-5 w-5 text-purple-500" />
                      <span>Estimated Delivery</span>
                    </div>
                    <span className="font-semibold">{getEstimatedDeliveryTime()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-green-50 flex flex-col items-start">
                <div className="bg-yellow-50 p-3 rounded-md w-full mb-3 border border-yellow-100">
                  <p className="text-yellow-800 flex items-center text-sm">
                    <span className="font-semibold mr-1">🎁</span>
                    You earned {orderDetails.loyaltyPointsEarned} loyalty points with this order!
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  A confirmation email has been sent to your registered email address.
                </p>
              </CardFooter>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate('/menu')}
              >
                <Pizza className="h-4 w-4" />
                Order More
              </Button>
              
              <Button
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                onClick={() => navigate('/order-history')}
              >
                <Receipt className="h-4 w-4" />
                View Order History
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin mb-4 h-8 w-8 text-red-600 mx-auto">
              <Pizza />
            </div>
            <p>Loading order details...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrderConfirmation;
