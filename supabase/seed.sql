-- Base categories (products are seeded by scripts/seed-supabase.mjs).
insert into categories (slug, label, description, sort_order) values
  ('bridal', 'Bridal', 'Signature bridal ensembles in velvet, tissue and net with hand-embellished zardozi work.', 1),
  ('luxury-formals', 'Luxury Formals', 'Tissue and silk formals for walima, receptions and evening occasions.', 2),
  ('lehenga-choli', 'Lehenga & Choli', 'Flowing lehengas with embellished cholis for mehndi, walima and festive evenings.', 3),
  ('gharara-sharara', 'Gharara & Sharara', 'Traditional gharara and sharara sets with heavy gota and zardozi borders.', 4),
  ('velvet', 'Velvet', 'Winter-weight silk velvet pieces with kora, dabka and pearl embroidery.', 5),
  ('embroidered-suits', 'Embroidered Suits', 'Raw silk three-piece suits with resham and tilla embroidery.', 6)
on conflict (slug) do nothing;
