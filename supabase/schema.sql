-- =====================================================================
-- HOME HUNTERZ CMS — DATABASE SCHEMA
-- =====================================================================
-- Run this once in your Supabase project's SQL Editor (Dashboard →
-- SQL Editor → New query → paste this whole file → Run).
--
-- This creates every table the admin CMS and public site need, plus
-- Row Level Security (RLS) policies so that:
--   - Anyone (including logged-out visitors) can READ published
--     properties, published testimonials, and site settings.
--   - Only an authenticated admin can WRITE (insert/update/delete)
--     anything, or read leads/enquiries.
-- Admin accounts are handled by Supabase's built-in Auth system — you
-- don't need a custom "admin_users" table or manual password hashing;
-- Supabase already does that securely. You create admin logins from
-- Dashboard → Authentication → Users → Add User.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PROPERTIES
-- ---------------------------------------------------------------------
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                    -- SEO-friendly URL part, e.g. "flat-for-sale-perumbakkam"
  reference_id text,                             -- your own internal property code, optional

  title text not null,
  category text not null,                        -- Apartment, Flat, Independent House, Villa, Residential Plot,
                                                   -- Land, Commercial, Office, Retail, Warehouse, Industrial, Other
  listing_type text not null,                     -- For Sale, For Rent, For Lease
  status text not null default 'Available',       -- Available, Under Offer, Sold, Rented, Inactive

  -- location
  location text,                                  -- short label shown on cards, e.g. "Perumbakkam"
  locality text,
  city text default 'Chennai',
  state text default 'Tamil Nadu',
  pincode text,
  full_address text,
  google_maps_url text,
  latitude numeric,
  longitude numeric,

  -- price
  price numeric,                                  -- raw numeric value, for sorting (₹)
  display_price text,                             -- free-text as shown to visitors: "₹1.25 Cr", "₹45,000 / Month"
  price_per_sqft numeric,
  is_negotiable boolean default false,
  is_price_on_request boolean default false,

  -- size & specs
  land_area text,
  builtup_area text,
  carpet_area text,
  uds text,
  plot_area text,
  area_unit text default 'Sq.ft',                 -- Sq.ft, Sq.m, Ground, Cent, Acre
  bedrooms int,
  bathrooms int,
  balconies int,
  car_parking text,
  property_age text,
  floor_number text,
  total_floors text,
  facing text,
  furnishing text,                                -- Unfurnished, Semi-Furnished, Fully Furnished
  possession_status text,
  road_width text,
  frontage text,
  depth text,
  approval_authority text,
  rera_info text,

  -- description
  short_description text,
  full_description text,                          -- stored as simple HTML (paragraphs/headings/bullets)
  highlights text[],                               -- array of short highlight strings
  amenities text[],                                -- array of amenity names, matched against the fixed amenity list
  nearby_landmarks text,

  -- media
  video_youtube_url text,
  video_instagram_url text,
  video_other_url text,

  -- SEO
  seo_title text,
  seo_description text,
  seo_keywords text,
  canonical_url text,
  og_image_url text,

  -- flags & workflow
  is_featured boolean default false,
  is_published boolean default false,              -- draft vs. published
  is_archived boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_properties_published on properties (is_published, is_archived);
create index if not exists idx_properties_featured on properties (is_featured) where is_featured = true;
create index if not exists idx_properties_category on properties (category);
create index if not exists idx_properties_listing_type on properties (listing_type);
create index if not exists idx_properties_status on properties (status);
create index if not exists idx_properties_slug on properties (slug);

-- ---------------------------------------------------------------------
-- 2. PROPERTY IMAGES  (unlimited per property — no cap of any kind)
-- ---------------------------------------------------------------------
create table if not exists property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,                     -- path inside the Supabase Storage bucket
  public_url text not null,                       -- cached public URL for fast reads
  caption text,
  alt_text text,
  is_featured_image boolean default false,        -- exactly one per property should be true (enforced in app code)
  sort_order int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_property_images_property on property_images (property_id, sort_order);

-- ---------------------------------------------------------------------
-- 3. LEADS / ENQUIRIES  (every form on the site writes here)
-- ---------------------------------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),

  name text,
  phone text,
  whatsapp text,
  email text,
  message text,

  property_id uuid references properties(id) on delete set null,
  property_title_snapshot text,                   -- keeps the property name even if it's later deleted

  -- distinguishes which form this came from — never mixed together
  source text not null,                            -- 'property_enquiry' | 'list_with_us' | 'free_valuation'
                                                     -- | 'joint_venture' | 'nri_services' | 'contact_form'
  source_details jsonb,                             -- the form's extra fields (property type, budget, etc.), kept as-is

  status text not null default 'New',               -- New, Contacted, Follow-up, Qualified, Closed, Not Interested
  internal_notes text,
  is_archived boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_leads_source on leads (source);
create index if not exists idx_leads_status on leads (status);
create index if not exists idx_leads_created on leads (created_at desc);

-- ---------------------------------------------------------------------
-- 4. TESTIMONIALS
-- ---------------------------------------------------------------------
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_role text,                                -- "Property Buyer", "Property Seller", "Landlord", etc.
  location text,
  review text not null,
  photo_url text,
  rating int check (rating between 1 and 5),
  sort_order int default 0,
  is_published boolean default false,               -- never shown publicly until an admin explicitly publishes it
  created_at timestamptz default now()
);

create index if not exists idx_testimonials_published on testimonials (is_published, sort_order);

-- ---------------------------------------------------------------------
-- 5. SETTINGS  (single-row table: site-wide contact info, socials, SEO defaults)
-- ---------------------------------------------------------------------
create table if not exists settings (
  id int primary key default 1,
  company_name text default 'Home Hunterz',
  logo_url text,
  phone text,
  whatsapp text,
  email text,
  office_address text,
  google_maps_url text,
  instagram_url text,
  facebook_url text,
  youtube_url text,
  default_seo_title text,
  default_seo_description text,
  hero_heading text,
  hero_subheading text,
  hero_cta_text text,
  updated_at timestamptz default now(),
  constraint settings_singleton check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table properties enable row level security;
alter table property_images enable row level security;
alter table leads enable row level security;
alter table testimonials enable row level security;
alter table settings enable row level security;

-- Public (anonymous) visitors can read published, non-archived properties
create policy "public can read published properties"
  on properties for select
  using (is_published = true and is_archived = false);

-- Public can read images belonging to published properties
create policy "public can read images of published properties"
  on property_images for select
  using (
    exists (
      select 1 from properties
      where properties.id = property_images.property_id
      and properties.is_published = true
      and properties.is_archived = false
    )
  );

-- Public can read published testimonials
create policy "public can read published testimonials"
  on testimonials for select
  using (is_published = true);

-- Public can read site settings (needed to show phone/whatsapp/social links)
create policy "public can read settings"
  on settings for select
  using (true);

-- Public (anonymous) visitors can INSERT leads (submit forms) but never read/edit/delete them
create policy "public can submit leads"
  on leads for insert
  with check (true);

-- Authenticated admins can do everything on every table
create policy "admins full access properties"
  on properties for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admins full access property_images"
  on property_images for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admins full access leads"
  on leads for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admins full access testimonials"
  on testimonials for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admins full access settings"
  on settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =====================================================================
-- STORAGE BUCKET for property images
-- =====================================================================
-- Run this too — creates a public bucket for property photos.
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

create policy "public can view property images in storage"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "admins can upload property images"
  on storage.objects for insert
  with check (bucket_id = 'property-images' and auth.role() = 'authenticated');

create policy "admins can update property images"
  on storage.objects for update
  using (bucket_id = 'property-images' and auth.role() = 'authenticated');

create policy "admins can delete property images"
  on storage.objects for delete
  using (bucket_id = 'property-images' and auth.role() = 'authenticated');

-- =====================================================================
-- Keep updated_at fresh automatically
-- =====================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_properties_updated_at on properties;
create trigger trg_properties_updated_at before update on properties
  for each row execute function set_updated_at();

drop trigger if exists trg_leads_updated_at on leads;
create trigger trg_leads_updated_at before update on leads
  for each row execute function set_updated_at();
