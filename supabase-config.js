// OracleToolkit Supabase Configuration
// Supabase is reserved for cloud project data storage. Clerk remains the authentication provider.
const ORACLETK_SUPABASE_URL = "https://qhptsxmsebhsfqzjuqrd.supabase.co";
const ORACLETK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_reZtzPTOQCGTnIzIRva4ww_3T6u5Vbs";
(function () {
  function initOracleToolkitSupabase() {
    if (!window.supabase || !window.supabase.createClient) return;
    if (window.supabaseClient) return;
    window.supabaseClient = window.supabase.createClient(ORACLETK_SUPABASE_URL, ORACLETK_SUPABASE_PUBLISHABLE_KEY);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initOracleToolkitSupabase);
  else initOracleToolkitSupabase();
  window.initOracleToolkitSupabase = initOracleToolkitSupabase;
})();
