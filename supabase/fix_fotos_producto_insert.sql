-- Ejecutar una vez en Supabase Dashboard > SQL Editor.
-- Habilita a usuarios con sesión iniciada a crear fotos adicionales.

grant insert on table public."FotosProducto" to authenticated;
grant delete on table public."FotosProducto" to authenticated;

drop policy if exists "Authenticated users can insert product photos"
on public."FotosProducto";

create policy "Authenticated users can insert product photos"
on public."FotosProducto"
for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists "Authenticated users can delete product photos"
on public."FotosProducto";

create policy "Authenticated users can delete product photos"
on public."FotosProducto"
for delete
to authenticated
using (auth.uid() is not null);
