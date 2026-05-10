// OracleToolkit v11 dashboard.js — dashboard interactions
window.addEventListener('load', function(){
  const searchInput=document.getElementById('dashboard-search');
  const toolCards=Array.from(document.querySelectorAll('[data-tool-card]'));
  if(searchInput){
    searchInput.addEventListener('input', function(){
      const value=searchInput.value.toLowerCase().trim();
      toolCards.forEach((card)=>{ card.style.display=card.textContent.toLowerCase().includes(value) ? 'block' : 'none'; });
    });
  }
});
