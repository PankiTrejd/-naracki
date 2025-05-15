import { db, storage } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Order, Attachment, OrderStatus } from "@/types/order";

// Collection references
const ordersCollection = collection(db, "orders");

// Add a new order
export const addOrder = async (
  order: Order,
  files: File[] = [],
): Promise<string> => {
  try {
    // Upload files if any
    const attachmentsWithUrls = await Promise.all(
      files.map(async (file) => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const isImage = file.type.startsWith("image/");
        const type = isImage ? "image" : "document";

        // Upload to Firebase Storage
        const storageRef = ref(storage, `attachments/${order.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        return {
          id,
          type,
          url,
          name: file.name,
        };
      }),
    );

    // Add attachments to order if any were uploaded
    const orderWithAttachments = {
      ...order,
      attachments:
        attachmentsWithUrls.length > 0
          ? attachmentsWithUrls
          : order.attachments,
    };

    // Add to Firestore
    const docRef = await addDoc(ordersCollection, orderWithAttachments);
    return docRef.id;
  } catch (error) {
    console.error("Error adding order: ", error);
    throw error;
  }
};

// Get all orders
export const getOrders = async (status?: OrderStatus): Promise<Order[]> => {
  try {
    let q = ordersCollection;

    if (status) {
      q = query(
        ordersCollection,
        where("status", "==", status),
        orderBy("timestamp", "desc"),
      );
    } else {
      q = query(ordersCollection, orderBy("timestamp", "desc"));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Order[];
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
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status: newStatus,
    });
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
  let q = ordersCollection;

  if (status) {
    q = query(
      ordersCollection,
      where("status", "==", status),
      orderBy("timestamp", "desc"),
    );
  } else {
    q = query(ordersCollection, orderBy("timestamp", "desc"));
  }

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Order[];
    callback(orders);
  });
};
