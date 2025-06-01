import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pizza, Plus, Minus, ShoppingCart, Leaf, Beef, Coffee, Utensils } from 'lucide-react';
import { getAvailableProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { createOrder } from '@/services/orderService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { Product } from '@/services/productService';
import type { Category } from '@/services/categoryService';
import type { OrderInsert, OrderItemInsert } from '@/services/orderService';
import { generateUUID } from '@/utils/uuidUtils';

type CartItem = {
  product: Product;
  quantity: number;
};

// Menu data
const vegPizzas = [
  {
    id: '2d6b6e7c-a5b4-4a3b-941f-12c3c7e9be03', // UUID format instead of 'veg-1'
    name: 'Margherita Classic',
    description: 'Tomato sauce, mozzarella & basil',
    price: 199,
    image_url: null,
    category: 'f1e2d3c4-b5a6-9876-5432-1fedcba98765', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5a8ae52f-cf7d-4c4e-8e2e-0bf4d81c3511', // UUID format instead of 'veg-2'
    name: 'Farmhouse Feast',
    description: 'Mushrooms, onions, capsicum, tomatoes',
    price: 249,
    image_url: null,
    category: 'f1e2d3c4-b5a6-9876-5432-1fedcba98765', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8b9fa70f-d2e3-4b43-a277-2e9e830ce36a', // UUID format instead of 'veg-3'
    name: 'Garden Green',
    description: 'Baby corn, olives, capsicum, paneer',
    price: 269,
    image_url: null,
    category: 'f1e2d3c4-b5a6-9876-5432-1fedcba98765', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'c3e1b95f-84d7-4c9c-9b3d-76f5e06f918a', // UUID format instead of 'veg-4'
    name: 'Spicy Paneer Tandoori',
    description: 'Tandoori paneer, onions, green chilies',
    price: 279,
    image_url: null,
    category: 'f1e2d3c4-b5a6-9876-5432-1fedcba98765', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'd47a95e2-5c8b-43f1-9d1a-fbc7a3e2c39f', // UUID format instead of 'veg-5'
    name: 'Cheese Burst',
    description: 'Extra cheese, triple mozzarella',
    price: 299,
    image_url: null,
    category: 'f1e2d3c4-b5a6-9876-5432-1fedcba98765', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'f6a21c7d-8e9b-4a1d-b2e6-7d5c8f1a9e32', // UUID format instead of 'veg-6'
    name: 'Veggie Overload',
    description: 'Mixed veg toppings with cheese burst',
    price: 289,
    image_url: null,
    category: 'f1e2d3c4-b5a6-9876-5432-1fedcba98765', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'a9b8c7d6-e5f4-4g3h-2i1j-0k9l8m7n6o5p', // UUID format instead of 'veg-7'
    name: 'Corn & Jalapeno',
    description: 'Golden corn with jalapenos & cheese',
    price: 249,
    image_url: null,
    category: 'f1e2d3c4-b5a6-9876-5432-1fedcba98765', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b2c1d0e9-f8g7-6h5i-4j3k-2l1m0n9o8p7q', // UUID format instead of 'veg-8'
    name: 'Four Cheese Fusion',
    description: 'Mozzarella, cheddar, gouda & parmesan',
    price: 319,
    image_url: null,
    category: 'f1e2d3c4-b5a6-9876-5432-1fedcba98765', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', // UUID format instead of 'veg-9'
    name: 'Desi Delight',
    description: 'Paneer tikka, mint chutney, red onions',
    price: 269,
    image_url: null,
    category: 'f1e2d3c4-b5a6-9876-5432-1fedcba98765', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '9o8n7m6l-5k4j-3i2h-1g0f-9e8d7c6b5a4', // UUID format instead of 'veg-10'
    name: 'Exotic Mushroom',
    description: 'Herbed mushrooms, olives, fresh herbs',
    price: 289,
    image_url: null,
    category: 'f1e2d3c4-b5a6-9876-5432-1fedcba98765', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const nonVegPizzas = [
  {
    id: '7d8e9f0a-1b2c-3d4e-5f6g-7h8i9j0k1l2m', // UUID format instead of 'non-veg-1'
    name: 'Chicken Tikka Supreme',
    description: 'Spicy tikka chicken, onions, peppers',
    price: 299,
    image_url: null,
    category: '0a1b2c3d-4e5f-6789-abcd-ef0123456789', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'e1f2g3h4-i5j6-k7l8-m9n0-o1p2q3r4s5t6', // UUID format instead of 'non-veg-2'
    name: 'Pepperoni Blaze',
    description: 'Classic pepperoni & mozzarella',
    price: 349,
    image_url: null,
    category: '0a1b2c3d-4e5f-6789-abcd-ef0123456789', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', // UUID format instead of 'non-veg-3'
    name: 'BBQ Chicken Smokehouse',
    description: 'BBQ chicken, red onions, smoked cheese',
    price: 329,
    image_url: null,
    category: '0a1b2c3d-4e5f-6789-abcd-ef0123456789', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6', // UUID format instead of 'non-veg-4'
    name: 'Chicken Keema Crunch',
    description: 'Chicken keema, capsicum, cheese',
    price: 309,
    image_url: null,
    category: '0a1b2c3d-4e5f-6789-abcd-ef0123456789', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5t6u7v8w-9x0y-1z2a-3b4c-5d6e7f8g9h0i', // UUID format instead of 'non-veg-5'
    name: 'Spicy Chicken Volcano',
    description: 'Hot chicken, jalapenos, red sauce',
    price: 319,
    image_url: null,
    category: '0a1b2c3d-4e5f-6789-abcd-ef0123456789', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'j1k2l3m4-n5o6-p7q8-r9s0-t1u2v3w4x5y6', // UUID format instead of 'non-veg-6'
    name: 'Sausage Overdrive',
    description: 'Chicken sausage, cheese blend',
    price: 289,
    image_url: null,
    category: '0a1b2c3d-4e5f-6789-abcd-ef0123456789', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4', // UUID format instead of 'non-veg-7'
    name: 'Peri-Peri Chicken',
    description: 'Peri-peri grilled chicken, cheese',
    price: 329,
    image_url: null,
    category: '0a1b2c3d-4e5f-6789-abcd-ef0123456789', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'j9k8l7m6-n5o4-p3q2-r1s0-t9u8v7w6x5y4', // UUID format instead of 'non-veg-8'
    name: 'Meat Lovers\' Delight',
    description: 'Chicken, pepperoni, sausage',
    price: 349,
    image_url: null,
    category: '0a1b2c3d-4e5f-6789-abcd-ef0123456789', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'd3e4f5g6-h7i8-j9k0-l1m2-n3o4p5q6r7s8', // UUID format instead of 'non-veg-9'
    name: 'Chicken & Cheese Burst',
    description: 'Chicken chunks, triple cheese',
    price: 299,
    image_url: null,
    category: '0a1b2c3d-4e5f-6789-abcd-ef0123456789', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 't9u8v7w6-x5y4-z3a2-b1c0-d9e8f7g6h5i4', // UUID format instead of 'non-veg-10'
    name: 'Mughlai Chicken Pizza',
    description: 'Mughlai gravy, roasted chicken, herbs',
    price: 339,
    image_url: null,
    category: '0a1b2c3d-4e5f-6789-abcd-ef0123456789', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const beverages = [
  {
    id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', // UUID format instead of 'bev-1'
    name: 'Coca-Cola',
    description: 'Refreshing cola beverage',
    price: 59,
    image_url: null,
    category: '9876fedc-ba98-7654-3210-fedcba987654', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'q7r8s9t0-u1v2-w3x4-y5z6-a7b8c9d0e1f2', // UUID format instead of 'bev-2'
    name: 'Pepsi',
    description: 'Classic Pepsi cola',
    price: 59,
    image_url: null,
    category: '9876fedc-ba98-7654-3210-fedcba987654', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'g3h4i5j6-k7l8-m9n0-o1p2-q3r4s5t6u7v8', // UUID format instead of 'bev-3'
    name: 'Lemon Iced Tea',
    description: 'Refreshing lemon-flavored iced tea',
    price: 69,
    image_url: null,
    category: '9876fedc-ba98-7654-3210-fedcba987654', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'w9x8y7z6-a5b4-c3d2-e1f0-g9h8i7j6k5l4', // UUID format instead of 'bev-4'
    name: 'Cold Coffee',
    description: 'Chilled coffee with a hint of sweetness',
    price: 79,
    image_url: null,
    category: '9876fedc-ba98-7654-3210-fedcba987654', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const combos = [
  {
    id: 'm1n2o3p4-q5r6-s7t8-u9v0-w1x2y3z4a5b6', // UUID format instead of 'combo-1'
    name: 'Veg Combo Delight',
    description: '1 Medium Veg Pizza + 1 Drink',
    price: 399,
    image_url: null,
    category: '13579bdf-2468-ace0-9876-54321fedcba9', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'c7d8e9f0-g1h2-i3j4-k5l6-m7n8o9p0q1r2', // UUID format instead of 'combo-2'
    name: 'Non-Veg Combo Blast',
    description: '1 Medium Non-Veg Pizza + 1 Drink',
    price: 449,
    image_url: null,
    category: '13579bdf-2468-ace0-9876-54321fedcba9', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 's3t4u5v6-w7x8-y9z0-a1b2-c3d4e5f6g7h8', // UUID format instead of 'combo-3'
    name: 'Couple\'s Combo',
    description: '2 Small Pizzas (Veg/Non-Veg) + 2 Beverages',
    price: 599,
    image_url: null,
    category: '13579bdf-2468-ace0-9876-54321fedcba9', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i9j8k7l6-m5n4-o3p2-q1r0-s9t8u7v6w5x4', // UUID format instead of 'combo-4'
    name: 'Family Feast',
    description: '2 Large Pizzas + 2 Garlic Breads + 4 Drinks',
    price: 1099,
    image_url: null,
    category: '13579bdf-2468-ace0-9876-54321fedcba9', // Updated to match UUID category ID
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Menu categories
const menuCategories = [
  {
    id: 'f1e2d3c4-b5a6-9876-5432-1fedcba98765', // UUID format instead of 'veg-pizzas'
    name: 'Veg Pizzas',
    description: 'Delicious vegetarian pizza options',
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '0a1b2c3d-4e5f-6789-abcd-ef0123456789', // UUID format instead of 'non-veg-pizzas'
    name: 'Non-Veg Pizzas',
    description: 'Mouth-watering non-vegetarian pizza options',
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '9876fedc-ba98-7654-3210-fedcba987654', // UUID format instead of 'beverages'
    name: 'Beverages',
    description: 'Refreshing drinks to complement your meal',
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '13579bdf-2468-ace0-9876-54321fedcba9', // UUID format instead of 'combos'
    name: 'Combos',
    description: 'Value meal combos for individuals, couples and families',
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Combine all products
const allProducts = [...vegPizzas, ...nonVegPizzas, ...beverages, ...combos];

// Make sure our static data types match exactly what's expected
const productsTyped: Product[] = allProducts as Product[];

const MenuPage = () => {
  const navigate = useNavigate();
  const [products] = useState<Product[]>(allProducts);
  const [categories] = useState<Category[]>(menuCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [loyaltyPointsToEarn, setLoyaltyPointsToEarn] = useState(0);

  // No need to fetch from the database since we're using static data
  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       // Fetch available products
  //       const { data: productsData, error: productsError } = await getAvailableProducts();
  //       if (productsError) throw productsError;
  //       setProducts(productsData || []);

  //       // Fetch categories
  //       const { data: categoriesData, error: categoriesError } = await getCategories();
  //       if (categoriesError) throw categoriesError;
  //       setCategories(categoriesData || []);
  //     } catch (error) {
  //       console.error('Error fetching menu data:', error);
  //       toast({
  //         title: 'Error',
  //         description: 'Failed to load menu items. Please try again.',
  //         variant: 'destructive',
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    // Calculate cart total and loyalty points to earn
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    setCartTotal(total);
    
    // Calculate loyalty points (5% of total amount rounded to nearest integer)
    setLoyaltyPointsToEarn(Math.round(total * 0.05));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item
        return [...prevCart, { product, quantity: 1 }];
      }
    });

    toast({
      title: 'Added to cart',
      description: `${product.name} added to your cart`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === productId);
      
      if (existingItem && existingItem.quantity > 1) {
        // Decrease quantity
        return prevCart.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        // Remove item completely
        return prevCart.filter(item => item.product.id !== productId);
      }
    });
  };

  const getQuantityInCart = (productId: string): number => {
    const item = cart.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setCart([]);
    setCartTotal(0);
    setLoyaltyPointsToEarn(0);
  };
  
  // Handle checkout process with improved error handling
  const checkout = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Your cart is empty. Please add items before checkout.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Check if user is authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!session?.user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to complete your order.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      // Show processing message to improve UX
      toast({
        title: 'Processing your order',
        description: 'Please wait while we confirm your delicious selection...',
      });
      
      // VERIFY TABLES EXIST BEFORE ATTEMPTING TO CREATE ORDER
      // This helps diagnose if the table names are correct
      try {
        // Check if orders table exists and is accessible
        const { error: ordersTableError } = await supabase
          .from('orders')
          .select('id')
          .limit(1);
          
        if (ordersTableError) {
          console.error('Error accessing orders table:', ordersTableError);
          throw new Error(`Cannot access orders table: ${ordersTableError.message}`);
        }
        
        // Check if order_items table exists and is accessible
        const { error: orderItemsTableError } = await supabase
          .from('order_items')
          .select('id')
          .limit(1);
          
        if (orderItemsTableError) {
          console.error('Error accessing order_items table:', orderItemsTableError);
          throw new Error(`Cannot access order_items table: ${orderItemsTableError.message}`);
        }
        
        console.log('Table verification successful - orders and order_items tables exist');
      } catch (tableCheckError) {
        console.error('Table verification failed:', tableCheckError);
        throw tableCheckError;
      }
      
      // Create a complete order record with all required fields
      const orderData: OrderInsert = {
        user_id: session.user.id,
        status: 'pending',
        total_amount: cartTotal,
        shipping_address: 'To be collected', // Ensure this is not null if your schema requires it
        payment_intent_id: `pi_${Date.now()}`, // Placeholder until real payment integration
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create complete order items with a temporary order_id to satisfy TypeScript
      // The actual order_id will be replaced by the createOrder service
      const orderItems: OrderItemInsert[] = cart.map(item => ({
        order_id: 'temp_id', // Temporary ID to satisfy TypeScript - will be replaced in service
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Debug log the complete data we're about to submit
      console.log('Submitting order with data:', JSON.stringify({
        orderData,
        orderItems: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      }, null, 2));
      
      // Submit order to database with enhanced error handling
      let newOrder;
      try {
        newOrder = await createOrder(orderData, orderItems);
        
        if (!newOrder || !newOrder.id) {
          throw new Error('Order creation failed - no order ID returned');
        }
        
        console.log('Order created successfully with ID:', newOrder.id);
      } catch (orderError: any) {
        console.error('Order creation failed:', orderError);
        
        // Specific handling for common Supabase errors
        if (orderError.message?.includes('404') || 
            orderError.message?.includes('relation') || 
            orderError.message?.includes('not found')) {
          throw new Error(`Table not found error (404): Please check if your Supabase tables are correctly named and accessible. Error: ${orderError.message}`);
        } else if (orderError.message?.includes('400') || 
                  orderError.message?.includes('Bad Request')) {
          throw new Error(`Bad request error (400): The order data format is incorrect. Error: ${orderError.message}`);
        } else {
          throw new Error(`Failed to create order: ${orderError.message || 'Unknown error'}`);
        }
      }
      
      // Order success - clear cart
      setCart([]);
      setCartTotal(0);
      setLoyaltyPointsToEarn(0);
      
      // Show success message
      toast({
        title: 'Order placed successfully!',
        description: `Your order #${newOrder.id.substring(0, 6)} is confirmed. You earned ${loyaltyPointsToEarn} loyalty points!`,
        variant: 'default',
      });
      
      // Navigate to confirmation page
      navigate('/order-confirmation', { 
        state: { 
          orderId: newOrder.id,
          orderTotal: cartTotal,
          orderItems: cart.length,
          loyaltyPointsEarned: loyaltyPointsToEarn
        } 
      });
    } catch (error: any) {
      // Enhanced error logging and user feedback
      console.error('Checkout error:', error);
      const errorMessage = error?.message || 'Unknown error';
      console.error('Error details:', errorMessage);
      
      // Provide more specific error messages based on the error type
      let userErrorMessage = 'We apologize for the inconvenience. Please try again or contact customer support.';
      
      if (errorMessage.includes('404') || 
          errorMessage.includes('Table not found') || 
          errorMessage.includes('relation') || 
          errorMessage.includes('Cannot access orders table')) {
        userErrorMessage = 'System configuration issue with order tables. Please contact support with error code: 404-TABLE.';
      } else if (errorMessage.includes('400') || 
                errorMessage.includes('Bad Request')) {
        userErrorMessage = 'Your order data could not be processed. Please try again with different items or contact support.';
      } else if (errorMessage.includes('network')) {
        userErrorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast({
        title: 'Checkout could not be completed',
        description: userErrorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on selected category and dietary preference
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Apply dietary filter - updated to use UUID category IDs
    if (dietaryFilter === 'veg') {
      filtered = filtered.filter(product => 
        product.category === 'f1e2d3c4-b5a6-9876-5432-1fedcba98765' || // veg-pizzas
        product.category === '9876fedc-ba98-7654-3210-fedcba987654' || // beverages
        product.category === '13579bdf-2468-ace0-9876-54321fedcba9'    // combos
      );
    } else if (dietaryFilter === 'non-veg') {
      filtered = filtered.filter(product => 
        product.category === '0a1b2c3d-4e5f-6789-abcd-ef0123456789' // non-veg-pizzas
      );
    }
    
    return filtered;
  }, [products, selectedCategory, dietaryFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Menu Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600">Slice Heaven – Menu</h1>
        </div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pizza Menu</h1>
            <p className="text-gray-600 mt-1">Choose from our delicious selection of pizzas</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            {cart.length > 0 && (
              <Button 
                variant="outline" 
                onClick={clearCart}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Clear Cart
              </Button>
            )}
            <Button 
              className="bg-red-600 hover:bg-red-700 flex items-center space-x-2"
              onClick={checkout}
              disabled={cart.length === 0}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Checkout</span>
              {cart.length > 0 && (
                <Badge className="ml-2 bg-white text-red-600">
                  ₹{cartTotal.toFixed(2)}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Loyalty Points Info */}
        {loyaltyPointsToEarn > 0 && (
          <Card className="bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-500 rounded-full p-2 text-white">
                  <Pizza className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">
                    You'll earn {loyaltyPointsToEarn} loyalty points with this order!
                  </p>
                  <p className="text-sm text-orange-700">
                    Loyalty points can be used for discounts on future orders.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className="flex items-center gap-2"
              onClick={() => {
                setSelectedCategory('all');
                setDietaryFilter('all');
              }}
            >
              <Pizza className="h-4 w-4" />
              All Menu
            </Button>
            
            <Button 
              variant={selectedCategory === 'f1e2d3c4-b5a6-9876-5432-1fedcba98765' ? 'default' : 'outline'}
              className="flex items-center gap-2 text-green-700 border-green-200"
              onClick={() => {
                setSelectedCategory('f1e2d3c4-b5a6-9876-5432-1fedcba98765'); // veg-pizzas UUID
                setDietaryFilter('veg');
              }}
            >
              <Leaf className="h-4 w-4 text-green-600" />
              Veg Pizzas
            </Button>
            
            <Button 
              variant={selectedCategory === '0a1b2c3d-4e5f-6789-abcd-ef0123456789' ? 'default' : 'outline'}
              className="flex items-center gap-2 text-red-700 border-red-200"
              onClick={() => {
                setSelectedCategory('0a1b2c3d-4e5f-6789-abcd-ef0123456789'); // non-veg-pizzas UUID
                setDietaryFilter('non-veg');
              }}
            >
              <Beef className="h-4 w-4 text-red-600" />
              Non-Veg Pizzas
            </Button>
            
            <Button 
              variant={selectedCategory === '9876fedc-ba98-7654-3210-fedcba987654' ? 'default' : 'outline'}
              className="flex items-center gap-2 text-blue-700 border-blue-200"
              onClick={() => {
                setSelectedCategory('9876fedc-ba98-7654-3210-fedcba987654'); // beverages UUID
                setDietaryFilter('all');
              }}
            >
              <Coffee className="h-4 w-4 text-blue-600" />
              Beverages
            </Button>
            
            <Button 
              variant={selectedCategory === '13579bdf-2468-ace0-9876-54321fedcba9' ? 'default' : 'outline'}
              className="flex items-center gap-2 text-orange-700 border-orange-200"
              onClick={() => {
                setSelectedCategory('13579bdf-2468-ace0-9876-54321fedcba9'); // combos UUID
                setDietaryFilter('all');
              }}
            >
              <Utensils className="h-4 w-4 text-orange-600" />
              Combos
            </Button>
          </div>
        </div>
        
        {/* Dietary Filter - Only show for pizzas */}
        {selectedCategory === 'all' || selectedCategory === 'f1e2d3c4-b5a6-9876-5432-1fedcba98765' || selectedCategory === '0a1b2c3d-4e5f-6789-abcd-ef0123456789' ? (
          <div className="mb-4">
            <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setDietaryFilter(value as 'all' | 'veg' | 'non-veg')}>
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="all" className="flex items-center justify-center">
                  <Pizza className="mr-2 h-4 w-4" />
                  All Pizzas
                </TabsTrigger>
                <TabsTrigger value="veg" className="flex items-center justify-center" onClick={() => setSelectedCategory('veg-pizzas')}>
                  <Leaf className="mr-2 h-4 w-4 text-green-600" />
                  Veg Pizzas
                </TabsTrigger>
                <TabsTrigger value="non-veg" className="flex items-center justify-center" onClick={() => setSelectedCategory('non-veg-pizzas')}>
                  <Beef className="mr-2 h-4 w-4 text-red-600" />
                  Non-Veg Pizzas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        ) : null}

        {/* Category info */}
        <div className="mb-6">
          {selectedCategory === 'veg-pizzas' && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h2 className="text-xl font-bold text-green-800 flex items-center">
                <Leaf className="mr-2 h-5 w-5" /> Veg Pizzas <span className="ml-2 text-sm font-normal">(10 Items)</span>
              </h2>
              <p className="text-green-700 mt-1">Delicious vegetarian options made with fresh ingredients</p>
            </div>
          )}
          {selectedCategory === 'non-veg-pizzas' && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h2 className="text-xl font-bold text-red-800 flex items-center">
                <Beef className="mr-2 h-5 w-5" /> Non-Veg Pizzas <span className="ml-2 text-sm font-normal">(10 Items)</span>
              </h2>
              <p className="text-red-700 mt-1">Premium non-vegetarian pizzas with quality meats</p>
            </div>
          )}
          {selectedCategory === 'beverages' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h2 className="text-xl font-bold text-blue-800 flex items-center">
                <Coffee className="mr-2 h-5 w-5" /> Beverages <span className="ml-2 text-sm font-normal">(4 Items)</span>
              </h2>
              <p className="text-blue-700 mt-1">Refreshing drinks to complement your meal</p>
            </div>
          )}
          {selectedCategory === 'combos' && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h2 className="text-xl font-bold text-orange-800 flex items-center">
                <Utensils className="mr-2 h-5 w-5" /> Value Combos <span className="ml-2 text-sm font-normal">(4 Items)</span>
              </h2>
              <p className="text-orange-700 mt-1">Special combo deals for great value</p>
            </div>
          )}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <Pizza className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No menu items available</h3>
            <p className="text-gray-500">
              {selectedCategory === 'all' 
                ? 'Unable to display menu items. Please try again.' 
                : `No items available in the "${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}" category.`}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const quantityInCart = getQuantityInCart(product.id);
              
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                      <Pizza className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span>{product.name}</span>
                        {product.category === 'veg-pizzas' && (
                          <Badge className="ml-2 bg-green-100 text-green-800 border border-green-200">
                            <Leaf className="h-3 w-3 mr-1" /> Veg Pizza
                          </Badge>
                        )}
                        {product.category === 'non-veg-pizzas' && (
                          <Badge className="ml-2 bg-red-100 text-red-800 border border-red-200">
                            <Beef className="h-3 w-3 mr-1" /> Non-Veg Pizza
                          </Badge>
                        )}
                        {product.category === 'beverages' && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800 border border-blue-200">
                            <Coffee className="h-3 w-3 mr-1" /> Beverage
                          </Badge>
                        )}
                        {product.category === 'combos' && (
                          <Badge className="ml-2 bg-orange-100 text-orange-800 border border-orange-200">
                            <Utensils className="h-3 w-3 mr-1" /> Combo
                          </Badge>
                        )}
                      </div>
                      <Badge className="bg-red-100 text-red-800 border border-red-200">
                        ₹{product.price.toFixed(2)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>
                  </CardContent>
                  
                  <CardFooter>
                    {quantityInCart > 0 ? (
                      <div className="flex items-center space-x-4 w-full">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => removeFromCart(product.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="font-medium">{quantityInCart}</span>
                        
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => addToCart(product)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        
                        <span className="ml-auto font-medium text-red-600">
                          ₹{(product.price * quantityInCart).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your Cart</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{item.quantity}x</span>
                    <span>{item.product.name}</span>
                  </div>
                  <span className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <div className="flex justify-between items-center mt-4 pt-2 border-t">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-red-600">₹{cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center mt-2 text-sm text-orange-600">
                <span>Loyalty points to earn:</span>
                <span>{loyaltyPointsToEarn} points</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={checkout}
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MenuPage;
