import React, { useState, useEffect, useRef } from "react";
import { Bell, RefreshCw, PlusCircle, LayoutDashboard, CheckCircle, List } from "lucide-react";
import OrderList from "./OrderList";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Order as OrderType, OrderStatus } from "@/types/order";
import { getOrders, subscribeToOrders, updateOrderStatus } from "@/lib/orderService";
import { inpostaService } from '../services/inposta';
import { format } from 'date-fns';
import { mk } from 'date-fns/locale';

interface HomeProps {
  externalOrders?: OrderType[];
  onOrderStatusChange?: (orderId: string, newStatus: string) => void;
}

export default function Home({
  externalOrders = [],
  onOrderStatusChange = () => {},
}: HomeProps) {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [completedOrders, setCompletedOrders] = useState<OrderType[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    notificationSound.current = new Audio("/src/assets/notification.mp3");
  }, []);

  const [newOrderCount, setNewOrderCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch orders and handle external orders
  useEffect(() => {
    // Initial fetch of orders
    getOrders()
      .then((fetchedOrders) => {
        // Filter out orders that are "Done"
        const activeOrders = fetchedOrders.filter(
          (order) => order.status !== "Done",
        );
        setOrders(activeOrders);
      })
      .catch((error) => console.error("Error fetching orders:", error));

    // Handle external orders (from the form)
    if (externalOrders && externalOrders.length > 0) {
      setOrders((prevOrders) => {
        // Filter out any duplicates by ID
        const existingIds = new Set(prevOrders.map((order) => order.id));
        const newOrders = externalOrders.filter(
          (order) => !existingIds.has(order.id),
        );

        if (newOrders.length > 0) {
          setNewOrderCount((prev) => prev + newOrders.length);

          // Play notification sound
          if (notificationSound.current) {
            notificationSound.current.play().catch((error) => {
              console.error("Error playing notification sound:", error);
            });
          }

          // Show browser notification
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            newOrders.forEach((order) => {
              new Notification("Нова Нарачка", {
                body: `Нова нарачка од ${order.customerName}`,
                icon: "/vite.svg",
              });
            });
          }

          return [...newOrders, ...prevOrders];
        }

        return prevOrders;
      });
    }
  }, [externalOrders]);

  // Request notification permission on component mount
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Reset new order count
      setNewOrderCount(0);
      // Wait a moment to show the loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error refreshing orders:", error);
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Update in Firebase
      await updateOrderStatus(orderId, newStatus as OrderStatus);

      if (newStatus === "Accepted") {
        // Move accepted order to the top and expand it
        setOrders((prevOrders) => {
          const orderToUpdate = prevOrders.find(
            (order) => order.id === orderId,
          );
          const otherOrders = prevOrders.filter(
            (order) => order.id !== orderId,
          );

          if (orderToUpdate) {
            const updatedOrder = {
              ...orderToUpdate,
              status: newStatus as OrderStatus,
            };
            setExpandedOrderId(orderId); // Auto-expand the accepted order
            return [updatedOrder, ...otherOrders];
          }

          return prevOrders;
        });
      } else if (newStatus === "Done") {
        // Move to completed orders list
        setOrders((prevOrders) => {
          const orderToMove = prevOrders.find((order) => order.id === orderId);
          const remainingOrders = prevOrders.filter(
            (order) => order.id !== orderId,
          );

          if (orderToMove) {
            const completedOrder = {
              ...orderToMove,
              status: "Done" as OrderStatus,
            };
            setCompletedOrders((prev) => [completedOrder, ...prev]);
            onOrderStatusChange(orderId, newStatus);
          }

          return remainingOrders;
        });
      } else {
        // Handle other status changes
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: newStatus as OrderStatus }
              : order,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const testCreateShipment = async () => {
    try {
      const response = await inpostaService.createShipment({
        shipment_type: 'Пакети',
        shipment_type_value: '1',
        receiver: {
          name: 'Test Receiver',
          city: 'Скопје',
          phone_number: '+389 71 236 456',
          address: 'Test Address'
        },
        package_value: 100,
        number_packages: 1,
        shipping_payment_method: 'П-Г'
      });
      alert('Shipment created! Reference: ' + response.shipment.reference);
      console.log(response);
    } catch (err) {
      alert('Error creating shipment: ' + err);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Панки Трејд - Нарачки</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
            <div className="relative">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              {newOrderCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {newOrderCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        <OrderList
          orders={orders}
          onStatusChange={handleStatusChange}
          expandedOrderId={expandedOrderId}
          onToggleExpand={setExpandedOrderId}
        />
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Кристиан Костов Програмерчич © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
