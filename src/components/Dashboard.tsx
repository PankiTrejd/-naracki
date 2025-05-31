import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getOrders } from "@/lib/orderService";
import { getExpenses } from "@/lib/expenseService";
import { Order } from "@/types/order";
import { Expense } from "@/types/expense";
import { format, isSameDay, isSameMonth, parseISO, isWithinInterval } from "date-fns";
import ExpensesSection from "./ExpensesSection";
import { addExpense } from "@/lib/expenseService";
import DateRangeSelector, { DateRange } from "./DateRangeSelector";
import GoalTracker from "./GoalTracker";

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, expensesData] = await Promise.all([
          getOrders(),
          getExpenses(),
        ]);
        setOrders(ordersData);
        setExpenses(expensesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddExpense = async (expense: Omit<Expense, "id" | "timestamp">) => {
    try {
      const newExpense = await addExpense(expense);
      setExpenses((prev) => [newExpense, ...prev]);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  // Filter data based on date range
  const filteredOrders = orders.filter(order => {
    const orderDate = parseISO(order.timestamp);
    return isWithinInterval(orderDate, { start: dateRange.from, end: dateRange.to });
  });

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = parseISO(expense.timestamp);
    return isWithinInterval(expenseDate, { start: dateRange.from, end: dateRange.to });
  });

  // Stats calculations
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.cost, 0);
  const orderCount = filteredOrders.length;
  const avgOrder = orderCount > 0 ? (totalRevenue / orderCount) : 0;

  // Orders per day for the selected range
  const daysInRange = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const ordersPerDay = Array.from({ length: daysInRange }, (_, i) => {
    const date = new Date(dateRange.from);
    date.setDate(date.getDate() + i);
    const count = filteredOrders.filter(order => {
      const orderDate = parseISO(order.timestamp);
      return isSameDay(orderDate, date);
    }).length;
    return {
      date: format(date, "dd"),
      orders: count,
    };
  });

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center text-lg">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Контролен</h2>
        <DateRangeSelector onRangeChange={handleDateRangeChange} />
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2">Избрани датуми</h3>
          <div className="flex justify-between text-2xl font-bold">
            <div>Нарачки: <span className="text-blue-600">{orderCount}</span></div>
            <div>Приход: <span className="text-green-600">{totalRevenue.toLocaleString()} ден.</span></div>
          </div>
        </Card>
        <Card className="p-6 flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2">Детали</h3>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div>Вкупно нарачки: <span className="font-bold text-blue-600">{orderCount}</span></div>
            <div>Вкупен приход: <span className="font-bold text-green-600">{totalRevenue.toLocaleString()} ден.</span></div>
            <div>Потрошено: <span className="font-bold text-red-600">{totalExpenses.toLocaleString()} ден.</span></div>
            <div>Просечна нарачка: <span className="font-bold text-purple-600">{avgOrder.toLocaleString(undefined, { maximumFractionDigits: 2 })} ден.</span></div>
          </div>
        </Card>
      </div>

      {/* Expenses Section */}
      <div className="mb-6">
        <ExpensesSection expenses={filteredExpenses} onAddExpense={handleAddExpense} />
      </div>

      {/* Line chart */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Нарачки по ден</h3>
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
      <GoalTracker />
    </div>
  );
};

export default Dashboard; 