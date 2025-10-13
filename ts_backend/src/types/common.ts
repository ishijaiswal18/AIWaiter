/**
 * Common types used across the application
 */

/**
 * Standard API/Service response structure
 * Used consistently across all layers (services, controllers, etc.)
 */
export interface AppResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
}
