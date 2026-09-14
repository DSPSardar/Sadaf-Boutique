-- Sadaf Boutique catalogue schema: categories, products, product media, admin allow-list.
create extension if not exists pg_trgm;

create type product_status as enum ('draft', 'active', 'archived');
create type media_kind as enum ('image', 'video');

-- Admin allow-list. A user can manage the catalogue only if their auth user id is listed here.
create table admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- Adds any auth user whose email is on the allow-list the moment they sign up / sign in.
create table admin_invites (
  email text primary key,
  created_at timestamptz not null default now()
);

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from admin_invites where lower(email) = lower(new.email)) then
    insert into admins (user_id, email) values (new.id, new.email) on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text not null default '',
  cover_media_id uuid,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- array_to_string is only STABLE, so a generated column needs an IMMUTABLE wrapper.
create or replace function immutable_array_to_string(text[], text) returns text
language sql immutable parallel safe as $$ select array_to_string($1, $2) $$;

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sku text not null unique,
  name text not null,
  category_id uuid not null references categories (id) on delete restrict,
  price int not null check (price >= 0),
  compare_at_price int check (compare_at_price is null or compare_at_price > price),
  description text not null default '',
  fabric text not null default '',
  work text not null default '',
  pieces text[] not null default '{}',
  care text not null default '',
  sizes text[] not null default '{}',
  colors jsonb not null default '[]'::jsonb,
  occasion text[] not null default '{}',
  tags text[] not null default '{}',
  is_new boolean not null default false,
  featured_rank int not null default 1000,
  stock int not null default 0 check (stock >= 0),
  status product_status not null default 'draft',
  search_text text generated always as (lower(name || ' ' || sku || ' ' || immutable_array_to_string(tags, ' '))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_status_idx on products (category_id, status);
create index products_featured_idx on products (featured_rank);
create index products_tags_idx on products using gin (tags);
create index products_search_idx on products using gin (search_text gin_trgm_ops);

create table product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  kind media_kind not null,
  storage_path text not null,
  poster_media_id uuid references product_media (id) on delete set null,
  alt text not null default '',
  sort_order int not null default 0,
  width int,
  height int,
  blur_data_url text,
  created_at timestamptz not null default now()
);

create index product_media_product_idx on product_media (product_id, sort_order);

alter table categories
  add constraint categories_cover_media_fk foreign key (cover_media_id) references product_media (id) on delete set null;

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger categories_updated_at before update on categories for each row execute function set_updated_at();
create trigger products_updated_at before update on products for each row execute function set_updated_at();

-- Row level security ---------------------------------------------------------
alter table admins enable row level security;
alter table admin_invites enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_media enable row level security;

create policy "admins can see themselves" on admins for select using (user_id = auth.uid());
create policy "admins manage invites" on admin_invites for all using (is_admin()) with check (is_admin());

create policy "categories are public" on categories for select using (true);
create policy "admins manage categories" on categories for all using (is_admin()) with check (is_admin());

create policy "active products are public" on products for select using (status = 'active' or is_admin());
create policy "admins manage products" on products for all using (is_admin()) with check (is_admin());

create policy "media of visible products is public" on product_media for select
  using (is_admin() or exists (select 1 from products p where p.id = product_id and p.status = 'active'));
create policy "admins manage media" on product_media for all using (is_admin()) with check (is_admin());
