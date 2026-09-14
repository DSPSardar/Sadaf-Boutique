-- Public-read bucket for product renditions and preview clips; writes restricted to admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-media', 'product-media', true, 52428800, array['image/webp', 'image/jpeg', 'image/png', 'video/mp4'])
on conflict (id) do nothing;

create policy "product media is public" on storage.objects for select
  using (bucket_id = 'product-media');
create policy "admins upload product media" on storage.objects for insert
  with check (bucket_id = 'product-media' and is_admin());
create policy "admins update product media" on storage.objects for update
  using (bucket_id = 'product-media' and is_admin());
create policy "admins delete product media" on storage.objects for delete
  using (bucket_id = 'product-media' and is_admin());
