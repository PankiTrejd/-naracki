import { Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Home from "./components/home";
import NewOrderForm from "./components/NewOrderForm";
import Navigation from "./components/Navigation";
import CompletedOrders from "./components/CompletedOrders";
import { useState } from "react";
import { Order, OrderStatus } from "./types/order";
import Dashboard from "./components/Dashboard";
import { getOrders } from "./lib/orderService";

function App() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [newOrderCount, setNewOrderCount] = useState<number>(0);

  // Add this function to refresh orders
  const handleOrderRefresh = async () => {
    const fetchedOrders = await getOrders();
    setOrders(fetchedOrders.filter(order => order.status !== "Done"));
  };

  // Function to handle order status changes at the App level
  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === "Done") {
      // Move to completed orders
      setOrders((prevOrders) => {
        const orderToMove = prevOrders.find((order) => order.id === orderId);
        const remainingOrders = prevOrders.filter(
          (order) => order.id !== orderId,
        );

        if (orderToMove) {
          const completedOrder = { ...orderToMove, status: "Done" as OrderStatus };
          setCompletedOrders((prev) => [completedOrder, ...prev]);
        }

        return remainingOrders;
      });
    }
  };

  // Reset new order count when navigating to dashboard
  const handleResetNewOrderCount = () => {
    setNewOrderCount(0);
  };

  // Function to handle navigation to ensure Navigation component is always visible
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleOrderSubmit = (newOrder: Order) => {
    // Optionally, you can refresh orders here or just rely on handleOrderRefresh
    handleOrderRefresh();
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Navigation newOrderCount={newOrderCount} />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="/orders"
            element={
              <Home
                externalOrders={orders}
                onOrderStatusChange={handleOrderStatusChange}
              />
            }
          />
          <Route
            path="/new-order"
            element={<NewOrderForm onOrderSubmit={handleOrderSubmit} onOrderRefresh={handleOrderRefresh} />}
          />
          <Route
            path="/completed"
            element={<CompletedOrders />}
          />
        </Routes>
      </>
    </Suspense>
  );
}

export default App;
