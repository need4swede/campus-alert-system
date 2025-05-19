-- Test data for multi-tenant functionality

-- Insert a second organization
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
  '00000000-0000-0000-0000-000000000002',
  'Second School District',
  'second.edu',
  'https://second.edu/logo.png',
  '#28a745',
  '#343a40',
  'Football Field',
  'Hurricane'
);

-- Insert admin user for second organization
INSERT INTO users (
  id,
  organization_id,
  name,
  email,
  role,
  avatar_url
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'Second Admin',
  'admin@second.edu',
  'admin',
  'https://second.edu/avatar.png'
);

-- Insert regular user for second organization
INSERT INTO users (
  id,
  organization_id,
  name,
  email,
  role,
  avatar_url
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000002',
  'Second User',
  'user@second.edu',
  'user',
  'https://second.edu/avatar2.png'
);

-- Insert a sample alert for second organization
INSERT INTO alerts (
  id,
  organization_id,
  type,
  initiated_by,
  timestamp,
  active,
  location,
  note
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'evacuate',
  '00000000-0000-0000-0000-000000000003',
  NOW() - INTERVAL '2 hours',
  TRUE,
  'Science Building',
  'This is an active alert for the second organization.'
);

-- Insert a sample device for second organization
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
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000002',
  'second_org_device_token',
  'iOS',
  'iPhone 15',
  'iOS 18.0',
  '1.0.0',
  NOW() - INTERVAL '30 minutes'
);

-- Test multi-tenant isolation
-- First, clear any existing context
SELECT clear_organization_context();

-- Set context to first organization
SELECT set_organization_context('00000000-0000-0000-0000-000000000001');

-- Create a comment to show the results
COMMENT ON FUNCTION set_organization_context(UUID) IS 'When context is set to first organization, the following query would show only users from the first organization:
SELECT * FROM users;';

-- Set context to second organization
SELECT set_organization_context('00000000-0000-0000-0000-000000000002');

-- Create a comment to show the results
COMMENT ON FUNCTION clear_organization_context() IS 'When context is set to second organization, the following query would show only users from the second organization:
SELECT * FROM users;';

-- Clear the context when done
SELECT clear_organization_context();
