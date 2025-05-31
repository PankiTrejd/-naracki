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
import { Users, TrendingUp, TrendingDown, Percent } from "lucide-react";

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
    return <div className="container mx-auto px-2 py-8 text-center text-lg">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-2 py-4 w-full max-w-xl">
      <h2 className="text-3xl font-bold text-center mb-2">Контролен</h2>
      <div className="mb-2">
        <DateRangeSelector onRangeChange={handleDateRangeChange} />
      </div>
      {/* Compact stats card */}
      <Card className="mb-3 p-3 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="flex justify-center items-center gap-1 text-muted-foreground text-xs mb-1"><Users className="h-4 w-4" />Нарачки</div>
            <div className="text-xl font-bold text-blue-600">{orderCount}</div>
          </div>
          <div>
            <div className="flex justify-center items-center gap-1 text-muted-foreground text-xs mb-1"><TrendingUp className="h-4 w-4" />Приход</div>
            <div className="text-xl font-bold text-green-600">{totalRevenue.toLocaleString()} ден.</div>
          </div>
          <div>
            <div className="flex justify-center items-center gap-1 text-muted-foreground text-xs mb-1"><TrendingDown className="h-4 w-4" />Потрошено</div>
            <div className="text-xl font-bold text-red-600">{totalExpenses.toLocaleString()} ден.</div>
          </div>
          <div>
            <div className="flex justify-center items-center gap-1 text-muted-foreground text-xs mb-1"><Percent className="h-4 w-4" />Просечна</div>
            <div className="text-xl font-bold text-purple-600">{avgOrder.toLocaleString(undefined, { maximumFractionDigits: 2 })} ден.</div>
          </div>
        </div>
      </Card>
      {/* Expenses Section */}
      <div className="mb-3">
        <ExpensesSection expenses={filteredExpenses} onAddExpense={handleAddExpense} compact />
      </div>
      <hr className="my-3 border-muted-foreground/20" />
      {/* Line chart */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold mb-2 text-center">Нарачки по ден</h3>
        <Card className="p-2">
          <ResponsiveContainer width="100%" height={220}>
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
      <hr className="my-3 border-muted-foreground/20" />
      <GoalTracker />
    </div>
  );
};

export default Dashboard; 