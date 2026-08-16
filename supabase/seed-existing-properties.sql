-- =====================================================================
-- SEED: migrates your 6 current properties (previously hardcoded in
-- js/script.js) into the new database, so the admin panel starts
-- pre-populated instead of empty.
--
-- Run this ONCE, after schema.sql, in the Supabase SQL Editor.
-- =====================================================================

-- NOTE ON IMAGES: this seed points image URLs at your existing live
-- site (replace YOUR-DOMAIN below with your real Cloudflare Pages
-- domain) rather than Supabase Storage, since these image files
-- already exist there and there's no need to re-upload them just to
-- get the CMS working. Going forward, new properties you add through
-- the admin panel will upload straight to Supabase Storage. If you'd
-- like these 6 fully migrated to Supabase Storage too, you can
-- re-upload each one through Admin → Properties → Edit → Images
-- whenever it's convenient — nothing breaks in the meantime.

do $$
declare
  base_url text := 'https://YOUR-DOMAIN.pages.dev'; -- <-- replace with your real domain
  v_id uuid;
begin

  -- Property 1
  insert into properties (slug, title, category, listing_type, status, location, city,
    display_price, land_area, builtup_area, uds, short_description, is_published, is_featured)
  values ('flat-for-sale-perumbakkam', 'Flat for Sale – Perumbakkam', 'Flat', 'For Sale', 'Available',
    'Near Global Hospital Bus Stop', 'Chennai', 'Price on Request', null, '1250 Sq.Ft.', '52%',
    'Covered car parking, library, kids play area, 24x7 water, security, piped gas.', true, true)
  returning id into v_id;
  insert into property_images (property_id, storage_path, public_url, alt_text, is_featured_image, sort_order)
  values (v_id, '', base_url || '/images/properties/prop-1-perumbakkam.jpg',
    'Living room interior of flat for sale in Perumbakkam', true, 0);

  -- Property 2
  insert into properties (slug, title, category, listing_type, status, location, city,
    display_price, bedrooms, builtup_area, uds, property_age, furnishing, floor_number, total_floors,
    short_description, is_published, is_featured)
  values ('2bhk-flat-west-tambaram-resale', '2 BHK Flat – West Tambaram (Resale)', 'Flat', 'For Sale', 'Available',
    'West Tambaram', 'Chennai', '₹45 Lakhs (Rate Negotiable)', 2, '980 Sq.Ft. & 985 Sq.Ft.', '400 Sq.Ft.',
    '8 Years Old', 'Unfurnished', 'Fourth Floor', '4',
    'North facing, covered car parking, lift available, borewell & metro water, approved flat, road facing.',
    true, true)
  returning id into v_id;
  insert into property_images (property_id, storage_path, public_url, alt_text, is_featured_image, sort_order)
  values (v_id, '', base_url || '/images/properties/prop-2-west-tambaram.jpg',
    'Interior of 2 BHK resale flat in West Tambaram', true, 0);

  -- Property 3
  insert into properties (slug, title, category, listing_type, status, location, city,
    display_price, bedrooms, builtup_area, uds, floor_number, total_floors,
    short_description, is_published, is_featured)
  values ('flat-for-sale-kk-nagar', 'Flat for Sale – K.K. Nagar', 'Flat', 'For Sale', 'Available',
    'K.K. Nagar', 'Chennai', '₹55 Lakhs', 2, '995 Sq.Ft.', '280 Sq.Ft.', 'Second Floor', '2',
    'No parking, no lift, 14 flats total.', true, true)
  returning id into v_id;
  insert into property_images (property_id, storage_path, public_url, alt_text, is_featured_image, sort_order)
  values (v_id, '', base_url || '/images/properties/prop-3-kk-nagar.jpg',
    'Interior of flat for sale in K.K. Nagar', true, 0);

  -- Property 4
  insert into properties (slug, title, category, listing_type, status, location, city,
    display_price, bedrooms, builtup_area, land_area, floor_number,
    short_description, is_published, is_featured)
  values ('villa-for-sale-east-tambaram-selaiyur', 'Villa for Sale – East Tambaram, Selaiyur', 'Villa', 'For Sale', 'Available',
    'East Tambaram, Selaiyur', 'Chennai', '₹80 Lakhs', 2, '1550 Sq.Ft.', '915 Sq.Ft.', 'Ground + First Floor',
    'Independent villa, ground plus first floor.', true, true)
  returning id into v_id;
  insert into property_images (property_id, storage_path, public_url, alt_text, is_featured_image, sort_order)
  values (v_id, '', base_url || '/images/properties/prop-4-east-tambaram-villa.jpg',
    'Exterior of villa for sale in East Tambaram, Selaiyur', true, 0);

  -- Property 5
  insert into properties (slug, title, category, listing_type, status, location, city,
    display_price, bedrooms, land_area, builtup_area, total_floors, car_parking,
    short_description, is_published, is_featured)
  values ('independent-4bhk-villa-perungudi-omr', 'Independent 4 BHK Villa – Perungudi, OMR', 'Villa', 'For Sale', 'Available',
    'Perungudi, OMR', 'Chennai', 'Price on Request', 4, '1600 Sq.Ft.', '2500+ Sq.Ft.', 'Ground + 2 Floors', '2 Car Parks',
    'Gated community, independent villa.', true, true)
  returning id into v_id;
  insert into property_images (property_id, storage_path, public_url, alt_text, is_featured_image, sort_order)
  values (v_id, '', base_url || '/images/properties/prop-5-perungudi-omr-villa.jpg',
    'Bedroom interior of independent villa in Perungudi, OMR', true, 0);

  -- Property 6
  insert into properties (slug, title, category, listing_type, status, location, city,
    display_price, builtup_area, land_area,
    short_description, is_published, is_featured)
  values ('independent-house-adyar', 'Independent House – Adyar', 'Independent House', 'For Sale', 'Available',
    'Adyar', 'Chennai', '₹3.5 Crores', '1379 Sq.Ft.', '909 Sq.Ft.',
    'G+2 building, 10 feet passage property.', true, true)
  returning id into v_id;
  insert into property_images (property_id, storage_path, public_url, alt_text, is_featured_image, sort_order)
  values (v_id, '', base_url || '/images/properties/prop-6-adyar-house.jpg',
    'Interior of independent house for sale in Adyar', true, 0);

end $$;
