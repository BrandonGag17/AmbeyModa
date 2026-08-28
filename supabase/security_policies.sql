-- Run this script in the Supabase SQL Editor.
-- The table and column names below match the application code.

alter table public."Productos" enable row level security;
alter table public.categorias enable row level security;
alter table public."FotosProducto" enable row level security;

grant select on table public."Productos" to anon, authenticated;
grant select on table public.categorias to anon, authenticated;
grant select on table public."FotosProducto" to anon, authenticated;
grant insert, update, delete on table public."Productos" to authenticated;
grant insert, update, delete on table public.categorias to authenticated;
grant insert, update, delete on table public."FotosProducto" to authenticated;

do $$
declare
	policy_record record;
begin
	for policy_record in
		select schemaname, tablename, policyname
		from pg_policies
		where schemaname = 'public'
			and tablename in ('Productos', 'categorias', 'FotosProducto')
	loop
		execute format(
			'drop policy if exists %I on %I.%I',
			policy_record.policyname,
			policy_record.schemaname,
			policy_record.tablename
		);
	end loop;
end $$;

drop policy if exists "Public can read products" on public."Productos";
drop policy if exists "Authenticated users can insert products" on public."Productos";
drop policy if exists "Authenticated users can update products" on public."Productos";
drop policy if exists "Authenticated users can delete products" on public."Productos";

create policy "Public can read products"
on public."Productos"
for select to anon, authenticated
using (true);

create policy "Authenticated users can insert products"
on public."Productos"
for insert to authenticated
with check (auth.uid() is not null);

create policy "Authenticated users can update products"
on public."Productos"
for update to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Authenticated users can delete products"
on public."Productos"
for delete to authenticated
using (auth.uid() is not null);

drop policy if exists "Public can read categories" on public.categorias;
drop policy if exists "Authenticated users can insert categories" on public.categorias;
drop policy if exists "Authenticated users can update categories" on public.categorias;
drop policy if exists "Authenticated users can delete categories" on public.categorias;

create policy "Public can read categories"
on public.categorias
for select to anon, authenticated
using (true);

create policy "Authenticated users can insert categories"
on public.categorias
for insert to authenticated
with check (auth.uid() is not null);

create policy "Authenticated users can update categories"
on public.categorias
for update to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Authenticated users can delete categories"
on public.categorias
for delete to authenticated
using (auth.uid() is not null);

drop policy if exists "Public can read product photos" on public."FotosProducto";
drop policy if exists "Authenticated users can insert product photos" on public."FotosProducto";
drop policy if exists "Authenticated users can update product photos" on public."FotosProducto";
drop policy if exists "Authenticated users can delete product photos" on public."FotosProducto";

create policy "Public can read product photos"
on public."FotosProducto"
for select to anon, authenticated
using (true);

create policy "Authenticated users can insert product photos"
on public."FotosProducto"
for insert to authenticated
with check (auth.uid() is not null);

create policy "Authenticated users can update product photos"
on public."FotosProducto"
for update to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Authenticated users can delete product photos"
on public."FotosProducto"
for delete to authenticated
using (auth.uid() is not null);
