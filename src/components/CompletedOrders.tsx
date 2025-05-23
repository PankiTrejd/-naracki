import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import OrderCard from "./OrderCard";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/order";
import { getOrders, subscribeToOrders, deleteOrder } from "@/lib/orderService";
import { X } from "lucide-react";

interface CompletedOrdersProps {
  orders?: Order[];
}

const CompletedOrders = ({
  orders: externalOrders = [],
}: CompletedOrdersProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Subscribe to completed orders from Supabase
  useEffect(() => {
    // Initial fetch of completed orders
    getOrders("Done")
      .then((fetchedOrders) => {
        setOrders(fetchedOrders);
        setLastUpdated(new Date());
      })
      .catch((error) =>
        console.error("Error fetching completed orders:", error),
      );

    const unsubscribe = subscribeToOrders((fetchedOrders) => {
      // Only get orders with status "Done"
      const completedOrders = fetchedOrders.filter(
        (order) => order.status === "Done",
      );
      setOrders(completedOrders);
      setLastUpdated(new Date());
    }, "Done");

    // Add any external orders that might be passed in
    if (externalOrders.length > 0) {
      setOrders((prev) => {
        const existingIds = new Set(prev.map((order) => order.id));
        const newOrders = externalOrders.filter(
          (order) => !existingIds.has(order.id),
        );
        return [...prev, ...newOrders];
      });
    }

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [externalOrders]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleDeleteOrder = async (orderId: string) => {
    alert("Clicked!");
    if (!window.confirm("Дали сте сигурни дека сакате да ја избришете оваа нарачка?")) return;
    try {
      console.log("Deleting order with ID:", orderId);
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Грешка при бришење на нарачката: " + (error?.message || error));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Готови Нарачки</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-2 py-1">
              {orders.length} {orders.length === 1 ? "Нарачка" : "Нарачки"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <ScrollArea className="flex-1 p-4">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id}>
                  <OrderCard
                    id={order.id}
                    customerName={order.customerName}
                    address={order.address}
                    phoneNumber={order.phoneNumber}
                    totalPrice={order.totalPrice}
                    notes={order.notes}
                    timestamp={order.timestamp}
                    attachments={order.attachments}
                    status={order.status}
                    isExpanded={expandedOrderId === order.id}
                    onToggleExpand={() => toggleOrderExpansion(order.id)}
                    trackingCode={order.trackingCode}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-medium mb-2">Нема готови нарачки</h3>
              <p className="text-muted-foreground">
                Завршените нарачки ќе се појават овде.
              </p>
            </div>
          )}
        </ScrollArea>
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Order Receiver Dashboard © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default CompletedOrders;
