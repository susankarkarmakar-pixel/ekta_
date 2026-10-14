-- Optional public profile details used by the profile editor.
alter table public.profiles add column if not exists pronouns text;
alter table public.profiles add column if not exists website text;
alter table public.profiles add column if not exists category text;
