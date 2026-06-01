(function () {
  const LOGIN_URL = "workspace.html";
  const DASHBOARD_URL = "workspace.html";

  function byId(id) { return document.getElementById(id); }
  function show(el) { if (el) el.classList.remove("hidden"); }
  function hide(el) { if (el) el.classList.add("hidden"); }
  function safeSetText(el, value) { if (el) el.textContent = value || ""; }

  function setLoggedOutUi() {
    show(byId("login-button"));
    hide(byId("logout-button"));
    hide(byId("dashboard-button"));
    hide(byId("user-pill"));
    safeSetText(byId("user-pill"), "");
  }

  function setLoggedInUi(user) {
    hide(byId("login-button"));
    show(byId("logout-button"));
    show(byId("dashboard-button"));
    show(byId("user-pill"));
    safeSetText(byId("user-pill"), (user && (user.email || user.name)) || "Signed in");
  }

  async function detectSession() {
    try {
      if (window.supabaseClient && window.supabaseClient.auth) {
        const result = await window.supabaseClient.auth.getSession();
        const session = result && result.data ? result.data.session : null;
        if (session && session.user) {
          setLoggedInUi(session.user);
          return;
        }
      }
    } catch (e) {}
    setLoggedOutUi();
  }

  function goWorkspace() { window.location.href = LOGIN_URL; }

  function attachHandlers() {
    const loginButton = byId("login-button");
    const dashboardButton = byId("dashboard-button");
    const logoutButton = byId("logout-button");

    if (loginButton) loginButton.onclick = goWorkspace;
    if (dashboardButton) dashboardButton.onclick = goWorkspace;

    if (logoutButton) {
      logoutButton.onclick = async function () {
        try {
          if (window.supabaseClient && window.supabaseClient.auth) {
            await window.supabaseClient.auth.signOut();
          }
        } catch (e) {}
        setLoggedOutUi();
      };
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    attachHandlers();
    detectSession();
    setTimeout(function () {
      attachHandlers();
      detectSession();
    }, 800);
  });

  window.OracleToolkitAuth = { refresh: detectSession, setLoggedOutUi, setLoggedInUi };
})();