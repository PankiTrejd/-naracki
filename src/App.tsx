import { Suspense } from "react";
import {
  useRoutes,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Home from "./components/home";
import NewOrderForm from "./components/NewOrderForm";
import Navigation from "./components/Navigation";
import CompletedOrders from "./components/CompletedOrders";
import routes from "tempo-routes";
import { useState } from "react";
import { Order } from "./types/order";

function App() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [newOrderCount, setNewOrderCount] = useState<number>(0);

  const handleOrderSubmit = (newOrder: Order) => {
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    setNewOrderCount((prev) => prev + 1);
  };

  // Function to handle order status changes at the App level
  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    if (newStatus === "Done") {
      // Move to completed orders
      setOrders((prevOrders) => {
        const orderToMove = prevOrders.find((order) => order.id === orderId);
        const remainingOrders = prevOrders.filter(
          (order) => order.id !== orderId,
        );

        if (orderToMove) {
          const completedOrder = { ...orderToMove, status: "Done" };
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

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Navigation newOrderCount={newOrderCount} />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route
            path="/dashboard"
            element={
              <Home
                externalOrders={orders}
                onOrderStatusChange={handleOrderStatusChange}
              />
            }
          />
          <Route
            path="/new-order"
            element={<NewOrderForm onOrderSubmit={handleOrderSubmit} />}
          />
          <Route
            path="/completed"
            element={<CompletedOrders />}
          />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
