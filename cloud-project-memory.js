// OracleToolkit Cloud Project Memory V2
const OT_TABLES={projects:"projects",runs:"accelerator_runs",decisions:"design_decisions",discovery:"discovery_outputs",rice:"rice_items",coa:"coa_memory",testing:"testing_memory",deliverables:"project_deliverables"};
let otProjects=[];let otSelectedProjectId=localStorage.getItem("oracletoolkit_selected_project_id")||"";let otMemory={runs:[],decisions:[],discovery:[],rice:[],coa:[],testing:[],deliverables:[]};
function otById(id){return document.getElementById(id)}function otStatus(m,t="info"){const e=otById("engine-cloud-status");if(e){e.textContent=m;e.className="engine-status "+t}}function otEscape(v){return String(v||"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[s]))}function otToday(){return new Date().toISOString().slice(0,10)}
async function otGetSupabaseClient(){if(!window.supabase?.createClient){otStatus("Supabase library did not load.","error");return null}if(!window.Clerk?.session||!window.Clerk?.user){otStatus("Please login before using Project Memory.","error");return null}try{const token=await window.Clerk.session.getToken({template:"supabase"});if(!token){otStatus("Cloud token missing. Confirm Clerk JWT template named supabase is configured.","error");return null}return window.supabase.createClient(ORACLETK_SUPABASE_URL,ORACLETK_SUPABASE_PUBLISHABLE_KEY,{global:{headers:{Authorization:`Bearer ${token}`}}})}catch(e){console.error(e);otStatus("Cloud auth failed. Check Clerk JWT template and Supabase RLS.","error");return null}}
function otUserId(){return window.Clerk?.user?.id||null}function otBasePayload(){const u=otUserId();return{clerk_user_id:u,project_id:otSelectedProjectId}}function otCurrentProject(){return otProjects.find(p=>p.id===otSelectedProjectId)||null}
function otProjectPayload(){const u=otUserId();return{clerk_user_id:u,project_name:otById("cloud-project-name").value.trim(),client_name:otById("cloud-client-name").value.trim(),sector:otById("cloud-sector").value,phase:otById("cloud-phase").value,module:otById("cloud-module").value.trim(),go_live_date:otById("cloud-golive").value||null,notes:otById("cloud-notes").value.trim(),updated_at:new Date().toISOString()}}
function otFillProject(p){otById("cloud-project-id").value=p?.id||"";otById("cloud-project-name").value=p?.project_name||"";otById("cloud-client-name").value=p?.client_name||"";otById("cloud-sector").value=p?.sector||"Public Sector / K-12";otById("cloud-phase").value=p?.phase||"Discovery & Scope Planning";otById("cloud-module").value=p?.module||"";otById("cloud-golive").value=p?.go_live_date||"";otById("cloud-notes").value=p?.notes||""}
function otTotalMemoryCount(){return Object.values(otMemory).reduce((s,a)=>s+(a?.length||0),0)}
function otRender(){const p=otCurrentProject(),sw=otById("cloud-project-switcher");if(sw){sw.innerHTML='<option value="">Select cloud project...</option>'+otProjects.map(x=>`<option value="${x.id}" ${x.id===otSelectedProjectId?"selected":""}>${otEscape(x.project_name)} — ${otEscape(x.phase||"Phase")}</option>`).join("")}otById("engine-current-project").textContent=p?p.project_name:"No cloud project selected";otById("engine-current-meta").textContent=p?`${p.client_name||"Client"} • ${p.phase||"Phase"} • ${p.module||"Module"}`:"Create or select a project to begin saving project memory.";otById("project-count").textContent=otProjects.length;otById("run-count").textContent=(otMemory.deliverables||[]).length;const pl=otById("cloud-project-list");if(pl){pl.innerHTML=otProjects.length?otProjects.map(x=>`<article class="project-card ${x.id===otSelectedProjectId?"active":""}"><div><strong>${otEscape(x.project_name)}</strong><span>${otEscape(x.client_name||"Client")} • ${otEscape(x.phase||"Phase")}</span></div><button type="button" data-select="${x.id}">Open</button></article>`).join(""):'<div class="empty">No cloud projects yet. Create your first project memory workspace.</div>';pl.querySelectorAll("[data-select]").forEach(b=>b.onclick=()=>otSelectProject(b.getAttribute("data-select")))}otRenderDeliverables();otRenderAllMemory();otUpdateV21LaunchLinks();otUpdateV23LaunchLinks()}
async function otLoadProjects(){const c=await otGetSupabaseClient();if(!c)return;otStatus("Loading cloud project memory...","info");const{data,error}=await c.from(OT_TABLES.projects).select("*").order("updated_at",{ascending:false});if(error){console.error(error);otStatus(`Failed to load projects: ${error.message}`,"error");return}otProjects=data||[];if(otSelectedProjectId&&!otProjects.some(p=>p.id===otSelectedProjectId)){otSelectedProjectId="";localStorage.removeItem("oracletoolkit_selected_project_id")}if(!otSelectedProjectId&&otProjects.length){otSelectedProjectId=otProjects[0].id;localStorage.setItem("oracletoolkit_selected_project_id",otSelectedProjectId)}const p=otCurrentProject();if(p)otFillProject(p);await otLoadAllMemory();otRender();otWireMemoryNavigation();otUpdateV23LaunchLinks();otStatus("Cloud project memory loaded.","success")}
async function otSaveProject(e){e.preventDefault();const c=await otGetSupabaseClient();if(!c)return;const payload=otProjectPayload();if(!payload.project_name){otStatus("Project name is required.","error");return}const id=otById("cloud-project-id").value;const res=id?await c.from(OT_TABLES.projects).update(payload).eq("id",id).select().single():await c.from(OT_TABLES.projects).insert(payload).select().single();if(res.error){console.error(res.error);otStatus(`Save failed: ${res.error.message}`,"error");return}otSelectedProjectId=res.data.id;localStorage.setItem("oracletoolkit_selected_project_id",otSelectedProjectId);await otLoadProjects();otStatus(id?"Project updated in cloud.":"Project created in cloud.","success")}
function otNewProject(){otSelectedProjectId="";localStorage.removeItem("oracletoolkit_selected_project_id");otFillProject(null);otMemory={runs:[],decisions:[],discovery:[],rice:[],coa:[],testing:[],deliverables:[]};otRender();otStatus("Ready to create a new cloud project.","info")}
async function otSelectProject(id){otSelectedProjectId=id||"";localStorage.setItem("oracletoolkit_selected_project_id",otSelectedProjectId);const p=otCurrentProject();if(p)otFillProject(p);await otLoadAllMemory();otRender()}
async function otLoadAllMemory(){otMemory={runs:[],decisions:[],discovery:[],rice:[],coa:[],testing:[],deliverables:[]};if(!otSelectedProjectId)return;const c=await otGetSupabaseClient();if(!c)return;for(const[k,t]of[["runs",OT_TABLES.runs],["decisions",OT_TABLES.decisions],["discovery",OT_TABLES.discovery],["rice",OT_TABLES.rice],["coa",OT_TABLES.coa],["testing",OT_TABLES.testing],["deliverables",OT_TABLES.deliverables]]){const{data,error}=await c.from(t).select("*").eq("project_id",otSelectedProjectId).order("created_at",{ascending:false});if(!error)otMemory[k]=data||[];else{console.error(error);otStatus(`Could not load ${t}: ${error.message}`,"error")}}}
async function otInsertMemory(t,p,msg){if(!otSelectedProjectId){otStatus("Create or select a cloud project before saving memory.","error");return false}const c=await otGetSupabaseClient();if(!c)return false;const{error}=await c.from(t).insert({...otBasePayload(),...p});if(error){console.error(error);otStatus(`Save failed: ${error.message}`,"error");return false}await otLoadAllMemory();otRender();otStatus(msg,"success");return true}
async function otSaveRun(e){e.preventDefault();const notes=otById("run-notes").value.trim();if(!notes){otStatus("Add notes before saving project memory.","error");return}const ok=await otInsertMemory(OT_TABLES.runs,{accelerator_name:otById("run-accelerator").value,module:otById("run-module").value.trim(),status:otById("run-status").value,notes},"General project memory saved.");if(ok)otById("run-notes").value=""}
async function otSaveDecision(e){e.preventDefault();const decision=otById("decision-text").value.trim();if(!decision){otStatus("Decision is required.","error");return}const ok=await otInsertMemory(OT_TABLES.decisions,{decision_id:otById("decision-id").value.trim(),module:otById("decision-module").value.trim(),decision,reason:otById("decision-reason").value.trim(),impact:otById("decision-impact").value.trim(),owner:otById("decision-owner").value.trim(),decision_date:otById("decision-date").value||null,status:otById("decision-status").value},"Design decision saved to Project Memory.");if(ok)otById("design-decision-form").reset()}
async function otSaveDiscovery(e){e.preventDefault();const requirement=otById("discovery-requirement").value.trim();if(!requirement){otStatus("Requirement is required.","error");return}const ok=await otInsertMemory(OT_TABLES.discovery,{requirement,pain_point:otById("discovery-pain").value.trim(),priority:otById("discovery-priority").value,module:otById("discovery-module").value.trim(),open_questions:otById("discovery-open").value.trim()},"Discovery output saved to Project Memory.");if(ok)otById("discovery-output-form").reset()}
async function otSaveRice(e){e.preventDefault();const title=otById("rice-title").value.trim();if(!title){otStatus("RICE title is required.","error");return}const ok=await otInsertMemory(OT_TABLES.rice,{rice_type:otById("rice-type").value,title,description:otById("rice-description").value.trim(),module:otById("rice-module").value.trim(),owner:otById("rice-owner").value.trim(),complexity:otById("rice-complexity").value,status:otById("rice-status").value},"SOW to RICE item saved to Project Memory.");if(ok)otById("rice-memory-form").reset()}
async function otSaveCoa(e){e.preventDefault();const ledger=otById("coa-ledger").value.trim();if(!ledger){otStatus("Ledger is required.","error");return}const ok=await otInsertMemory(OT_TABLES.coa,{ledger,legal_entity:otById("coa-legal-entity").value.trim(),business_unit:otById("coa-bu").value.trim(),segment_structure:otById("coa-segments").value.trim(),hierarchy:otById("coa-hierarchy").value.trim(),financial_categories:otById("coa-financial-categories").value.trim(),notes:otById("coa-notes").value.trim()},"COA memory saved to Project Memory.");if(ok)otById("coa-memory-form").reset()}
async function otSaveTesting(e){e.preventDefault();const scenario=otById("testing-scenario").value.trim();if(!scenario){otStatus("Scenario is required.","error");return}const ok=await otInsertMemory(OT_TABLES.testing,{scenario,module:otById("testing-module").value.trim(),expected_result:otById("testing-expected").value.trim(),status:otById("testing-status").value,evidence_link:otById("testing-evidence").value.trim()},"Testing memory saved to Project Memory.");if(ok)otById("testing-memory-form").reset()}
async function otDeleteMemory(t,id){if(!confirm("Delete this saved project memory item?"))return;const c=await otGetSupabaseClient();if(!c)return;const{error}=await c.from(t).delete().eq("id",id);if(error){otStatus(`Delete failed: ${error.message}`,"error");return}await otLoadAllMemory();otRender();otStatus("Project memory item deleted.","success")}
function otCard(title,body,table,id,meta=""){return `<article class="run-card"><div class="run-card-top"><strong>${otEscape(title)}</strong>${meta?`<em>${otEscape(meta)}</em>`:""}</div><p>${body}</p><div class="run-actions"><button type="button" data-table="${table}" data-delete-id="${id}">Delete</button></div></article>`}

function otDownloadText(filename, content, mime){
  const blob = new Blob([content], {type:mime||"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function otRowsToCsv(rows){
  if(!rows || !rows.length) return "";
  const keys = Array.from(new Set(rows.flatMap(r => Object.keys(r||{}))));
  const esc = v => `"${String(v ?? "").replace(/"/g,'""')}"`;
  return [keys.map(esc).join(","), ...rows.map(r => keys.map(k => esc(r[k])).join(","))].join("\n");
}
function otDownloadDeliverable(id, format){
  const d = (otMemory.deliverables||[]).find(x => x.id === id);
  if(!d){ otStatus("Deliverable not found.","error"); return; }
  const safe = String(d.title || "oracletoolkit-deliverable").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const payload = d.payload_json || {};
  if(format === "csv") otDownloadText(`${safe}.csv`, otRowsToCsv(payload.rows || []), "text/csv");
  else otDownloadText(`${safe}.json`, JSON.stringify(d,null,2), "application/json");
}
function otRenderDeliverables(){
  const el = document.getElementById("saved-deliverables-list");
  if(!el) return;
  const items = otMemory.deliverables || [];
  if(!items.length){
    el.innerHTML = '<div class="empty">No deliverables saved yet. Run an accelerator from Workspace; generated outputs will automatically appear here.</div>';
    return;
  }
  el.innerHTML = items.map(d => {
    const created = d.created_at ? new Date(d.created_at).toLocaleString() : "";
    return `<article class="run-card deliverable-card">
      <div class="run-card-top"><strong class="deliverable-title">📘 ${otEscape(d.title||"Saved Deliverable")}</strong><em>${otEscape(d.status||"Generated")}</em></div>
      <p><strong>Type:</strong> ${otEscape(d.deliverable_type||"")}<br>
      <strong>Source:</strong> ${otEscape(d.source_accelerator||"")}<br>
      <span class="deliverable-metric">${otEscape(d.item_count||0)} RICE Items</span><br>
      <strong>Modules:</strong> ${otEscape(d.module_summary||"")}<br>
      <strong>Created:</strong> ${otEscape(created)}</p>
      <div class="run-actions">
        <button type="button" data-deliverable-json="${d.id}">Download JSON</button>
        <button type="button" data-deliverable-csv="${d.id}">Download CSV</button>
        <button type="button" data-table="${OT_TABLES.deliverables}" data-delete-id="${d.id}">Delete</button>
      </div>
    </article>`;
  }).join("");
  el.querySelectorAll("[data-deliverable-json]").forEach(b=>b.onclick=()=>otDownloadDeliverable(b.getAttribute("data-deliverable-json"),"json"));
  el.querySelectorAll("[data-deliverable-csv]").forEach(b=>b.onclick=()=>otDownloadDeliverable(b.getAttribute("data-deliverable-csv"),"csv"));
  el.querySelectorAll("[data-delete-id]").forEach(b=>b.onclick=()=>{if(confirm("Delete this saved OracleToolkit item? This cannot be undone."))otDeleteMemory(b.getAttribute("data-table"),b.getAttribute("data-delete-id"))});
}

function otRenderAllMemory_legacy(){const list=otById("accelerator-runs-list");if(!list)return;const cards=[];otMemory.decisions.forEach(x=>cards.push(otCard(`Decision ${x.decision_id||""} ${x.module?"• "+x.module:""}`,`<strong>Decision:</strong> ${otEscape(x.decision)}<br><strong>Reason:</strong> ${otEscape(x.reason)}<br><strong>Impact:</strong> ${otEscape(x.impact)}<br><strong>Owner:</strong> ${otEscape(x.owner)}<br><strong>Date:</strong> ${otEscape(x.decision_date)}`,OT_TABLES.decisions,x.id,x.status||"Decision")));otMemory.discovery.forEach(x=>cards.push(otCard(`Discovery • ${x.module||"General"}`,`<strong>Requirement:</strong> ${otEscape(x.requirement)}<br><strong>Pain Point:</strong> ${otEscape(x.pain_point)}<br><strong>Open Questions:</strong> ${otEscape(x.open_questions)}`,OT_TABLES.discovery,x.id,x.priority||"Discovery")));otMemory.rice.forEach(x=>cards.push(otCard(`${x.rice_type||"RICE"} • ${x.title}`,`<strong>Description:</strong> ${otEscape(x.description)}<br><strong>Module:</strong> ${otEscape(x.module)}<br><strong>Owner:</strong> ${otEscape(x.owner)}<br><strong>Complexity:</strong> ${otEscape(x.complexity)}`,OT_TABLES.rice,x.id,x.status||"RICE")));otMemory.coa.forEach(x=>cards.push(otCard(`COA • ${x.ledger||"Ledger"}`,`<strong>Legal Entity:</strong> ${otEscape(x.legal_entity)}<br><strong>BU:</strong> ${otEscape(x.business_unit)}<br><strong>Segments:</strong> ${otEscape(x.segment_structure)}<br><strong>Hierarchy:</strong> ${otEscape(x.hierarchy)}<br><strong>Financial Categories:</strong> ${otEscape(x.financial_categories)}<br><strong>Notes:</strong> ${otEscape(x.notes)}`,OT_TABLES.coa,x.id,"COA")));otMemory.testing.forEach(x=>cards.push(otCard(`Testing • ${x.module||"General"}`,`<strong>Scenario:</strong> ${otEscape(x.scenario)}<br><strong>Expected Result:</strong> ${otEscape(x.expected_result)}<br><strong>Evidence:</strong> ${x.evidence_link?`<a href="${otEscape(x.evidence_link)}" target="_blank" rel="noopener">${otEscape(x.evidence_link)}</a>`:""}`,OT_TABLES.testing,x.id,x.status||"Testing")));otMemory.runs.forEach(x=>cards.push(otCard(x.accelerator_name||"General Memory",`<strong>Module:</strong> ${otEscape(x.module)}<br><strong>Notes:</strong> ${otEscape(x.notes)}`,OT_TABLES.runs,x.id,x.status||"Memory")));list.innerHTML=cards.length?cards.join(""):'<div class="empty">No saved project memory yet. Save a decision, discovery output, RICE item, COA design, or testing scenario.</div>';list.querySelectorAll("[data-delete-id]").forEach(b=>b.onclick=()=>{if(confirm("Delete this saved OracleToolkit item? This cannot be undone."))otDeleteMemory(b.getAttribute("data-table"),b.getAttribute("data-delete-id"))})}

function otSowMemoryLaunchUrl(){
  const p = otCurrentProject();
  if(!p || !p.id || !p.project_memory_key) return "";
  const base = "https://oracletoolkitsowintelligenceengine-fpwsz5tbecde2frxxcr9m9.streamlit.app/";
  const params = new URLSearchParams({
    project_id: p.id,
    project_memory_key: p.project_memory_key,
    clerk_user_id: p.clerk_user_id || "",
    source: "oracletoolkit_workspace"
  });
  return base + "?" + params.toString();
}

function otUpdateV21LaunchLinks(){
  const el = document.getElementById("sow-memory-launch");
  if(!el) return;
  const url = otSowMemoryLaunchUrl();
  if(url){
    el.href = url;
    el.classList.remove("disabled");
    el.textContent = "Open SOW to RICE with Project Memory";
  }else{
    el.href = "#";
    el.classList.add("disabled");
    el.textContent = "Select a project to launch SOW to RICE";
  }
}


let otActiveMemoryFilter = "";
let otMemorySearchTerm = "";

function otDetailedMemoryRows(){
  const rows = [];
  (otMemory.decisions||[]).forEach(x=>rows.push({category:"decisions",type:"Design Decision",title:x.decision_id||x.decision||"Design Decision",module:x.module||"",status:x.status||"",description:[x.decision,x.reason,x.impact,x.owner].filter(Boolean).join(" | "),id:x.id,table:OT_TABLES.decisions}));
  (otMemory.discovery||[]).forEach(x=>rows.push({category:"discovery",type:"Discovery Output",title:x.requirement||"Discovery Output",module:x.module||"",status:x.priority||"",description:[x.pain_point,x.open_questions].filter(Boolean).join(" | "),id:x.id,table:OT_TABLES.discovery}));
  (otMemory.rice||[]).forEach(x=>rows.push({category:"rice",type:x.rice_type||"RICE",title:x.title||"RICE Item",module:x.module||"",status:x.status||"",description:x.description||"",id:x.id,table:OT_TABLES.rice}));
  (otMemory.coa||[]).forEach(x=>rows.push({category:"coa",type:"COA",title:x.ledger||"COA Memory",module:x.business_unit||"",status:"",description:[x.legal_entity,x.segment_structure,x.hierarchy,x.financial_categories,x.notes].filter(Boolean).join(" | "),id:x.id,table:OT_TABLES.coa}));
  (otMemory.testing||[]).forEach(x=>rows.push({category:"testing",type:"Testing",title:x.scenario||"Testing Memory",module:x.module||"",status:x.status||"",description:[x.expected_result,x.evidence_link].filter(Boolean).join(" | "),id:x.id,table:OT_TABLES.testing}));
  (otMemory.runs||[]).forEach(x=>rows.push({category:"runs",type:x.accelerator_name||"Accelerator Note",title:x.accelerator_name||"Accelerator Note",module:x.module||"",status:x.status||"",description:x.notes||"",id:x.id,table:OT_TABLES.runs}));
  return rows;
}

function otSetMemoryFilter(filter){
  otActiveMemoryFilter = filter || "";
  const search = document.getElementById("memory-search");
  if(search) search.value = "";
  otMemorySearchTerm = "";
  document.querySelectorAll("[data-memory-filter]").forEach(btn=>btn.classList.toggle("active", btn.getAttribute("data-memory-filter") === otActiveMemoryFilter));
  const detail = document.getElementById("detailed-memory");
  if(detail) detail.scrollIntoView({behavior:"smooth", block:"start"});
  otRenderAllMemory();
}

function otRenderAllMemory(){
  const el = document.getElementById("accelerator-runs-list");
  if(!el) return;
  let rows = otDetailedMemoryRows();
  const filterMap = {discovery:["discovery"],decisions:["decisions"],coa:["coa"],bcea:["decisions","coa"],rice:["rice"],testing:["testing"],cutover:["runs"],lessons:["runs"]};
  if(otActiveMemoryFilter && filterMap[otActiveMemoryFilter]) rows = rows.filter(r => filterMap[otActiveMemoryFilter].includes(r.category));
  const q = String(otMemorySearchTerm||"").trim().toLowerCase();
  if(q) rows = rows.filter(r => [r.type,r.title,r.module,r.status,r.description].join(" ").toLowerCase().includes(q));
  const active = document.getElementById("active-memory-filter");
  if(active){
    const label = otActiveMemoryFilter ? `Filtered by: ${otActiveMemoryFilter.toUpperCase()}` : "Showing all detailed memory rows";
    active.textContent = `${label} • ${rows.length} row(s)`;
  }
  if(!rows.length){
    el.innerHTML = '<div class="empty">No detailed memory rows found for the selected filter/search.</div>';
    return;
  }
  el.innerHTML = `<div class="memory-table-wrap"><table class="memory-table"><thead><tr><th>Type</th><th>Title / Description</th><th>Module</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${otEscape(r.type)}</strong></td><td><strong>${otEscape(r.title)}</strong><br><span class="small">${otEscape(String(r.description||"").slice(0,260))}</span></td><td>${otEscape(r.module||"")}</td><td>${otEscape(r.status||"")}</td><td><button class="action-btn delete-btn" type="button" data-table="${r.table}" data-delete-id="${r.id}">Delete</button></td></tr>`).join("")}</tbody></table></div>`;
  el.querySelectorAll("[data-delete-id]").forEach(b=>b.onclick=()=>{if(confirm("Delete this saved OracleToolkit item? This cannot be undone."))otDeleteMemory(b.getAttribute("data-table"),b.getAttribute("data-delete-id"))});
}

function otWireMemoryNavigation(){
  document.querySelectorAll("[data-memory-filter]").forEach(btn=>btn.onclick=()=>otSetMemoryFilter(btn.getAttribute("data-memory-filter")));
  const search = document.getElementById("memory-search");
  if(search) search.oninput=()=>{otMemorySearchTerm=search.value||"";otRenderAllMemory();};
  const clear = document.getElementById("memory-clear-filter");
  if(clear) clear.onclick=()=>{otActiveMemoryFilter="";otMemorySearchTerm="";if(search) search.value="";document.querySelectorAll("[data-memory-filter]").forEach(b=>b.classList.remove("active"));otRenderAllMemory();};
}


function otCoaMemoryLaunchUrl(){
  const p = otCurrentProject();
  if(!p || !p.id || !p.project_memory_key) return "";
  const base = "https://oraclecoaacceleratorv2optionalcrosswalk.streamlit.app/";
  const params = new URLSearchParams({
    project_id: p.id,
    project_memory_key: p.project_memory_key,
    clerk_user_id: p.clerk_user_id || "",
    source: "oracletoolkit_workspace"
  });
  return base + "?" + params.toString();
}

function otUpdateV23LaunchLinks(){
  const el = document.getElementById("coa-memory-launch");
  if(!el) return;
  const url = otCoaMemoryLaunchUrl();
  if(url){
    el.href = url;
    el.classList.remove("disabled");
    el.textContent = "Open COA Accelerator with Project Memory";
  }else{
    el.href = "#";
    el.classList.add("disabled");
    el.textContent = "Select a project to launch COA Accelerator";
  }
}

function otExportJson(){const data={projects:otProjects,selected_project_id:otSelectedProjectId,project_memory:otMemory};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="oracletoolkit-project-memory-v2.json";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}
function otWireProjectMemory(){otById("cloud-project-form")?.addEventListener("submit",otSaveProject);otById("cloud-new-project-btn")?.addEventListener("click",otNewProject);otById("cloud-refresh-projects-btn")?.addEventListener("click",otLoadProjects);otById("cloud-project-switcher")?.addEventListener("change",e=>otSelectProject(e.target.value));otById("accelerator-run-form")?.addEventListener("submit",otSaveRun);otById("design-decision-form")?.addEventListener("submit",otSaveDecision);otById("discovery-output-form")?.addEventListener("submit",otSaveDiscovery);otById("rice-memory-form")?.addEventListener("submit",otSaveRice);otById("coa-memory-form")?.addEventListener("submit",otSaveCoa);otById("testing-memory-form")?.addEventListener("submit",otSaveTesting);otById("export-json")?.addEventListener("click",otExportJson);const d=otById("decision-date");if(d&&!d.value)d.value=otToday()}
