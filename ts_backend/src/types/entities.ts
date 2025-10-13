/**
 * Domain entities for the AIWaiter application
 */

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  type: 'veg' | 'non-veg';
  isSpecial: boolean;
}

export interface OrderItem {
  itemId: string;
  quantity: number;
}

export interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'updated' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface OrderStatus {
  orderId: string;
  status: Order['status'];
}

export interface UserFavorites {
  userId: string;
  itemIds: string[];
}
