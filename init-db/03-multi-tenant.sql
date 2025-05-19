-- Multi-tenant functionality for Campus Alert System

-- Create a function to enforce organization isolation
CREATE OR REPLACE FUNCTION check_organization_access()
RETURNS TRIGGER AS $$
DECLARE
  current_organization_id UUID;
BEGIN
  -- Get the current organization ID from the application context
  -- In a real implementation, this would be set by the application
  -- For testing purposes, we'll use a default value
  current_organization_id := current_setting('app.current_organization_id', TRUE);

  -- If no organization ID is set, allow the operation (for initial setup)
  IF current_organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- For INSERT operations, set the organization_id if not provided
  IF TG_OP = 'INSERT' AND NEW.organization_id IS NULL THEN
    NEW.organization_id := current_organization_id;
    RETURN NEW;
  END IF;

  -- For all operations, check that the organization_id matches the current organization
  IF NEW.organization_id::TEXT = current_organization_id THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Access denied to data from another organization';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to set the current organization context
CREATE OR REPLACE FUNCTION set_organization_context(org_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_organization_id', org_id::TEXT, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Create a function to clear the organization context
CREATE OR REPLACE FUNCTION clear_organization_context()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_organization_id', NULL, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to enforce organization isolation
CREATE TRIGGER enforce_users_organization
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION check_organization_access();

CREATE TRIGGER enforce_alerts_organization
BEFORE INSERT OR UPDATE ON alerts
FOR EACH ROW EXECUTE FUNCTION check_organization_access();

CREATE TRIGGER enforce_devices_organization
BEFORE INSERT OR UPDATE ON devices
FOR EACH ROW EXECUTE FUNCTION check_organization_access();

-- Create row-level security policies
-- Enable row-level security on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY users_isolation_policy ON users
  USING (organization_id::TEXT = current_setting('app.current_organization_id', TRUE));

-- Create policies for alerts table
CREATE POLICY alerts_isolation_policy ON alerts
  USING (organization_id::TEXT = current_setting('app.current_organization_id', TRUE));

-- Create policies for devices table
CREATE POLICY devices_isolation_policy ON devices
  USING (organization_id::TEXT = current_setting('app.current_organization_id', TRUE));

-- Create a superuser role that bypasses RLS
CREATE ROLE campus_alert_superuser;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE alerts FORCE ROW LEVEL SECURITY;
ALTER TABLE devices FORCE ROW LEVEL SECURITY;

-- Allow superusers to bypass RLS
CREATE POLICY superuser_users_policy ON users
  USING (pg_has_role(current_user, 'campus_alert_superuser', 'MEMBER'));

CREATE POLICY superuser_alerts_policy ON alerts
  USING (pg_has_role(current_user, 'campus_alert_superuser', 'MEMBER'));

CREATE POLICY superuser_devices_policy ON devices
  USING (pg_has_role(current_user, 'campus_alert_superuser', 'MEMBER'));

-- Example usage:
-- To set the current organization context:
-- SELECT set_organization_context('00000000-0000-0000-0000-000000000001');
--
-- To clear the organization context:
-- SELECT clear_organization_context();
--
-- To test the isolation:
-- SELECT set_organization_context('00000000-0000-0000-0000-000000000001');
-- SELECT * FROM users; -- Should only show users from the specified organization
