create or replace function public.release_expired_availability_requests(p_as_of timestamptz default now())
returns table (
  request_id uuid,
  request_code text,
  branch_id uuid,
  customer_id uuid,
  status public.availability_request_status,
  response_due_at timestamptz,
  expired_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.availability_requests;
begin
  if not public.has_internal_access() then
    raise exception 'Internal access required to release expired availability requests.';
  end if;

  for v_request in
    update public.availability_requests
    set status = 'expired',
        closed_at = coalesce(closed_at, p_as_of),
        updated_at = now()
    where status in ('new', 'in_review', 'quoted')
      and response_due_at <= p_as_of
    returning *
  loop
    perform public.log_audit_event(
      'availability_request.expired',
      'Availability request expired',
      'availability_request',
      v_request.id,
      v_request.branch_id,
      v_request.customer_id,
      null,
      null,
      null,
      v_request.id,
      null,
      'system',
      jsonb_build_object(
        'request_code', v_request.request_code,
        'response_due_at', v_request.response_due_at
      )
    );

    request_id := v_request.id;
    request_code := v_request.request_code;
    branch_id := v_request.branch_id;
    customer_id := v_request.customer_id;
    status := v_request.status;
    response_due_at := v_request.response_due_at;
    expired_at := coalesce(v_request.closed_at, p_as_of);
    return next;
  end loop;
end;
$$;

revoke all on function public.release_expired_availability_requests(timestamptz) from public;
grant execute on function public.release_expired_availability_requests(timestamptz) to authenticated, service_role;
