import axios from 'axios';
import { Order, Attachment, OrderStatus } from "@/types/order";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Cache for orders to reduce API calls
let ordersCache: Order[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

// Helper function to parse numerical fields
const parseOrderNumerics = (order: any) => ({
  ...order,
  total: parseFloat(order.total || '0'),
  discount: parseFloat(order.discount || '0'),
  shippingCost: parseFloat(order.shippingCost || '0'),
  price: parseFloat(order.price || '0'),
  // Ensure any other numerical fields are parsed here
});

// Helper function to check if cache is still valid
const isCacheValid = () => {
  return Date.now() - lastFetchTime < CACHE_DURATION;
};

// Clear cache when needed
export const clearOrdersCache = () => {
  ordersCache = [];
  lastFetchTime = 0;
};

// Add a new order
export const addOrder = async (
  order: Order,
  files: File[] = [],
): Promise<{ id: string; order_number: number; trackingCode?: string }> => {
  try {
    // Frontend will send the order data and file data (e.g., base64) to the backend
    const filesData = await Promise.all(files.map(async (file) => {
      const reader = new FileReader();
      const base64File = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
      return {
        name: file.name,
        type: file.type,
        data: base64File.split(',')[1], // Extract base64 part
      };
    }));

    const response = await axios.post(`${API_BASE_URL}/api/orders`, { order, files: filesData });
    
    // Clear cache after adding new order
    clearOrdersCache();
    
    return parseOrderNumerics(response.data);
  } catch (error: any) {
    console.error("Error adding order:", error.response?.data?.message || error.message || error);
    throw error;
  }
};

// Get all orders with caching
export const getOrders = async (status?: OrderStatus, forceRefresh = false): Promise<Order[]> => {
  try {
    // Return cached data if it's still valid and not forcing refresh
    if (!forceRefresh && isCacheValid() && ordersCache.length > 0) {
      if (status) {
        return ordersCache.filter(order => order.status === status);
      }
      return ordersCache;
    }

    const response = await axios.get(`${API_BASE_URL}/api/orders`, {
      params: { status },
    });
    
    const orders = response.data.orders.map(parseOrderNumerics);
    
    // Update cache
    ordersCache = orders;
    lastFetchTime = Date.now();
    
    return orders;
  } catch (error: any) {
    console.error("Error getting orders:", error.response?.data?.message || error.message || error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
): Promise<void> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      status: newStatus,
    });
    
    // Update cache with the new status
    ordersCache = ordersCache.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    return parseOrderNumerics(response.data);
  } catch (error: any) {
    console.error("Error updating order status:", error.response?.data?.message || error.message || error);
    throw error;
  }
};

// Delete an order by ID
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/orders/${orderId}`);
    
    // Remove from cache
    ordersCache = ordersCache.filter(order => order.id !== orderId);
  } catch (error: any) {
    console.error("Error deleting order:", error.response?.data?.message || error.message || error);
    throw error;
  }
};

// Real-time subscription placeholder (still not directly supported via HTTP API)
export const subscribeToOrders = (
  callback: (orders: Order[]) => void,
  status?: OrderStatus,
) => {
  console.warn("Real-time subscriptions are not implemented for PostgreSQL yet. Polling or WebSockets would be required.");
  // Initial fetch for demonstration
  getOrders(status).then(callback).catch(console.error);

  // No actual real-time subscription here
  return () => {
    // Cleanup function if any setup were done
  };
};
