import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getOrders } from "@/lib/orderService";
import { Order } from "@/types/order";
import { format, isSameDay, isSameMonth, parseISO } from "date-fns";

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  // Today's stats
  const today = new Date();
  const todayOrders = orders.filter(order => isSameDay(parseISO(order.timestamp), today));
  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  // This month's stats
  const monthOrders = orders.filter(order => isSameMonth(parseISO(order.timestamp), today));
  const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const monthOrderCount = monthOrders.length;
  const avgOrder = monthOrderCount > 0 ? (monthRevenue / monthOrderCount) : 0;

  // Money spent this month (if you want to track this, adjust as needed)
  // For now, we'll just show 0 unless you have a field like order.spent
  const monthSpent = 0;

  // Orders per day for the current month
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const ordersPerDay = daysInMonth.map(day => {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const count = monthOrders.filter(order => {
      const orderDate = parseISO(order.timestamp);
      return orderDate.getDate() === day;
    }).length;
    return {
      date: format(date, "dd"),
      orders: count,
    };
  }).filter(d => parseInt(d.date) <= today.getDate());

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center text-lg">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Контролен</h2>
      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2">Денес</h3>
          <div className="flex justify-between text-2xl font-bold">
            <div>Нарачки: <span className="text-blue-600">{todayOrders.length}</span></div>
            <div>Приход: <span className="text-green-600">{todayRevenue.toLocaleString()} ден.</span></div>
          </div>
        </Card>
        <Card className="p-6 flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2">Овој месец</h3>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div>Вкупно нарачки: <span className="font-bold text-blue-600">{monthOrderCount}</span></div>
            <div>Вкупен приход: <span className="font-bold text-green-600">{monthRevenue.toLocaleString()} ден.</span></div>
            <div>Потрошено: <span className="font-bold text-red-600">{monthSpent.toLocaleString()} ден.</span></div>
            <div>Просечна нарачка: <span className="font-bold text-purple-600">{avgOrder.toLocaleString(undefined, { maximumFractionDigits: 2 })} ден.</span></div>
          </div>
        </Card>
      </div>
      {/* Line chart */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Нарачки по ден за месецот</h3>
        <Card className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersPerDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 