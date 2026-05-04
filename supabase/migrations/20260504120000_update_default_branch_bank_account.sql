alter table public.branch_bank_accounts
  add column if not exists swift_code text not null default '',
  add column if not exists citad_code text not null default '';

update public.branch_bank_accounts
set
  bank_name = 'ACB',
  bank_bin = '970416',
  account_name = 'CTY TNHH YASAKA-VIETNAM-CN PHU QUOC',
  account_number = '197188856',
  account_label = 'Phu Quoc deposit account',
  swift_code = 'ASCBVNVX',
  citad_code = '79307001',
  updated_at = now()
where id = '66666666-6666-6666-6666-666666666661';
