// OracleToolkit Clerk Authentication Layer
let oracleToolkitClerkReady = false;
function gtagSafe(eventName){ try{ if(typeof gtag === 'function') gtag('event', eventName); }catch(e){} }
function otById(id){ return document.getElementById(id); }
function otShow(el){ if(el) el.classList.remove('hidden'); }
function otHide(el){ if(el) el.classList.add('hidden'); }
function otText(el, value){ if(el) el.textContent = value || ''; }
function otDisplayName(user){
  if(!user) return 'Signed in';
  return user.firstName || user.fullName || (user.primaryEmailAddress && user.primaryEmailAddress.emailAddress) || 'Signed in';
}
function showLoggedOutUI(){
  otShow(otById('login-button'));
  otHide(otById('logout-button'));
  otHide(otById('dashboard-button'));
  otHide(otById('user-pill'));
  otText(otById('user-pill'), '');
}
function showLoggedInUI(){
  otHide(otById('login-button'));
  otShow(otById('logout-button'));
  otShow(otById('dashboard-button'));
  otShow(otById('user-pill'));
  otText(otById('user-pill'), otDisplayName(window.Clerk && window.Clerk.user));
}
async function initializeClerk(){
  if(!window.Clerk) return false;
  if(!oracleToolkitClerkReady){ await window.Clerk.load(); oracleToolkitClerkReady = true; }
  if(window.Clerk.user) showLoggedInUI(); else showLoggedOutUI();
  return true;
}
async function openLogin(){
  try{
    sessionStorage.setItem('ot_login_intent','workspace');
    if(!window.Clerk){ window.location.href = "login.html"; return; }
    await initializeClerk();
    if(window.Clerk.user){ window.location.href = "workspace.html"; return; }
    gtagSafe('login_modal_opened');
    window.Clerk.openSignIn({ afterSignInUrl: window.location.origin + '/workspace.html', afterSignUpUrl: window.location.origin + '/workspace.html' });
  }catch(err){ console.error('Clerk Error:', err); window.location.href = "login.html"; }
}
async function logoutClerk(){
  try{
    if(window.Clerk){ await initializeClerk(); await window.Clerk.signOut(); }
  }catch(err){ console.warn('Logout warning:', err); }
  sessionStorage.removeItem('ot_login_intent');
  showLoggedOutUI();
}
function wireAuthButtons(){
  const loginButton = otById('login-button');
  const dashboardButton = otById('dashboard-button');
  const logoutButton = otById('logout-button');
  if(loginButton) loginButton.onclick = openLogin;
  if(dashboardButton) dashboardButton.onclick = function(){ window.location.href = "workspace.html"; };
  if(logoutButton) logoutButton.onclick = logoutClerk;
}
window.addEventListener('load', async function(){
  wireAuthButtons();
  showLoggedOutUI();
  setTimeout(async function(){
    try{
      await initializeClerk();
      if(window.Clerk && window.Clerk.addListener){
        window.Clerk.addListener(function(){
          if(window.Clerk.user){
            showLoggedInUI();
            if(sessionStorage.getItem('ot_login_intent') === 'workspace'){
              sessionStorage.removeItem('ot_login_intent');
              window.location.href = "workspace.html";
            }
          } else showLoggedOutUI();
        });
      }
    }catch(err){ console.warn('Clerk background load warning:', err); showLoggedOutUI(); }
  }, 350);
});
