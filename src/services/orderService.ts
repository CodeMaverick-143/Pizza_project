import { supabase } from '../integrations/supabase/client';
import type { Tables, TablesInsert } from '../integrations/supabase/types';

export type Order = Tables<'orders'>;
export type OrderInsert = TablesInsert<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type OrderItemInsert = TablesInsert<'order_items'>;

/**
 * Get all orders for a user
 */
export const getUserOrders = async (userId: string) => {
  return await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

/**
 * Get a single order by ID with all its items
 */
export const getOrderWithItems = async (orderId: string) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError) {
    throw orderError;
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*, products(*)')
    .eq('order_id', orderId);

  if (itemsError) {
    throw itemsError;
  }

  return { order, items };
};

/**
 * Create a new order with items
 */
export const createOrder = async (order: OrderInsert, items: OrderItemInsert[]) => {
  try {
    // Validate input data
    if (!order.user_id) {
      throw new Error('Order must have a user_id');
    }
    
    if (!items || items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    // Log what we're about to send to Supabase for debugging
    console.log('Creating order with data:', JSON.stringify(order, null, 2));
    
    // Step 1: Create the order
    // IMPORTANT: Check if 'orders' is the correct table name in your Supabase project
    const { data: newOrder, error: orderError } = await supabase
      .from('orders') // Make sure this table exists with this exact name
      .insert([order]) // Supabase expects an array for inserts
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      // Log more details about the error
      console.error('Error details:', {
        code: orderError.code,
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint
      });
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    if (!newOrder) {
      throw new Error('Order was created but no data was returned');
    }

    console.log('Order created successfully:', newOrder);

    // Step 2: Add the order_id to each item
    const itemsWithOrderId = items.map(item => ({
      ...item,
      order_id: newOrder.id
    }));

    console.log('Creating order items:', JSON.stringify(itemsWithOrderId, null, 2));

    // Step 3: Insert all order items
    // IMPORTANT: Check if 'order_items' is the correct table name in your Supabase project
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items') // Make sure this table exists with this exact name
      .insert(itemsWithOrderId)
      .select();

    if (itemsError) {
      // If inserting items fails, delete the order (rollback)
      console.error('Error creating order items:', itemsError);
      console.error('Error details:', {
        code: itemsError.code,
        message: itemsError.message,
        details: itemsError.details,
        hint: itemsError.hint
      });
      
      console.log('Attempting to rollback order:', newOrder.id);
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', newOrder.id);
        
      if (deleteError) {
        console.error('Failed to rollback order after item insertion failed:', deleteError);
      } else {
        console.log('Order rollback successful');
      }
      
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    console.log('Order and items created successfully');
    return newOrder;
  } catch (error) {
    console.error('Unexpected error in createOrder:', error);
    throw error;
  }
};

/**
 * Update an order's status
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  return await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (status: string) => {
  return await supabase
    .from('orders')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
};
