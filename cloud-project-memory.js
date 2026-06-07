// OracleToolkit Cloud Project Memory
// Clerk = authentication. Supabase = project memory storage.

const OT_TOOL_URLS = {
  "Discovery Command Center Pro": "https://discoverycommandcenterpro-fu9jxdqbb4qtc28jexi7ul.streamlit.app/",
  "Enterprise Structure Intelligence": "https://enterprise-structure-intelligence-fgps56livskgqsfixq7psw.streamlit.app/",
  "COA Accelerator": "https://coaacceleratormvp-immxr6kprgxex4wkhomcby.streamlit.app/",
  "BCEA Architect": "https://budgetarycontrol-architectv3-yt4uifrftfksbjezcycgak.streamlit.app/",
  "SOW to RICE Intelligence": "https://oracletoolkitsowintelligenceengine-fpwsz5tbecde2frxxcr9m9.streamlit.app/",
  "Configuration Readiness Engine": "https://configurationreadinessengine-witvv25ai2u2hb3lvw9qgt.streamlit.app/",
  "Scenario Intelligence Engine": "https://scenariointelligenceengine-fpjfpn7dhpfe36dtylrbc3.streamlit.app/",
  "Journal Approvals Accelerator": "https://jounralapprovals-eejttydzbfzelpu5d5azvx.streamlit.app/",
  "AP Invoice Approvals Accelerator": "https://apinvoiceapprovals-prvs4kmw9bmfjnc5qm3rdw.streamlit.app/",
  "Per Diem Transformation Engine": "https://perdiem-toolkit-2j5pceprutup553f6c5mvm.streamlit.app/",
  "Design Decision": "#",
  "Open Question": "#",
  "Readiness Blocker": "#",
  "Cutover Action": "#",
  "Risk / Issue": "#"
};

let otProjects = [];
let otRuns = [];
let otSelectedProjectId = localStorage.getItem("oracletoolkit_selected_project_id") || "";

function otById(id){ return document.getElementById(id); }
function otShow(id){ const el = otById(id); if(el) el.classList.remove("hidden"); }
function otHide(id){ const el = otById(id); if(el) el.classList.add("hidden"); }
function otStatus(message, type="info"){
  const el = otById("engine-cloud-status");
  if(!el) return;
  el.textContent = message;
  el.className = "engine-status " + type;
}
function otEscape(value){
  return String(value || "").replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
}

async function otGetSupabaseClient(){
  if(!window.supabase || !window.supabase.createClient){
    otStatus("Supabase library did not load.", "error");
    return null;
  }
  if(!window.Clerk || !window.Clerk.session || !window.Clerk.user){
    otStatus("Please login before using Project Memory.", "error");
    return null;
  }
  try{
    const token = await window.Clerk.session.getToken({ template: "supabase" });
    if(!token){
      otStatus("Cloud token missing. Check Clerk JWT template named 'supabase'.", "error");
      return null;
    }
    return window.supabase.createClient(
      ORACLETK_SUPABASE_URL,
      ORACLETK_SUPABASE_PUBLISHABLE_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
  }catch(error){
    console.error("Cloud auth error:", error);
    otStatus("Cloud auth failed. Check Clerk JWT template and Supabase RLS.", "error");
    return null;
  }
}

function otProjectPayload(){
  return {
    project_name: otById("cloud-project-name").value.trim(),
    client_name: otById("cloud-client-name").value.trim(),
    sector: otById("cloud-sector").value,
    phase: otById("cloud-phase").value,
    module: otById("cloud-module").value.trim(),
    go_live_date: otById("cloud-golive").value || null,
    notes: otById("cloud-notes").value.trim(),
    updated_at: new Date().toISOString()
  };
}

function otFillProject(project){
  otById("cloud-project-id").value = project?.id || "";
  otById("cloud-project-name").value = project?.project_name || "";
  otById("cloud-client-name").value = project?.client_name || "";
  otById("cloud-sector").value = project?.sector || "Public Sector / K-12";
  otById("cloud-phase").value = project?.phase || "Discovery & Scope Planning";
  otById("cloud-module").value = project?.module || "";
  otById("cloud-golive").value = project?.go_live_date || "";
  otById("cloud-notes").value = project?.notes || "";
}

function otCurrentProject(){
  return otProjects.find(p => p.id === otSelectedProjectId) || null;
}

function otRender(){
  const project = otCurrentProject();
  const switcher = otById("cloud-project-switcher");
  if(switcher){
    switcher.innerHTML = '<option value="">Select cloud project...</option>' + otProjects.map(p =>
      `<option value="${p.id}" ${p.id === otSelectedProjectId ? "selected" : ""}>${otEscape(p.project_name)} — ${otEscape(p.phase || "Phase")}</option>`
    ).join("");
  }

  otById("engine-current-project").textContent = project ? project.project_name : "No cloud project selected";
  otById("engine-current-meta").textContent = project
    ? `${project.client_name || "Client"} • ${project.phase || "Phase"} • ${project.module || "Module"}`
    : "Create or select a project to begin saving project memory.";
  otById("project-count").textContent = otProjects.length;
  otById("run-count").textContent = otRuns.length;

  const projectList = otById("cloud-project-list");
  if(projectList){
    if(!otProjects.length){
      projectList.innerHTML = '<div class="empty">No cloud projects yet. Create your first project memory workspace.</div>';
    } else {
      projectList.innerHTML = otProjects.map(p => `
        <article class="project-card ${p.id === otSelectedProjectId ? "active" : ""}">
          <div><strong>${otEscape(p.project_name)}</strong><span>${otEscape(p.client_name || "Client")} • ${otEscape(p.phase || "Phase")}</span></div>
          <button type="button" data-select="${p.id}">Open</button>
        </article>
      `).join("");
      projectList.querySelectorAll("[data-select]").forEach(btn => {
        btn.onclick = () => otSelectProject(btn.getAttribute("data-select"));
      });
    }
  }
  otRenderRuns();
}

function otRenderRuns(){
  const list = otById("accelerator-runs-list");
  if(!list) return;
  if(!otRuns.length){
    list.innerHTML = '<div class="empty">No saved project memory yet. Save a decision, activity, blocker, or accelerator run.</div>';
    return;
  }
  list.innerHTML = otRuns.map(run => {
    const url = OT_TOOL_URLS[run.accelerator_name] || "#";
    const launch = url === "#" ? "" : `<a href="${url}" target="_blank" rel="noopener">Launch Related Tool</a>`;
    return `
      <article class="run-card">
        <div class="run-card-top">
          <strong>${otEscape(run.accelerator_name)}</strong>
          <em>${otEscape(run.status || "Status")}</em>
        </div>
        <div class="run-card-meta">
          <span>${otEscape(run.module || "General")}</span>
          <span>${otEscape(new Date(run.created_at).toLocaleString())}</span>
        </div>
        <p>${otEscape(run.notes || "No notes added.")}</p>
        <div class="run-actions">
          ${launch}
          <button type="button" data-delete-run="${run.id}">Delete</button>
        </div>
      </article>
    `;
  }).join("");
  list.querySelectorAll("[data-delete-run]").forEach(btn => {
    btn.onclick = () => otDeleteRun(btn.getAttribute("data-delete-run"));
  });
}

async function otLoadProjects(){
  const client = await otGetSupabaseClient();
  if(!client) return;
  otStatus("Loading cloud project memory...", "info");
  const { data, error } = await client.from("projects").select("*").order("updated_at", { ascending:false });
  if(error){
    console.error(error);
    otStatus(`Failed to load projects: ${error.message}`, "error");
    return;
  }
  otProjects = data || [];
  if(otSelectedProjectId && !otProjects.some(p => p.id === otSelectedProjectId)){
    otSelectedProjectId = "";
    localStorage.removeItem("oracletoolkit_selected_project_id");
  }
  if(!otSelectedProjectId && otProjects.length){
    otSelectedProjectId = otProjects[0].id;
    localStorage.setItem("oracletoolkit_selected_project_id", otSelectedProjectId);
  }
  const project = otCurrentProject();
  if(project) otFillProject(project);
  await otLoadRuns();
  otRender();
  otStatus("Cloud project memory loaded.", "success");
}

async function otSaveProject(event){
  event.preventDefault();
  const client = await otGetSupabaseClient();
  if(!client) return;
  const payload = otProjectPayload();
  if(!payload.project_name){
    otStatus("Project name is required.", "error");
    return;
  }
  const projectId = otById("cloud-project-id").value;
  otStatus(projectId ? "Updating cloud project..." : "Creating cloud project...", "info");
  let result;
  if(projectId){
    result = await client.from("projects").update(payload).eq("id", projectId).select().single();
  }else{
    result = await client.from("projects").insert(payload).select().single();
  }
  if(result.error){
    console.error(result.error);
    otStatus(`Save failed: ${result.error.message}`, "error");
    return;
  }
  otSelectedProjectId = result.data.id;
  localStorage.setItem("oracletoolkit_selected_project_id", otSelectedProjectId);
  await otLoadProjects();
  otStatus(projectId ? "Project updated in cloud." : "Project created in cloud.", "success");
}

async function otSelectProject(projectId){
  otSelectedProjectId = projectId || "";
  localStorage.setItem("oracletoolkit_selected_project_id", otSelectedProjectId);
  const project = otCurrentProject();
  if(project) otFillProject(project);
  await otLoadRuns();
  otRender();
}

function otNewProject(){
  otSelectedProjectId = "";
  localStorage.removeItem("oracletoolkit_selected_project_id");
  otFillProject(null);
  otRuns = [];
  otRender();
  otStatus("Ready to create a new cloud project.", "info");
}

async function otLoadRuns(){
  if(!otSelectedProjectId){
    otRuns = [];
    return;
  }
  const client = await otGetSupabaseClient();
  if(!client) return;
  const { data, error } = await client
    .from("accelerator_runs")
    .select("*")
    .eq("project_id", otSelectedProjectId)
    .order("created_at", { ascending:false });
  if(error){
    console.error(error);
    otStatus(`Could not load project memory: ${error.message}`, "error");
    return;
  }
  otRuns = data || [];
}

async function otSaveRun(event){
  event.preventDefault();
  if(!otSelectedProjectId){
    otStatus("Create or select a cloud project before saving memory.", "error");
    return;
  }
  const client = await otGetSupabaseClient();
  if(!client) return;
  const payload = {
    project_id: otSelectedProjectId,
    accelerator_name: otById("run-accelerator").value,
    module: otById("run-module").value.trim(),
    status: otById("run-status").value,
    notes: otById("run-notes").value.trim()
  };
  if(!payload.notes){
    otStatus("Add notes before saving project memory.", "error");
    return;
  }
  const { error } = await client.from("accelerator_runs").insert(payload);
  if(error){
    console.error(error);
    otStatus(`Project memory save failed: ${error.message}`, "error");
    return;
  }
  otById("run-notes").value = "";
  await otLoadRuns();
  otRender();
  otStatus("Project memory saved to Supabase cloud.", "success");
}

async function otDeleteRun(runId){
  if(!confirm("Delete this saved project memory item?")) return;
  const client = await otGetSupabaseClient();
  if(!client) return;
  const { error } = await client.from("accelerator_runs").delete().eq("id", runId);
  if(error){
    otStatus(`Delete failed: ${error.message}`, "error");
    return;
  }
  await otLoadRuns();
  otRender();
  otStatus("Project memory item deleted.", "success");
}

function otExportJson(){
  const data = { projects: otProjects, selected_project_id: otSelectedProjectId, project_memory: otRuns };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "oracletoolkit-cloud-project-memory.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function otWireProjectMemory(){
  otById("cloud-project-form")?.addEventListener("submit", otSaveProject);
  otById("cloud-new-project-btn")?.addEventListener("click", otNewProject);
  otById("cloud-refresh-projects-btn")?.addEventListener("click", otLoadProjects);
  otById("cloud-project-switcher")?.addEventListener("change", e => otSelectProject(e.target.value));
  otById("accelerator-run-form")?.addEventListener("submit", otSaveRun);
  otById("export-json")?.addEventListener("click", otExportJson);
}
