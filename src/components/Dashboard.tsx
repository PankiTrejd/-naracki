import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getOrders } from "@/lib/orderService";
import { getExpenses, addExpense, deleteExpense } from "@/lib/expenseService";
import { Order } from "@/types/order";
import { Expense } from "@/types/expense";
import { format, isSameDay, isSameMonth, parseISO, isWithinInterval, subDays } from "date-fns";
import ExpensesSection from "./ExpensesSection";
import { addExpense as addExpenseLib } from "@/lib/expenseService";
import DateRangeSelector, { DateRange } from "./DateRangeSelector";
import GoalTracker from "./GoalTracker";
import { Users, TrendingUp, TrendingDown, Percent } from "lucide-react";

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 6), // Default to last 7 days (today + 6 previous days)
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

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
      // Optionally, show a toast or alert to the user
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

  // Debugging logs for expenses
  console.log("Dashboard - filteredExpenses:", filteredExpenses);
  filteredExpenses.forEach((expense, index) => {
    console.log(`Dashboard - Expense ${index} amount:`, expense.amount, `Type:`, typeof expense.amount);
  });

  // Stats calculations
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  console.log("Dashboard - totalExpenses before toLocaleString:", totalExpenses, `Type:`, typeof totalExpenses);
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
    <div className="container mx-auto px-2 py-4 w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
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
        <ExpensesSection expenses={filteredExpenses} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} compact />
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