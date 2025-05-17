-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'New'
);

-- Create attachments table with reference to orders
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL
);

-- Enable realtime for both tables
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table attachments;
