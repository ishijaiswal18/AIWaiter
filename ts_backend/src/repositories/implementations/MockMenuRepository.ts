import { IMenuRepository } from '../interfaces/IMenuRepository';
import { MenuItem } from '../../types/entities';

/**
 * Mock implementation of IMenuRepository
 * Uses in-memory data structure matching the JS backend
 */
export class MockMenuRepository implements IMenuRepository {
  private menu: MenuItem[] = [
    { id: 'm1', name: 'Paneer Tikka', description: 'Grilled cottage cheese marinated in spices.', price: 10, category: 'Appetizer', type: 'veg', isSpecial: false },
    { id: 'm2', name: 'Chicken Wings', description: 'Spicy chicken wings cooked to perfection.', price: 12, category: 'Appetizer', type: 'non-veg', isSpecial: true },
    { id: 'm3', name: 'Butter Chicken', description: 'Creamy chicken curry with a rich tomato gravy.', price: 18, category: 'Main Course', type: 'non-veg', isSpecial: false },
    { id: 'm4', name: 'Palak Paneer', description: 'Cottage cheese in a creamy spinach gravy.', price: 16, category: 'Main Course', type: 'veg', isSpecial: true },
    { id: 'm5', name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables.', price: 14, category: 'Chinese', type: 'veg', isSpecial: false },
    { id: 'm6', name: 'Manchurian', description: 'Fried vegetable balls in a spicy sauce.', price: 15, category: 'Chinese', type: 'veg', isSpecial: false },
    { id: 'm7', name: 'Dal Makhani', description: 'Black lentils cooked in a creamy gravy.', price: 14, category: 'Indian', type: 'veg', isSpecial: false },
    { id: 'm8', name: 'Rogan Josh', description: 'Aromatic lamb curry.', price: 20, category: 'Indian', type: 'non-veg', isSpecial: false },
  ];

  getAll(): MenuItem[] {
    return this.menu;
  }

  getById(id: string): MenuItem | undefined {
    return this.menu.find(item => item.id === id);
  }

  getByCategory(category: string): MenuItem[] {
    return this.menu.filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    );
  }

  getByType(type: 'veg' | 'non-veg'): MenuItem[] {
    return this.menu.filter(item => 
      item.type.toLowerCase() === type.toLowerCase()
    );
  }

  search(query: string): MenuItem[] {
    const searchTerm = query.toLowerCase();
    return this.menu.filter(item => 
      item.name.toLowerCase().includes(searchTerm) || 
      item.description.toLowerCase().includes(searchTerm)
    );
  }

  getSpecials(): MenuItem[] {
    return this.menu.filter(item => item.isSpecial);
  }
}
