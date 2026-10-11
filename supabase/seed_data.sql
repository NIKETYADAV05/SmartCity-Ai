-- =========================================================
-- SMARTCITY AI - SEED DATA
-- Run this after schema.sql in Supabase SQL Editor
-- Populates realistic demo complaints, notifications, etc.
-- =========================================================

-- =========================================================
-- SEED COMPLAINTS (requires a citizen user to exist)
-- We use a helper function to safely insert if a citizen exists
-- =========================================================

do $$
declare
  citizen_id uuid;
begin
  -- Get the first citizen user, or skip if none exist
  select id into citizen_id 
  from public.profiles 
  where role = 'citizen' 
  limit 1;

  if citizen_id is null then
    -- Use admin as fallback if no citizen exists yet
    select id into citizen_id 
    from public.profiles 
    limit 1;
  end if;

  if citizen_id is null then
    raise notice 'No users found in profiles. Skipping complaint seeding.';
    return;
  end if;

  -- Insert demo complaints
  insert into public.complaints (citizen_id, title, description, category, priority, status, address, latitude, longitude, ai_category, ai_priority, ai_department, ai_summary)
  values
    (citizen_id, 'Pothole on MG Road near Signal 4', 'Large pothole approximately 30cm wide causing vehicle damage. Needs immediate repair.', 'Road & Infrastructure', 'high', 'in_progress', 'MG Road, Sector 4', 12.9752, 77.6095, 'Road & Infrastructure', 'high', 'Roads & Infrastructure', 'Deep pothole hazard on busy road'),
    (citizen_id, 'Broken streetlight — Park Street', 'Three consecutive streetlights non-functional since last week.', 'Streetlights', 'medium', 'pending', 'Park Street, Block B', 12.9784, 77.5990, 'Street Lighting', 'medium', 'Street Lighting', 'Multiple streetlight outage'),
    (citizen_id, 'Overflowing garbage bin — Nehru Market', 'Garbage overflowing onto footpath creating health hazard.', 'Waste Management', 'high', 'resolved', 'Nehru Market, Main Gate', 12.9810, 77.5780, 'Waste Management', 'high', 'Waste Management', 'Overflowing waste bin near market'),
    (citizen_id, 'Water pipeline leak — Residency Area', 'Major water pipeline burst causing road flooding.', 'Water Supply', 'critical', 'in_progress', 'Residency Area, Lane 7', 12.9680, 77.6030, 'Water & Drainage', 'critical', 'Water & Drainage', 'Major pipeline burst with flooding'),
    (citizen_id, 'Fallen tree blocking road', 'Large tree fell during last night storm blocking the main road.', 'Emergency', 'critical', 'pending', 'Civil Lines, Near Court', 12.9790, 77.5910, 'Emergency', 'critical', 'Public Safety', 'Storm damage — fallen tree blocking road'),
    (citizen_id, 'Damaged footpath tiles', 'Multiple footpath tiles broken, posing tripping hazard to pedestrians.', 'Road & Infrastructure', 'low', 'pending', 'Lal Bagh Road', 12.9550, 77.5860, 'Road & Infrastructure', 'low', 'Roads & Infrastructure', 'Broken footpath tiles'),
    (citizen_id, 'Open manhole cover on 80 Feet Road', 'Dangerous open drainage pit without warning signs or barricades.', 'Sewage & Drainage', 'critical', 'pending', '80 Feet Road, Koramangala', 12.9345, 77.6265, 'Water & Drainage', 'critical', 'Water & Drainage', 'Open manhole — safety hazard'),
    (citizen_id, 'Flickering streetlights along ITPL Main Road', 'Streetlights continuously flickering causing driver eye strain.', 'Streetlights', 'low', 'in_progress', 'ITPL Main Road, Whitefield', 12.9856, 77.7312, 'Street Lighting', 'low', 'Street Lighting', 'Flickering lights on highway'),
    (citizen_id, 'Illegal debris dumping near lake entrance', 'Construction rubble and plastic waste dumped overnight on service road.', 'Waste Management', 'high', 'pending', 'Bellandur Outer Ring Road', 12.9298, 77.6748, 'Waste Management', 'high', 'Waste Management', 'Illegal dumping near Bellandur Lake'),
    (citizen_id, 'Traffic signal malfunction at Silk Board', 'Signal stuck on amber in all directions causing gridlock.', 'Road & Infrastructure', 'critical', 'in_progress', 'Central Silk Board Junction', 12.9176, 77.6238, 'Traffic Management', 'critical', 'Traffic Management', 'Signal malfunction causing gridlock'),
    (citizen_id, 'Crater-sized pothole on ORR near Marathahalli', 'Massive pothole covering half the lane causing multiple tyre punctures daily.', 'Road & Infrastructure', 'critical', 'pending', 'Outer Ring Road, Marathahalli Bridge', 12.9563, 77.7009, 'Road & Infrastructure', 'critical', 'Roads & Infrastructure', 'Large crater pothole on busy highway'),
    (citizen_id, 'Road caved in near metro construction site', 'Road surface collapsed adjacent to Namma Metro Phase 2 construction.', 'Road & Infrastructure', 'critical', 'in_progress', 'Dairy Circle, Bannerghatta Road', 12.9380, 77.5982, 'Road & Infrastructure', 'critical', 'Roads & Infrastructure', 'Road collapse at construction site'),
    (citizen_id, 'No water supply for 3 days — RR Nagar', 'Entire layout has not received Cauvery water for 3 days. Residents buying tanker water.', 'Water Supply', 'high', 'pending', 'Rajarajeshwari Nagar, BEML Layout', 12.9259, 77.5199, 'Water & Drainage', 'high', 'Water & Drainage', 'Prolonged water supply disruption'),
    (citizen_id, 'Contaminated brown water from taps — Malleshwaram', 'Brown muddy water flowing from taps for last 2 days. Children in the area have developed stomach infections.', 'Water Supply', 'critical', 'in_progress', 'Malleshwaram, 15th Cross, 8th Main', 13.0030, 77.5700, 'Water & Drainage', 'critical', 'Water & Drainage', 'Contaminated water supply — health risk'),
    (citizen_id, 'Sewage overflowing onto main road — KR Puram', 'Raw sewage flooding the road near railway station. Ankle-deep dirty water.', 'Sewage & Drainage', 'critical', 'pending', 'KR Puram Railway Station Road', 13.0044, 77.6931, 'Water & Drainage', 'critical', 'Water & Drainage', 'Raw sewage flooding public road'),
    (citizen_id, 'Playground equipment broken — Cubbon Park', 'Swings and slides have rusted bolts and sharp edges. A child was injured last week.', 'Parks & Gardens', 'high', 'pending', 'Cubbon Park, Childrens Area', 12.9763, 77.5929, 'Parks & Environment', 'high', 'Parks & Environment', 'Dangerous playground equipment'),
    (citizen_id, 'Burning waste creating toxic smoke — Bommanahalli', 'Open burning of mixed waste including plastics every evening. Thick toxic smoke.', 'Air Quality', 'high', 'pending', 'Bommanahalli, Near Bus Stop', 12.9028, 77.6205, 'Parks & Environment', 'high', 'Parks & Environment', 'Illegal waste burning — air pollution'),
    (citizen_id, 'Bus shelter roof collapsed — Majestic', 'Asbestos roof of bus shelter collapsed after heavy rain. Debris still on platform.', 'Public Transport', 'high', 'in_progress', 'Majestic Bus Station, Platform 12', 12.9771, 77.5713, 'Road & Infrastructure', 'high', 'Roads & Infrastructure', 'Collapsed bus shelter roof')
  on conflict do nothing;

end $$;


-- =========================================================
-- VERIFY SEED DATA
-- =========================================================
select count(*) as total_complaints from public.complaints;
select category, count(*) as count from public.complaints group by category order by count desc;
