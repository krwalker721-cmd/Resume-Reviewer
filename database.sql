-- Run this entire file in the Supabase SQL Editor

create table profiles (
  id uuid references auth.users on delete cascade,
  email text,
  access_level text default 'free',
  reviews_used int default 0,
  stripe_customer_id text,
  created_at timestamp default now(),
  primary key (id)
);

create table reviews (
  id uuid default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  resume_text text,
  application_type text,
  feedback jsonb,
  created_at timestamp default now(),
  primary key (id)
);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Allow users to read/update only their own profile
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Allow users to read/insert only their own reviews
alter table reviews enable row level security;
create policy "Users can view own reviews" on reviews for select using (auth.uid() = user_id);
create policy "Users can insert own reviews" on reviews for insert with check (auth.uid() = user_id);
