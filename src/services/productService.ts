import { supabase } from '../integrations/supabase/client';
import type { Tables, TablesInsert } from '../integrations/supabase/types';

export type Product = Tables<'products'>;
export type ProductInsert = TablesInsert<'products'>;

/**
 * Get all products with optional category filter
 */
export const getProducts = async (category?: string) => {
  let query = supabase.from('products').select('*');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  return await query.order('name');
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id: string) => {
  return await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
};

/**
 * Create a new product
 */
export const createProduct = async (product: ProductInsert) => {
  return await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: string, updates: Partial<ProductInsert>) => {
  return await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: string) => {
  return await supabase
    .from('products')
    .delete()
    .eq('id', id);
};

/**
 * Get products by availability
 */
export const getAvailableProducts = async () => {
  return await supabase
    .from('products')
    .select('*')
    .eq('available', true)
    .order('name');
};
