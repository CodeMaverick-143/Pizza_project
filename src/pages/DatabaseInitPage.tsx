import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeDatabase } from '@/utils/seedData';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';

const DatabaseInitPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleInitializeDatabase = async () => {
    try {
      setLoading(true);
      const result = await initializeDatabase();
      setResult(result);
      
      if (result.success) {
        toast({
          title: 'Database Initialized',
          description: `Successfully added ${result.categories?.length || 0} categories and ${result.products?.length || 0} products.`,
        });
      } else {
        toast({
          title: 'Initialization Failed',
          description: result.message || 'An error occurred while initializing the database.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      setResult({ success: false, message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Database Initialization</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Seed Pizza Menu Data</CardTitle>
              <CardDescription>
                This will populate your database with pizza categories and menu items. 
                Use this to initialize your Pizza Palace application with demo data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                  <AlertCircle className="inline-block mr-2 h-5 w-5" />
                  Warning: This action will upsert data in your database. Existing data with the same IDs will be updated.
                </p>
                
                <div className="space-y-2">
                  <h3 className="font-medium">This will initialize:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Pizza categories (Vegetarian, Non-Vegetarian, Specialty, Sides)</li>
                    <li>Pizza menu items with descriptions, prices, and images</li>
                    <li>All prices will be set in Indian Rupees (₹)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                onClick={handleInitializeDatabase} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing Database...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Initialize Pizza Database
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {result && (
            <Card className={result.success ? "border-green-200" : "border-red-200"}>
              <CardHeader className={result.success ? "bg-green-50" : "bg-red-50"}>
                <CardTitle className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  {result.success ? "Success" : "Error"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>{result.message}</p>
                
                {result.success && (
                  <div className="mt-4 space-y-2">
                    <p className="font-medium">Added data summary:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>{result.categories?.length || 0} pizza categories</li>
                      <li>{result.products?.length || 0} menu items</li>
                    </ul>
                    
                    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                      The database has been successfully initialized. You can now browse the menu, place orders, and earn loyalty points.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DatabaseInitPage;
