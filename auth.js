(function () {
  const LOGIN_URL = "login.html";
  const WORKSPACE_URL = "workspace.html";

  function byId(id) { return document.getElementById(id); }
  function show(el) { if (el) el.classList.remove("hidden"); }
  function hide(el) { if (el) el.classList.add("hidden"); }
  function text(el, value) { if (el) el.textContent = value || ""; }

  function setLoggedOutUi() {
    show(byId("login-button"));
    hide(byId("logout-button"));
    hide(byId("dashboard-button"));
    hide(byId("user-pill"));
    text(byId("user-pill"), "");
  }

  function setLoggedInUi(user) {
    hide(byId("login-button"));
    show(byId("logout-button"));
    show(byId("dashboard-button"));
    show(byId("user-pill"));
    text(byId("user-pill"), (user && (user.email || user.user_metadata?.full_name)) || "Signed in");
  }

  async function getClient() {
    if (window.initOracleToolkitSupabase) window.initOracleToolkitSupabase();
    return window.supabaseClient || null;
  }

  async function refreshAuthUi() {
    const client = await getClient();
    if (!client) {
      setLoggedOutUi();
      return;
    }

    try {
      const { data } = await client.auth.getSession();
      const session = data && data.session;
      if (session && session.user) setLoggedInUi(session.user);
      else setLoggedOutUi();
    } catch (e) {
      setLoggedOutUi();
    }
  }

  function attachHandlers() {
    const login = byId("login-button");
    const dashboard = byId("dashboard-button");
    const logout = byId("logout-button");

    if (login) login.onclick = function () { window.location.href = LOGIN_URL; };
    if (dashboard) dashboard.onclick = function () { window.location.href = WORKSPACE_URL; };

    if (logout) {
      logout.onclick = async function () {
        const client = await getClient();
        if (client) {
          try { await client.auth.signOut(); } catch(e) {}
        }
        setLoggedOutUi();
      };
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    attachHandlers();
    refreshAuthUi();
    setTimeout(refreshAuthUi, 1200);
  });

  window.OracleToolkitAuth = { refresh: refreshAuthUi, setLoggedOutUi, setLoggedInUi };
})();