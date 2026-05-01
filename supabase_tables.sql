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
  uid TEXT PRIMARY KEY,
  madrasa_name TEXT,
  manager_name TEXT
);

-- 1.5 Madrasa Settings (Linked to uid)
CREATE TABLE IF NOT EXISTS madrasa (
  uid TEXT PRIMARY KEY,
  madrasa_name TEXT,
  manager_name TEXT,
  address TEXT,
  phone TEXT
);

-- 2. Donations Table
CREATE TABLE donations (
  id TEXT PRIMARY KEY,
  uid TEXT,
  donor_name TEXT,
  phone TEXT,
  amount NUMERIC,
  donation_type TEXT,
  item_type TEXT,
  date TEXT
);

-- 3. Expenses Table
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  uid TEXT,
  expense_type TEXT,
  amount NUMERIC,
  notes TEXT,
  date TEXT
);

-- 4. Kitchen Table
CREATE TABLE kitchen (
  id TEXT PRIMARY KEY,
  uid TEXT,
  item_name TEXT,
  quantity TEXT,
  type TEXT,
  date TEXT
);

-- 5. Students Table
CREATE TABLE students (
  uid TEXT PRIMARY KEY,
  count NUMERIC
);

-- Disable Row Level Security (RLS) for testing purposes
-- Warning: In a real production environment, you should enable RLS and write policies.
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE madrasa DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
