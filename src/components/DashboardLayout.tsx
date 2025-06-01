
import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pizza, User, ShoppingCart, LogOut, Home, History, Package, Settings, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Get initial user
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      } else {
        navigate('/auth');
      }
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check if user has admin privileges (for demo purposes, checking email)
  const isAdmin = profile?.email?.includes('admin') || false;
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' },
    { name: 'Menu', href: '/menu', icon: Pizza, current: location.pathname === '/menu' },
    { name: 'Current Orders', href: '/dashboard/pizza-orders', icon: ShoppingCart, current: location.pathname === '/dashboard/pizza-orders' },
    { name: 'Order History', href: '/orders', icon: History, current: location.pathname === '/orders' },
    { name: 'Profile', href: '/dashboard/hello-user', icon: User, current: location.pathname === '/dashboard/hello-user' },
    // Admin-only links
    ...(isAdmin ? [
      { name: 'Admin Dashboard', href: '/admin', icon: Settings, current: location.pathname === '/admin' },
      { name: 'All Orders', href: '/all-orders', icon: Users, current: location.pathname === '/all-orders' },
    ] : []),
  ];

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error signing out');
      } else {
        toast.success('Signed out successfully');
        navigate('/auth');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error signing out');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Pizza className="h-8 w-8 text-red-600 mr-2" />
                <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Slice Heaven
                </span>
              </div>
              <div className="ml-10 flex space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        item.current
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                      } px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {profile?.full_name || user?.email?.split('@')[0] || 'User'}!
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
