(function () {
  const LOGIN_URL = "dashboard.html";
  const DASHBOARD_URL = "dashboard.html";

  function byId(id) { return document.getElementById(id); }
  function show(el) { if (el) el.classList.remove("hidden"); }
  function hide(el) { if (el) el.classList.add("hidden"); }
  function safeSetText(el, value) { if (el) el.textContent = value || ""; }

  function getLocalUser() {
    try {
      const raw = localStorage.getItem("oracletoolkit_user") || localStorage.getItem("ot_user") || localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

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
    const label = (user && (user.email || user.name || user.fullName || user.username)) || "Signed in";
    safeSetText(byId("user-pill"), label);
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
    const localUser = getLocalUser();
    if (localUser) setLoggedInUi(localUser);
    else setLoggedOutUi();
  }

  function attachHandlers() {
    const loginButton = byId("login-button");
    const logoutButton = byId("logout-button");
    const dashboardButton = byId("dashboard-button");

    if (loginButton) {
      loginButton.addEventListener("click", function () {
        window.location.href = LOGIN_URL;
      });
    }

    if (dashboardButton) {
      dashboardButton.addEventListener("click", function () {
        window.location.href = DASHBOARD_URL;
      });
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", async function () {
        try {
          if (window.supabaseClient && window.supabaseClient.auth) {
            await window.supabaseClient.auth.signOut();
          }
        } catch (e) {}
        try {
          localStorage.removeItem("oracletoolkit_user");
          localStorage.removeItem("ot_user");
          localStorage.removeItem("user");
        } catch (e) {}
        setLoggedOutUi();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    attachHandlers();
    detectSession();
    setTimeout(detectSession, 800);
    setTimeout(detectSession, 2000);
  });

  window.OracleToolkitAuth = { refresh: detectSession, setLoggedOutUi, setLoggedInUi };
})();