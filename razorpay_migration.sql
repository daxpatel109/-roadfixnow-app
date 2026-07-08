-- 1. Payments Table
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  repair_request_id uuid references repair_requests(id) on delete cascade not null,
  customer_id uuid references users(id) not null,
  mechanic_id uuid references users(id),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  amount numeric(10,2) not null,
  currency text default 'INR',
  payment_method text default 'razorpay',
  payment_status text default 'created',
  failure_reason text,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Settlements Table
create table if not exists settlements (
  id uuid primary key default gen_random_uuid(),
  repair_request_id uuid references repair_requests(id) on delete cascade not null,
  payment_id uuid references payments(id),
  mechanic_id uuid references users(id) not null,
  gross_amount numeric(10,2) not null,
  platform_commission numeric(10,2) not null,
  mechanic_payout numeric(10,2) not null,
  commission_percentage numeric(5,2) default 15.00,
  settlement_status text default 'pending',
  settled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. RLS Policies
alter table payments enable row level security;
alter table settlements enable row level security;

-- Customers can view their own payments
create policy "Customers can view their own payments" on payments for select using (auth.uid() = customer_id);

-- Mechanics can view payments related to them
create policy "Mechanics can view payments for their jobs" on payments for select using (auth.uid() = mechanic_id);

-- Mechanics can view their own settlements
create policy "Mechanics can view their own settlements" on settlements for select using (auth.uid() = mechanic_id);

-- Anyone can insert/update (Secure backend will bypass RLS anyway, but if anon key is used, we allow it for now. In prod, strict RLS or Service Key is used)
create policy "Backend can insert/update payments" on payments for all using (true) with check (true);
create policy "Backend can insert/update settlements" on settlements for all using (true) with check (true);

-- Admin can view all
create policy "Admins can view all payments" on payments for select using (
  exists (select 1 from users where users.id = auth.uid() and users.role = 'admin')
);
create policy "Admins can view all settlements" on settlements for select using (
  exists (select 1 from users where users.id = auth.uid() and users.role = 'admin')
);
