-- Phase E foundation: branch bank accounts, payment requests, payment proofs, and manual confirmation support.

create type public.payment_request_status as enum (
  'sent',
  'pending_verification',
  'verified',
  'rejected',
  'expired',
  'cancelled'
);

create type public.payment_proof_status as enum (
  'uploaded',
  'verified',
  'rejected'
);

create table public.branch_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  bank_name text not null,
  bank_bin text not null,
  account_name text not null,
  account_number text not null,
  account_label text not null default '',
  qr_provider text not null default 'vietqr',
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, bank_bin, account_number)
);

create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  payment_code text not null unique default public.make_workflow_code('PAY'),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  branch_bank_account_id uuid not null references public.branch_bank_accounts(id) on delete restrict,
  bank_name text not null,
  bank_bin text not null,
  account_name text not null,
  account_number text not null,
  amount numeric(12,2) not null,
  currency text not null default 'VND',
  transfer_content text not null,
  note text not null default '',
  source text not null default 'staff_portal',
  status public.payment_request_status not null default 'sent',
  public_upload_link_expires_at timestamptz not null default (now() + interval '72 hours'),
  proof_uploaded_at timestamptz,
  verified_at timestamptz,
  rejected_at timestamptz,
  rejected_reason text not null default '',
  confirmation_email_sent_at timestamptz,
  confirmation_email_to citext,
  confirmation_pdf_generated_at timestamptz,
  confirmation_pdf_path text,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  payment_request_id uuid not null references public.payment_requests(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  uploaded_by_user_id uuid references auth.users(id) on delete set null,
  file_bucket text not null default 'payment-proofs',
  file_path text not null unique,
  file_name text not null,
  mime_type text not null,
  file_size bigint not null default 0,
  uploaded_via text not null default 'public_link',
  note text not null default '',
  status public.payment_proof_status not null default 'uploaded',
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index branch_bank_accounts_branch_idx
  on public.branch_bank_accounts (branch_id, is_active, is_default, sort_order);

create index payment_requests_branch_status_idx
  on public.payment_requests (branch_id, status, created_at desc);

create index payment_requests_customer_status_idx
  on public.payment_requests (customer_id, status, created_at desc);

create index payment_requests_reservation_idx
  on public.payment_requests (reservation_id, status);

create index payment_requests_upload_expiry_idx
  on public.payment_requests (public_upload_link_expires_at, status);

create index payment_proofs_request_status_idx
  on public.payment_proofs (payment_request_id, status, created_at desc);

create index payment_proofs_customer_idx
  on public.payment_proofs (customer_id, created_at desc);

create trigger set_branch_bank_accounts_updated_at
before update on public.branch_bank_accounts
for each row
execute function public.set_updated_at();

create trigger set_payment_requests_updated_at
before update on public.payment_requests
for each row
execute function public.set_updated_at();

create trigger set_payment_proofs_updated_at
before update on public.payment_proofs
for each row
execute function public.set_updated_at();

create or replace function public.mark_payment_request_proof_uploaded()
returns trigger
language plpgsql
as $$
begin
  update public.payment_requests
    set status = 'pending_verification',
        proof_uploaded_at = coalesce(proof_uploaded_at, now()),
        updated_at = now()
    where id = new.payment_request_id
      and status in ('sent', 'pending_verification');

  return new;
end;
$$;

create trigger payment_proof_after_insert
after insert on public.payment_proofs
for each row
execute function public.mark_payment_request_proof_uploaded();

alter table public.branch_bank_accounts enable row level security;
alter table public.payment_requests enable row level security;
alter table public.payment_proofs enable row level security;

create policy "Internal users can manage branch bank accounts"
  on public.branch_bank_accounts
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Internal users can manage payment requests"
  on public.payment_requests
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Customers can read their own payment requests"
  on public.payment_requests
  for select
  using (
    exists (
      select 1
      from public.customers customers
      where customers.id = payment_requests.customer_id
        and customers.auth_user_id = auth.uid()
    )
  );

create policy "Internal users can manage payment proofs"
  on public.payment_proofs
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Customers can read their own payment proofs"
  on public.payment_proofs
  for select
  using (
    exists (
      select 1
      from public.payment_requests payment_requests
      join public.customers customers on customers.id = payment_requests.customer_id
      where payment_requests.id = payment_proofs.payment_request_id
        and customers.auth_user_id = auth.uid()
    )
  );

create policy "Customers can insert their own payment proofs"
  on public.payment_proofs
  for insert
  with check (
    exists (
      select 1
      from public.payment_requests payment_requests
      join public.customers customers on customers.id = payment_requests.customer_id
      where payment_requests.id = payment_proofs.payment_request_id
        and customers.auth_user_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public;

comment on table public.branch_bank_accounts is 'Bank accounts used for branch-specific manual deposit collection.';
comment on table public.payment_requests is 'Manual deposit requests linked to reservations and QR payment data.';
comment on table public.payment_proofs is 'Uploaded payment proofs awaiting manual verification.';
