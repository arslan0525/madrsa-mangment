-- Apna Madrasa Database Schema (Run this in Supabase SQL Editor)

-- 0. Users Table (For real authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  uid UUID PRIMARY KEY REFERENCES auth.users(id),
  madrasa_name TEXT,
  manager_name TEXT,
  address TEXT,
  phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Donations Table
CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  uid UUID REFERENCES auth.users(id),
  donor_name TEXT,
  phone TEXT,
  amount NUMERIC,
  donation_type TEXT,
  item_type TEXT,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  uid UUID REFERENCES auth.users(id),
  expense_type TEXT,
  amount NUMERIC,
  notes TEXT,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Kitchen Table
CREATE TABLE IF NOT EXISTS kitchen (
  id TEXT PRIMARY KEY,
  uid UUID REFERENCES auth.users(id),
  item_name TEXT,
  quantity TEXT,
  type TEXT,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Students Table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  uid UUID REFERENCES auth.users(id),
  name TEXT,
  monthlyFee NUMERIC,
  fees JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Donors Table (List of regular donors)
CREATE TABLE IF NOT EXISTS donors (
  id TEXT PRIMARY KEY,
  uid UUID REFERENCES auth.users(id),
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
-- To start simply, we can use a policy that allows everything if authenticated, 
-- but normally you'd restrict by uid.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Everyone can only see/edit their own data)
CREATE POLICY "Users can only see their own profile" ON profiles FOR ALL USING (auth.uid() = uid);
CREATE POLICY "Users can only see their own donations" ON donations FOR ALL USING (auth.uid() = uid);
CREATE POLICY "Users can only see their own expenses" ON expenses FOR ALL USING (auth.uid() = uid);
CREATE POLICY "Users can only see their own kitchen" ON kitchen FOR ALL USING (auth.uid() = uid);
CREATE POLICY "Users can only see their own students" ON students FOR ALL USING (auth.uid() = uid);
CREATE POLICY "Users can only see their own donors" ON donors FOR ALL USING (auth.uid() = uid);
