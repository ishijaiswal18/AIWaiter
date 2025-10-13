import { z } from 'zod';

/**
 * Zod validation schemas for request payloads
 * Provides runtime type validation for API requests
 */

// ============================================
// Menu Validation Schemas
// ============================================

export const searchMenuSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query cannot be empty'),
  }),
});

export const menuItemIdSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
  }),
});

export const categoryNameSchema = z.object({
  params: z.object({
    categoryName: z.string().min(1, 'Category name is required'),
  }),
});

export const foodTypeSchema = z.object({
  params: z.object({
    foodType: z.enum(['veg', 'non-veg'], {
      message: 'Food type must be either "veg" or "non-veg"',
    }),
  }),
});

// ============================================
// Order Validation Schemas
// ============================================

const orderItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const createOrderSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  }),
});

export const updateOrderSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
  }),
  body: z.object({
    items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  }),
});

export const orderIdSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
  }),
});

// ============================================
// User Validation Schemas
// ============================================

export const userIdSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
});

export const addFavoriteSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
  }),
});

export const removeFavoriteSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
    itemId: z.string().min(1, 'Item ID is required'),
  }),
});

export const callWaiterSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    message: z.string().optional(),
  }),
});
