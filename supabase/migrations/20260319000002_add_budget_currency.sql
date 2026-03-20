-- Add currency to budget_config
alter table budget_config add column if not exists currency text not null default 'USD';
