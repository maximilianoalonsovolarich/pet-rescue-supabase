-- Create a function to allow executing arbitrary SQL from the REST API
-- This is needed for our setup.js script to work
-- IMPORTANT: Only use this in development environments and remove in production

CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
-- Set a secure search_path to limit risks
SET search_path = public
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;