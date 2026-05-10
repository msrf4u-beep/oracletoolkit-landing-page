// OracleToolkit v11 auth.js — Clerk Authentication Layer
let clerkReady = false;
function gtagSafe(eventName){ if(typeof gtag === 'function'){ gtag('event', eventName); } }
function showLoggedOutUI(){
  const loginArea=document.getElementById('login-area');
  const dashboardArea=document.getElementById('dashboard-area');
  if(loginArea) loginArea.innerHTML='<button id="login-button">Login / Sign Up</button>';
  if(dashboardArea) dashboardArea.style.display='none';
  const loginButton=document.getElementById('login-button');
  if(loginButton) loginButton.addEventListener('click', openLogin);
}
function getDisplayName(user){
  if(!user) return 'Consultant User';
  return user.firstName || user.fullName || (user.primaryEmailAddress && user.primaryEmailAddress.emailAddress.split('@')[0]) || 'Consultant User';
}
function showLoggedInUI(){
  const loginArea=document.getElementById('login-area');
  const dashboardArea=document.getElementById('dashboard-area');
  if(loginArea && window.Clerk){
    loginArea.innerHTML='<div id="user-button"></div>';
    window.Clerk.mountUserButton(document.getElementById('user-button'));
  }
  if(dashboardArea) dashboardArea.style.display='block';
  const name=getDisplayName(window.Clerk && window.Clerk.user);
  const dashName=document.getElementById('dashboard-user-name');
  const sideName=document.getElementById('sidebar-user-name');
  if(dashName) dashName.textContent=name;
  if(sideName) sideName.textContent=name;
  gtagSafe('member_dashboard_visible');
}
async function initializeClerk(){
  if(!window.Clerk) return false;
  if(!clerkReady){ await window.Clerk.load(); clerkReady=true; }
  if(window.Clerk.user) showLoggedInUI(); else showLoggedOutUI();
  return true;
}
async function openLogin(){
  try{
    if(!window.Clerk){ alert('Authentication is still loading. Please wait 2 seconds and retry.'); return; }
    await initializeClerk();
    if(window.Clerk.user) showLoggedInUI(); else { gtagSafe('login_modal_opened'); window.Clerk.openSignIn(); }
  }catch(err){ console.error('Clerk Error:',err); alert('Login temporarily unavailable. Please check the browser console error.'); }
}
function wireDashboardNav(){
  const dashboardNav=document.getElementById('dashboard-nav-link');
  if(dashboardNav){ dashboardNav.addEventListener('click', async function(e){ if(!window.Clerk || !window.Clerk.user){ e.preventDefault(); await openLogin(); } }); }
}
window.addEventListener('load', async function(){
  showLoggedOutUI();
  wireDashboardNav();
  setTimeout(async function(){ try{ await initializeClerk(); }catch(err){ console.warn('Clerk background load warning:',err); } },600);
});
