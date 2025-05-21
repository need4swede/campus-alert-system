-- Seed data for Campus Alert System

-- Insert default organization
INSERT INTO organizations (
  id,
  name,
  domain,
  logo_url,
  primary_color,
  secondary_color,
  evacuation_location,
  shelter_hazard_type
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default School District',
  'example.edu',
  'https://example.edu/logo.png',
  '#007bff',
  '#6c757d',
  'Main Parking Lot',
  'Tornado'
);

-- Insert default admin user
INSERT INTO users (
  id,
  organization_id,
  name,
  email,
  role,
  avatar_url
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Super Admin User',
  'admin@example.edu',
  'super-admin',
  'https://example.edu/avatar.png'
);

-- Insert default regular user
INSERT INTO users (
  id,
  organization_id,
  name,
  email,
  role,
  avatar_url
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Regular User',
  'user@example.edu',
  'user',
  'https://example.edu/avatar2.png'
);

-- Insert a sample alert (resolved)
INSERT INTO alerts (
  id,
  organization_id,
  type,
  initiated_by,
  timestamp,
  active,
  resolved_by,
  resolved_at,
  location,
  note
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'lockdown',
  '00000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '1 day',
  FALSE,
  '00000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '23 hours',
  'Main Building',
  'This is a sample resolved alert for testing purposes.'
);

-- Insert a sample device
INSERT INTO devices (
  id,
  user_id,
  organization_id,
  device_token,
  device_type,
  device_name,
  os_version,
  app_version,
  last_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'sample_device_token_for_testing',
  'iOS',
  'iPhone 15 Pro',
  'iOS 18.0',
  '1.0.0',
  NOW() - INTERVAL '1 hour'
);
