-- SUPABASE DATABASE SCHEMA SETUP
-- Paste this script into your Supabase SQL Editor and run it.

-- Migration for existing tables: Run this line if you already created the tables previously:
-- ALTER TABLE public.solves ADD COLUMN IF NOT EXISTS session_id text DEFAULT '1'::text NOT NULL;
-- ALTER TABLE public.solves ADD COLUMN IF NOT EXISTS notes text DEFAULT ''::text;

-- 1. Create profiles table (links to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger function to automatically create a profile on new signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Create solves table
create table if not exists public.solves (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  time_ms integer not null,
  scramble text not null,
  penalty text default 'none'::text not null, -- 'none', '+2', 'DNF'
  puzzle_type text default '333'::text not null,
  session_id text default '1'::text not null, -- '1', '2', '3', etc. for session management
  notes text default ''::text, -- For storing split times
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for solves
alter table public.solves enable row level security;

create policy "Users can view their own solves" on public.solves
  for select using (auth.uid() = user_id);

create policy "Users can insert their own solves" on public.solves
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own solves" on public.solves
  for update using (auth.uid() = user_id);

create policy "Users can delete their own solves" on public.solves
  for delete using (auth.uid() = user_id);


-- 3. Create formulas table (custom formulas)
create table if not exists public.formulas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null, -- 'OLL', 'PLL', '3-style-edge', '3-style-corner'
  scramble text,
  formula text not null,
  memo text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for formulas
alter table public.formulas enable row level security;

create policy "Users can view their own formulas" on public.formulas
  for select using (auth.uid() = user_id);

create policy "Users can insert their own formulas" on public.formulas
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own formulas" on public.formulas
  for update using (auth.uid() = user_id);

create policy "Users can delete their own formulas" on public.formulas
  for delete using (auth.uid() = user_id);


-- 4. Create bld_memo table (custom letter-pair memory hints)
create table if not exists public.bld_memo (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  letter_pair text not null,
  type text not null, -- 'edge' or 'corner'
  memo_text text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, letter_pair, type)
);

-- Enable RLS for bld_memo
alter table public.bld_memo enable row level security;

create policy "Users can view their own bld_memo" on public.bld_memo
  for select using (auth.uid() = user_id);

create policy "Users can insert their own bld_memo" on public.bld_memo
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own bld_memo" on public.bld_memo
  for update using (auth.uid() = user_id);

create policy "Users can delete their own bld_memo" on public.bld_memo
  for delete using (auth.uid() = user_id);
