import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

/**
 * Seed categories data for the Pizza Palace application
 */
export const seedCategories = async () => {
  const categories = [
    {
      id: 'veg',
      name: 'Vegetarian',
      description: 'Delicious vegetarian pizzas',
      display_order: 1
    },
    {
      id: 'non-veg',
      name: 'Non-Vegetarian',
      description: 'Meat lover\'s paradise',
      display_order: 2
    },
    {
      id: 'specialty',
      name: 'Specialty',
      description: 'Our chef\'s special creations',
      display_order: 3
    },
    {
      id: 'sides',
      name: 'Sides & Extras',
      description: 'Perfect companions for your pizza',
      display_order: 4
    }
  ];

  // Insert categories
  const { data, error } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Error seeding categories:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

/**
 * Seed products data for the Pizza Palace application
 */
export const seedProducts = async () => {
  const products: TablesInsert<'products'>[] = [
    // Vegetarian pizzas
    {
      name: 'Margherita',
      description: 'Classic cheese pizza with tomato sauce and fresh basil',
      price: 299,
      image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'veg',
      available: true
    },
    {
      name: 'Garden Veggie Supreme',
      description: 'Loaded with bell peppers, onions, mushrooms, black olives, and corn',
      price: 399,
      image_url: 'https://images.unsplash.com/photo-1604917877934-07d8d248d396?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'veg',
      available: true
    },
    {
      name: 'Paneer Tikka',
      description: 'Indian cottage cheese with spicy tikka sauce and bell peppers',
      price: 449,
      image_url: 'https://images.unsplash.com/photo-1571066811602-716837d681de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'veg',
      available: true
    },
    {
      name: 'Spicy Corn & Jalapeño',
      description: 'Sweet corn kernels with jalapeños and mozzarella cheese',
      price: 349,
      image_url: 'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'veg',
      available: true
    },
    
    // Non-vegetarian pizzas
    {
      name: 'Chicken Supreme',
      description: 'Grilled chicken with bell peppers, onions, and olives',
      price: 499,
      image_url: 'https://images.unsplash.com/photo-1594007654729-407eedc4fe0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'non-veg',
      available: true
    },
    {
      name: 'Pepperoni Classic',
      description: 'Classic pepperoni slices with extra cheese',
      price: 449,
      image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'non-veg',
      available: true
    },
    {
      name: 'Tandoori Chicken',
      description: 'Spicy tandoori chicken with onions and capsicum',
      price: 549,
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'non-veg',
      available: true
    },
    {
      name: 'Keema & Onion',
      description: 'Spiced minced meat with onions and herbs',
      price: 599,
      image_url: 'https://images.unsplash.com/photo-1552539618-7eec9b4d1796?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'non-veg',
      available: true
    },
    
    // Specialty pizzas
    {
      name: 'Mumbai Special',
      description: 'Our signature pizza with a blend of Indian spices and toppings',
      price: 649,
      image_url: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'specialty',
      available: true
    },
    {
      name: 'Pizza Palace Supreme',
      description: 'The ultimate combination of our best toppings',
      price: 699,
      image_url: 'https://images.unsplash.com/photo-1593246049226-ded77bf90326?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'specialty',
      available: true
    },
    {
      name: 'Spicy Overload',
      description: 'For spice lovers: jalapeños, chili flakes, and spicy sauce',
      price: 599,
      image_url: 'https://images.unsplash.com/photo-1605478371310-a9f1e96b4ff4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'specialty',
      available: true
    },
    
    // Sides & Extras
    {
      name: 'Garlic Breadsticks',
      description: 'Freshly baked breadsticks with garlic butter',
      price: 149,
      image_url: 'https://images.unsplash.com/photo-1619531040121-7e8465eee1f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'sides',
      available: true
    },
    {
      name: 'Cheese Dip',
      description: 'Creamy cheese dip for your pizza or breadsticks',
      price: 99,
      image_url: 'https://images.unsplash.com/photo-1626200689118-a64a8a127444?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'sides',
      available: true
    },
    {
      name: 'Spicy Wings',
      description: '6 pieces of spicy chicken wings',
      price: 249,
      image_url: 'https://images.unsplash.com/photo-1625938149335-afd8eef3f5a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      category: 'sides',
      available: true
    }
  ];

  // Insert products
  const { data, error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'name' })
    .select();

  if (error) {
    console.error('Error seeding products:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

/**
 * Initialize the database with seed data
 * Run this function once to populate the database with initial data
 */
export const initializeDatabase = async () => {
  // Seed categories first
  const categoriesResult = await seedCategories();
  if (!categoriesResult.success) {
    return { success: false, message: 'Failed to seed categories' };
  }
  
  // Then seed products
  const productsResult = await seedProducts();
  if (!productsResult.success) {
    return { success: false, message: 'Failed to seed products' };
  }

  return { 
    success: true, 
    message: 'Database initialized successfully',
    categories: categoriesResult.data,
    products: productsResult.data
  };
};
