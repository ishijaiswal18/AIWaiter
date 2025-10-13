import { IUserRepository } from '../interfaces/IUserRepository';

/**
 * Mock implementation of IUserRepository
 * Uses in-memory data structure matching the JS backend
 */
export class MockUserRepository implements IUserRepository {
  private userFavorites: Record<string, string[]> = {};

  getFavorites(userId: string): string[] {
    return this.userFavorites[userId] || [];
  }

  addFavorite(userId: string, itemId: string): boolean {
    if (!this.userFavorites[userId]) {
      this.userFavorites[userId] = [];
    }
    
    if (!this.userFavorites[userId].includes(itemId)) {
      this.userFavorites[userId].push(itemId);
      return true;
    }
    
    return false; // Item already favorited
  }

  removeFavorite(userId: string, itemId: string): boolean {
    if (!this.userFavorites[userId]) {
      return false;
    }
    
    const initialLength = this.userFavorites[userId].length;
    this.userFavorites[userId] = this.userFavorites[userId].filter(id => id !== itemId);
    return this.userFavorites[userId].length < initialLength;
  }
}
