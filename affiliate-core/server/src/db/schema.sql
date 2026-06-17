-- 1. Create Users Table
create table if not exists app_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  password text not null,
  role text default 'user',
  subscription_status text default 'inactive',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Sessions Table
create table if not exists active_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references app_users(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Transactions Table
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references app_users(id),
  reference text unique not null,
  amount numeric not null,
  status text default 'UNPAID',
  tripay_reference text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Default Admin (if not exists)
-- Using a subquery check to avoid duplicate inserts on re-runs
insert into app_users (email, password, role, subscription_status)
select 'admin@1affiliate.com', 'admin123', 'admin', 'pro'
where not exists (
    select 1 from app_users where email = 'admin@1affiliate.com'
);
