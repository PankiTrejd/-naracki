import { supabase } from "./supabase";
import { Order, Attachment, OrderStatus } from "@/types/order";

// Add a new order
export const addOrder = async (
  order: Order,
  files: File[] = [],
): Promise<{ id: string; order_number: number; trackingCode?: string }> => {
  try {
    // 1. Add order to Supabase (without attachments/files)
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: order.customerName,
        street: order.address.street,
        city: order.address.city,
        phone_number: order.phoneNumber,
        total_price: order.totalPrice,
        notes: order.notes,
        timestamp: new Date().toISOString(),
        status: order.status || "New",
        tracking_code: order.trackingCode || null,
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    const realOrderId = orderData.id;
    const realOrderNumber = orderData.order_number;
    const realTrackingCode = orderData.tracking_code;

    // 2. Upload files to Supabase Storage using the real order id
    const attachmentsWithUrls = await Promise.all(
      files.map(async (file) => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const isImage = file.type.startsWith("image/");
        const type = isImage ? "image" : "document";

        // Upload to Supabase Storage
        const filePath = `attachments/${realOrderId}/${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("order-attachments")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("order-attachments")
          .getPublicUrl(filePath);

        return {
          id,
          type,
          url: urlData.publicUrl,
          name: file.name,
        };
      })
    );

    // 3. Add attachments if any
    if (attachmentsWithUrls.length > 0) {
      const { error: attachmentsError, data: attachmentsData } = await supabase
        .from("attachments")
        .insert(
          attachmentsWithUrls.map((attachment) => ({
            order_id: realOrderId,
            type: attachment.type,
            url: attachment.url,
            name: attachment.name,
          }))
        );
      console.log("Inserted attachments:", attachmentsData);
      if (attachmentsError) {
        throw attachmentsError;
      }
    }

    // 4. Return both the real order id, order_number, and trackingCode
    return { id: realOrderId, order_number: realOrderNumber, trackingCode: realTrackingCode };
  } catch (error) {
    console.error("Error adding order: ", error);
    throw error;
  }
};

// Get all orders
export const getOrders = async (status?: OrderStatus): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders_with_attachments')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    console.log("Fetched orders from Supabase:", data);

    // Transform data to match Order type
    let mapped = data.map((item) => {
      console.log('Raw order item:', item);
      return {
        id: item.id,
        order_number: item.order_number,
        customerName: item.customer_name,
        address: {
          street: item.street,
          city: item.city,
        },
        phoneNumber: item.phone_number,
        totalPrice: item.total_price,
        notes: item.notes,
        timestamp: item.timestamp,
        status: item.status as OrderStatus,
        attachments: Array.isArray(item.attachments)
          ? item.attachments
          : JSON.parse(item.attachments ?? '[]'),
        trackingCode: (typeof item.tracking_code === "string" && item.tracking_code.length > 0) ? item.tracking_code : undefined,
      };
    });

    // If status filter is provided, filter in JS
    if (status) {
      mapped = mapped.filter((order) => order.status === status);
    }

    console.log("Mapped orders:", mapped);
    return mapped;
  } catch (error) {
    console.error("Error getting orders: ", error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
): Promise<void> => {
  try {
    const { error, data } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .select();
    console.log("Order status update result:", data, error);
  } catch (error) {
    console.error("Error updating order status: ", error);
    throw error;
  }
};

// Subscribe to orders (real-time)
export const subscribeToOrders = (
  callback: (orders: Order[]) => void,
  status?: OrderStatus,
) => {
  // Initial fetch
  getOrders(status).then(callback).catch(console.error);

  // Set up real-time subscription
  const subscription = supabase
    .channel("orders-channel")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      async (payload) => {
        // Refetch all orders when any change happens
        try {
          const orders = await getOrders(status);
          callback(orders);
        } catch (error) {
          console.error("Error fetching updated orders:", error);
        }
      },
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

// Delete an order by ID
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting order: ", error);
    throw error;
  }
};
