import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import OrderCard from "./OrderCard";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Order } from "@/types/order";

interface OrderListProps {
  orders?: Order[];
  onRefresh?: () => void;
  onStatusChange?: (orderId: string, newStatus: string) => void;
  expandedOrderId?: string | null;
  onToggleExpand?: (orderId: string | null) => void;
}

const OrderList = ({
  orders = [],
  onRefresh = () => {},
  onStatusChange = () => {},
  expandedOrderId = null,
  onToggleExpand = () => {},
}: OrderListProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate real-time updates
  useEffect(() => {
    setLastUpdated(new Date());
  }, [orders]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();

    // Simulate refresh completion after 1 second
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  const toggleOrderExpansion = (orderId: string) => {
    onToggleExpand(expandedOrderId === orderId ? null : orderId);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    onStatusChange(orderId, newStatus);
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Нарачки</h2>
          <p className="text-sm text-muted-foreground">
            Последно ажурирање: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2 py-1">
            {orders.length} {orders.length === 1 ? "Нарачка" : "Нарачки"}
          </Badge>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw
              size={18}
              className={`text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                order_number={order.order_number}
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
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-medium mb-2">Нема нарачки</h3>
            <p className="text-muted-foreground">
              Новите нарачки ќе се појават овде во реално време кога ќе бидат
              примени.
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default OrderList;
