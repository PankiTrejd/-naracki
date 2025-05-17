export type OrderStatus = "New" | "Accepted" | "Done";

export interface Attachment {
  id: string;
  type: "image" | "document";
  url: string;
  name: string;
}

export interface Order {
  id?: string;
  order_number?: number;
  customerName: string;
  address: {
    street: string;
    city: string;
  };
  phoneNumber: string;
  totalPrice: number;
  notes?: string;
  timestamp: string;
  attachments?: Attachment[];
  status?: OrderStatus;
}
