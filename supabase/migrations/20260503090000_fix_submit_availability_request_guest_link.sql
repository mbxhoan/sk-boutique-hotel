-- Fix: when a logged-in member submits an availability request for a guest
-- whose email differs from the member's own auth email, do NOT link the new
-- customer row to the member's auth_user_id. Otherwise the INSERT violates
-- the UNIQUE(customers.auth_user_id) constraint, surfacing as a misleading
-- "Email này đã được dùng bởi member khác." error to the booker.
--
-- After this change:
--   - Booking for self (auth.users.email matches p_contact_email): customer
--     row links to p_created_by as before.
--   - Booking for someone else: customer row keeps auth_user_id null (or
--     preserves the existing link via ON CONFLICT email path), so the
--     unique constraint is no longer triggered.

create or replace function public.submit_availability_request(
  p_branch_id uuid,
  p_room_type_id uuid,
  p_stay_start_at timestamptz,
  p_stay_end_at timestamptz,
  p_contact_name text,
  p_contact_email citext,
  p_guest_count integer default 1,
  p_contact_phone text default null,
  p_note text default '',
  p_marketing_consent boolean default false,
  p_preferred_locale text default 'vi',
  p_source text default 'public_site',
  p_created_by uuid default null,
  p_quoted_nightly_rate numeric default null,
  p_quoted_total_amount numeric default null,
  p_quoted_currency text default 'VND'
)
returns public.availability_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer public.customers;
  v_request public.availability_requests;
  v_creator_email citext;
  v_customer_auth_user_id uuid;
begin
  if p_stay_end_at <= p_stay_start_at then
    raise exception 'Availability request stay window is invalid.';
  end if;

  -- Resolve the auth user's email so we can decide whether to link the
  -- customer row to p_created_by. Only link when the contact email matches
  -- the auth user's email; otherwise this is a "book for guest" scenario.
  if p_created_by is not null then
    select email::citext
      into v_creator_email
      from auth.users
      where id = p_created_by;
  end if;

  if p_created_by is not null and v_creator_email is not null and v_creator_email = p_contact_email then
    v_customer_auth_user_id := p_created_by;
  else
    v_customer_auth_user_id := null;
  end if;

  insert into public.customers (
    auth_user_id,
    full_name,
    email,
    phone,
    preferred_locale,
    marketing_consent,
    marketing_consent_at,
    marketing_consent_source,
    source,
    notes
  ) values (
    v_customer_auth_user_id,
    p_contact_name,
    p_contact_email,
    p_contact_phone,
    coalesce(p_preferred_locale, 'vi'),
    coalesce(p_marketing_consent, false),
    case
      when coalesce(p_marketing_consent, false) then now()
      else null
    end,
    case
      when coalesce(p_marketing_consent, false) then 'availability_request'
      else null
    end,
    coalesce(p_source, 'public_site'),
    coalesce(p_note, '')
  )
  on conflict (email) do update set
    full_name = excluded.full_name,
    phone = excluded.phone,
    preferred_locale = excluded.preferred_locale,
    marketing_consent = excluded.marketing_consent,
    marketing_consent_at = excluded.marketing_consent_at,
    marketing_consent_source = excluded.marketing_consent_source,
    source = excluded.source,
    notes = excluded.notes,
    updated_at = now()
  returning * into v_customer;

  insert into public.availability_requests (
    customer_id,
    branch_id,
    room_type_id,
    stay_start_at,
    stay_end_at,
    guest_count,
    contact_name,
    contact_email,
    contact_phone,
    note,
    marketing_consent,
    preferred_locale,
    source,
    status,
    created_by,
    updated_by,
    quoted_nightly_rate,
    quoted_total_amount,
    quoted_currency
  ) values (
    v_customer.id,
    p_branch_id,
    p_room_type_id,
    p_stay_start_at,
    p_stay_end_at,
    greatest(coalesce(p_guest_count, 1), 1),
    p_contact_name,
    p_contact_email,
    p_contact_phone,
    coalesce(p_note, ''),
    coalesce(p_marketing_consent, false),
    coalesce(p_preferred_locale, 'vi'),
    coalesce(p_source, 'public_site'),
    'new',
    p_created_by,
    p_created_by,
    case
      when p_quoted_nightly_rate is not null and p_quoted_nightly_rate >= 0 then round(p_quoted_nightly_rate::numeric, 2)
      else null
    end,
    case
      when p_quoted_total_amount is not null and p_quoted_total_amount >= 0 then round(p_quoted_total_amount::numeric, 2)
      else null
    end,
    case
      when nullif(trim(coalesce(p_quoted_currency, '')), '') is null then 'VND'
      else upper(trim(p_quoted_currency))
    end
  )
  returning * into v_request;

  return v_request;
end;
$$;
