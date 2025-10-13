import { IOrderRepository } from '../interfaces/IOrderRepository';
import { Order, OrderItem, OrderStatus } from '../../types/entities';

/**
 * Mock implementation of IOrderRepository
 * Uses in-memory data structure matching the JS backend
 */
export class MockOrderRepository implements IOrderRepository {
  private orders: Order[] = [];

  create(userId: string, items: OrderItem[]): Order {
    const orderId = `o${this.orders.length + 1}`;
    const newOrder: Order = {
      orderId,
      userId,
      items,
      status: 'pending',
      createdAt: new Date()
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  update(orderId: string, newItems: OrderItem[]): Order | null {
    const orderIndex = this.orders.findIndex(order => order.orderId === orderId);
    if (orderIndex === -1) {
      return null;
    }

    this.orders[orderIndex].items = newItems;
    this.orders[orderIndex].status = 'updated';
    return this.orders[orderIndex];
  }

  cancel(orderId: string): boolean {
    const initialLength = this.orders.length;
    this.orders = this.orders.filter(order => order.orderId !== orderId);
    return this.orders.length < initialLength;
  }

  getStatus(orderId: string): OrderStatus | null {
    const order = this.orders.find(order => order.orderId === orderId);
    return order ? { orderId: order.orderId, status: order.status } : null;
  }

  getAll(): Order[] {
    return this.orders;
  }
}
