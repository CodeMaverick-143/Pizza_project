
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pizza, ShoppingCart, Clock, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        navigate('/dashboard');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-orange-600/90"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center text-white">
            <div className="flex justify-center mb-6">
              <Pizza className="h-16 w-16 text-yellow-300 animate-bounce" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-300 to-orange-200 bg-clip-text text-transparent">
              Slice Heaven
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Authentic Italian Pizza, Delivered Fresh to Your Door
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <Button 
                  size="lg" 
                  className="bg-yellow-500 hover:bg-yellow-400 text-red-900 font-semibold px-8 py-4 text-lg"
                  onClick={() => navigate('/auth')}
                >
                  Order Now
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="bg-yellow-500 hover:bg-yellow-400 text-red-900 font-semibold px-8 py-4 text-lg"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              )}
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 text-lg"
              >
                View Menu
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">Why Choose Slice Heaven?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-gradient-to-b from-red-50 to-orange-50 border border-red-100">
              <Clock className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Fast Delivery</h3>
              <p className="text-gray-600">Hot, fresh pizza delivered in 30 minutes or less, guaranteed!</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-b from-orange-50 to-yellow-50 border border-orange-100">
              <Star className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Premium Quality</h3>
              <p className="text-gray-600">Made with the finest ingredients and traditional Italian recipes.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-b from-yellow-50 to-red-50 border border-yellow-100">
              <ShoppingCart className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Easy Ordering</h3>
              <p className="text-gray-600">Simple online ordering with real-time tracking and updates.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Order?</h2>
          <p className="text-xl mb-8 text-orange-100">Join thousands of satisfied customers!</p>
          {!user ? (
            <Button 
              size="lg" 
              className="bg-white text-red-600 hover:bg-orange-50 font-semibold px-8 py-4 text-lg"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="bg-white text-red-600 hover:bg-orange-50 font-semibold px-8 py-4 text-lg"
              onClick={() => navigate('/dashboard')}
            >
              View Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
