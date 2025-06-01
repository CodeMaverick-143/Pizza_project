import { supabase } from '../integrations/supabase/client';
import type { Tables, TablesInsert } from '../integrations/supabase/types';

export type Category = Tables<'categories'>;
export type CategoryInsert = TablesInsert<'categories'>;

/**
 * Get all categories ordered by display_order
 */
export const getCategories = async () => {
  return await supabase
    .from('categories')
    .select('*')
    .order('display_order');
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (id: string) => {
  return await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
};

/**
 * Get a single category by name
 */
export const getCategoryByName = async (name: string) => {
  return await supabase
    .from('categories')
    .select('*')
    .eq('name', name)
    .single();
};

/**
 * Create a new category
 */
export const createCategory = async (category: CategoryInsert) => {
  return await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
};

/**
 * Update an existing category
 */
export const updateCategory = async (id: string, updates: Partial<CategoryInsert>) => {
  return await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: string) => {
  return await supabase
    .from('categories')
    .delete()
    .eq('id', id);
};
