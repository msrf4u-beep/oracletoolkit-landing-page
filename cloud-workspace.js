// OracleToolkit Cloud Workspace Engine v2
// Proper multi-project switching + saved accelerator runs.
// Requires Clerk JWT template named "supabase" and Supabase RLS policies using auth.jwt()->>'sub'.

const OT_TOOL_URLS = {
  "Enterprise Structure Intelligence": "https://enterprise-structure-intelligence-fgps56livskgqsfixq7psw.streamlit.app/",
  "Discovery Command Center Pro": "https://discoverycommandcenterpro-fu9jxdqbb4qtc28jexi7ul.streamlit.app/",
  "COA Transformation Accelerator": "https://coaacceleratormvp-immxr6kprgxex4wkhomcby.streamlit.app/",
  "BCEA Design Accelerator": "https://budgetarycontrol-architectv3-yt4uifrftfksbjezcycgak.streamlit.app/",
  "Journal Approvals Accelerator": "https://jounralapprovals-eejttydzbfzelpu5d5azvx.streamlit.app/",
  "AP Invoice Approvals Accelerator": "https://apinvoiceapprovals-prvs4kmw9bmfjnc5qm3rdw.streamlit.app/",
  "Per Diem Transformation Engine": "https://perdiem-toolkit-2j5pceprutup553f6c5mvm.streamlit.app/"
};

let otCloudProjects = [];
let otSelectedProjectId = localStorage.getItem("oracletoolkit_selected_project_id") || "";

async function otGetSupabaseClient() {
  if (!window.supabase) {
    otStatus("Supabase library not loaded.", "error");
    return null;
  }
  if (!window.Clerk || !window.Clerk.session || !window.Clerk.user) {
    otStatus("Please login before using Cloud Workspace.", "error");
    return null;
  }

  try {
    const token = await window.Clerk.session.getToken({ template: "supabase" });

    if (!token) {
      otStatus("Clerk Supabase token not found. Check JWT template name: supabase.", "error");
      return null;
    }

    return window.supabase.createClient(
      ORACLETK_SUPABASE_URL,
      ORACLETK_SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
  } catch (error) {
    console.error("Clerk/Supabase auth error:", error);
    otStatus("Cloud auth failed. Check Clerk JWT template and Supabase RLS.", "error");
    return null;
  }
}

function otStatus(message, type = "info") {
  const el = document.getElementById("engine-cloud-status");
  if (!el) return;
  el.textContent = message;
  el.className = `engine-status ${type}`;
}

function otEscape(value) {
  if (typeof escapeHtml === "function") return escapeHtml(value || "");
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function otGetProjectPayload() {
  return {
    project_name: document.getElementById("cloud-project-name")?.value.trim() || "",
    client_name: document.getElementById("cloud-client-name")?.value.trim() || "",
    sector: document.getElementById("cloud-sector")?.value || "",
    phase: document.getElementById("cloud-phase")?.value || "",
    module: document.getElementById("cloud-module")?.value || "",
    go_live_date: document.getElementById("cloud-golive")?.value || null,
    notes: document.getElementById("cloud-notes")?.value.trim() || "",
    updated_at: new Date().toISOString()
  };
}

function otFillProjectForm(project) {
  const map = {
    "cloud-project-id": project?.id || "",
    "cloud-project-name": project?.project_name || "",
    "cloud-client-name": project?.client_name || "",
    "cloud-sector": project?.sector || "Public Sector",
    "cloud-phase": project?.phase || "Discovery",
    "cloud-module": project?.module || "GL & BCEA",
    "cloud-golive": project?.go_live_date || "",
    "cloud-notes": project?.notes || ""
  };

  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
}

function otSetSelectedProject(projectId) {
  otSelectedProjectId = projectId || "";
  localStorage.setItem("oracletoolkit_selected_project_id", otSelectedProjectId);
  const project = otCloudProjects.find((p) => p.id === otSelectedProjectId);

  if (project) {
    otFillProjectForm(project);
  }

  otRenderCurrentProject();
  otRenderProjectSwitcher();
  otLoadRuns();
}

function otRenderCurrentProject() {
  const project = otCloudProjects.find((p) => p.id === otSelectedProjectId);
  const title = document.getElementById("engine-current-project");
  const meta = document.getElementById("engine-current-meta");

  if (title) title.textContent = project ? project.project_name : "No project selected";
  if (meta) {
    meta.textContent = project
      ? `${project.client_name || "Oracle Client"} • ${project.phase || "Phase"} • ${project.module || "Module"}`
      : "Create or select a project to begin.";
  }
}

function otRenderProjectSwitcher() {
  otSyncTopProjectSwitcher();
  const count = document.getElementById("engine-project-count");
  if (count) count.textContent = `${otCloudProjects.length} project${otCloudProjects.length === 1 ? "" : "s"}`;

  const select = document.getElementById("cloud-project-switcher");
  if (select) {
    select.innerHTML = `<option value="">Select project...</option>` + otCloudProjects.map((p) =>
      `<option value="${p.id}" ${p.id === otSelectedProjectId ? "selected" : ""}>${otEscape(p.project_name)} — ${otEscape(p.phase || "Phase")}</option>`
    ).join("");
  }

  const list = document.getElementById("cloud-project-list");
  if (!list) return;

  if (!otCloudProjects.length) {
    list.innerHTML = `<div class="empty-projects-state"><strong>No cloud projects yet.</strong><span>Create your first project workspace.</span></div>`;
    return;
  }

  list.innerHTML = otCloudProjects.map((p) => `
    <article class="project-switch-card ${p.id === otSelectedProjectId ? "active" : ""}">
      <div>
        <strong>${otEscape(p.project_name)}</strong>
        <span>${otEscape(p.client_name || "Client")} • ${otEscape(p.module || "Module")}</span>
      </div>
      <button type="button" data-select-project="${p.id}">Open</button>
    </article>
  `).join("");

  document.querySelectorAll("[data-select-project]").forEach((btn) => {
    btn.addEventListener("click", () => otSetSelectedProject(btn.getAttribute("data-select-project")));
  });
}

async function otLoadProjects() {
  const client = await otGetSupabaseClient();
  if (!client) return;

  otStatus("Loading cloud projects...", "info");

  const { data, error } = await client
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Load projects error:", error);
    otStatus(`Failed to load projects: ${error.message}`, "error");
    return;
  }

  otCloudProjects = data || [];

  if (otSelectedProjectId && !otCloudProjects.some((p) => p.id === otSelectedProjectId)) {
    otSelectedProjectId = "";
    localStorage.removeItem("oracletoolkit_selected_project_id");
  }

  if (!otSelectedProjectId && otCloudProjects.length) {
    otSelectedProjectId = otCloudProjects[0].id;
    localStorage.setItem("oracletoolkit_selected_project_id", otSelectedProjectId);
  }

  const selected = otCloudProjects.find((p) => p.id === otSelectedProjectId);
  if (selected) otFillProjectForm(selected);

  otRenderProjectSwitcher();
  otRenderCurrentProject();
  await otLoadRuns();

  otStatus("Cloud projects loaded.", "success");
}

async function otSaveProject(event) {
  event.preventDefault();

  const client = await otGetSupabaseClient();
  if (!client) return;

  const projectId = document.getElementById("cloud-project-id")?.value || "";
  const payload = otGetProjectPayload();

  if (!payload.project_name) {
    otStatus("Project name is required.", "error");
    return;
  }

  otStatus(projectId ? "Updating project..." : "Creating project...", "info");

  let result;
  if (projectId) {
    result = await client
      .from("projects")
      .update(payload)
      .eq("id", projectId)
      .select()
      .single();
  } else {
    result = await client
      .from("projects")
      .insert(payload)
      .select()
      .single();
  }

  if (result.error) {
    console.error("Save project error:", result.error);
    otStatus(`Save failed: ${result.error.message}`, "error");
    return;
  }

  otSelectedProjectId = result.data.id;
  localStorage.setItem("oracletoolkit_selected_project_id", otSelectedProjectId);

  await otLoadProjects();
  otStatus(projectId ? "Project updated successfully." : "Project created successfully.", "success");

  if (typeof gtagSafe === "function") gtagSafe("cloud_workspace_project_saved");
}

function otNewProject() {
  otSelectedProjectId = "";
  localStorage.removeItem("oracletoolkit_selected_project_id");
  otFillProjectForm(null);
  otRenderCurrentProject();
  otRenderProjectSwitcher();
  otRenderRuns([]);
  otStatus("Ready to create a new project.", "info");
}

function otGetRunPayload() {
  return {
    project_id: otSelectedProjectId,
    accelerator_name: document.getElementById("run-accelerator")?.value || "",
    module: document.getElementById("run-module")?.value || "",
    status: document.getElementById("run-status")?.value || "",
    notes: document.getElementById("run-notes")?.value?.trim() || ""
  };
}

async function otSaveRun(event) {
  event.preventDefault();

  if (!otSelectedProjectId) {
    otStatus("Select or create a project before saving an accelerator run.", "error");
    return;
  }

  const client = await otGetSupabaseClient();
  if (!client) return;

  const payload = otGetRunPayload();

  if (!payload.accelerator_name) {
    otStatus("Select an accelerator before saving run.", "error");
    return;
  }

  const { error } = await client
    .from("accelerator_runs")
    .insert(payload);

  if (error) {
    console.error("Save run error:", error);
    otStatus(`Run save failed: ${error.message}`, "error");
    return;
  }

  document.getElementById("run-notes").value = "";
  await otLoadRuns();
  otStatus("Accelerator run saved.", "success");

  if (typeof gtagSafe === "function") gtagSafe("cloud_workspace_run_saved");
}

async function otLoadRuns() {
  if (!otSelectedProjectId) {
    otRenderRuns([]);
    return;
  }

  const client = await otGetSupabaseClient();
  if (!client) return;

  const { data, error } = await client
    .from("accelerator_runs")
    .select("*")
    .eq("project_id", otSelectedProjectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load runs error:", error);
    otStatus(`Could not load runs: ${error.message}`, "error");
    return;
  }

  otRenderRuns(data || []);
}

function otRenderRuns(runs) {
  const count = document.getElementById("run-count");
  if (count) count.textContent = `${runs.length} run${runs.length === 1 ? "" : "s"}`;

  const list = document.getElementById("accelerator-runs-list");
  if (!list) return;

  if (!runs.length) {
    list.innerHTML = `<div class="empty-projects-state"><strong>No runs yet.</strong><span>Select a project and save your first accelerator run.</span></div>`;
    return;
  }

  list.innerHTML = runs.map((run) => {
    const url = OT_TOOL_URLS[run.accelerator_name] || "#member-tools";
    return `
      <article class="run-card-v2">
        <div class="run-card-top">
          <strong>${otEscape(run.accelerator_name)}</strong>
          <em>${otEscape(run.status || "Status")}</em>
        </div>
        <div class="run-card-meta">
          <span>${otEscape(run.module || "Module")}</span>
          <span>${otEscape(new Date(run.created_at).toLocaleString())}</span>
        </div>
        <p>${otEscape(run.notes || "No notes added.")}</p>
        <a href="${url}" target="_blank">Launch Related Tool</a>
      </article>
    `;
  }).join("");
}

function otWireEngine() {
  const projectForm = document.getElementById("cloud-project-form");
  if (projectForm) projectForm.addEventListener("submit", otSaveProject);

  const newBtn = document.getElementById("cloud-new-project-btn");
  if (newBtn) newBtn.addEventListener("click", otNewProject);

  const refreshBtn = document.getElementById("cloud-refresh-projects-btn");
  if (refreshBtn) refreshBtn.addEventListener("click", otLoadProjects);

  const switcher = document.getElementById("cloud-project-switcher");
  if (switcher) switcher.addEventListener("change", () => otSetSelectedProject(switcher.value));

  const runForm = document.getElementById("accelerator-run-form");
  if (runForm) runForm.addEventListener("submit", otSaveRun);

  setTimeout(() => {
    if (window.Clerk && window.Clerk.user) otLoadProjects();
  }, 1800);
}

window.addEventListener("load", function () {
  otWireTopControls();
  otWireEngine();
});


// v3 navigation fixes: top controls and project switcher sync
function otWireTopControls() {
  const memberBtn = document.getElementById("member-workspace-btn");
  if (memberBtn) {
    memberBtn.addEventListener("click", function () {
      document.getElementById("workspace-engine")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const allToolsBtn = document.getElementById("all-tools-btn");
  if (allToolsBtn) {
    allToolsBtn.addEventListener("click", function () {
      document.getElementById("member-tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const timelineBtn = document.getElementById("timeline-btn");
  if (timelineBtn) {
    timelineBtn.addEventListener("click", function () {
      document.getElementById("phase-tracker")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const activityBtn = document.getElementById("activity-btn");
  if (activityBtn) {
    activityBtn.addEventListener("click", function () {
      const target = document.getElementById("accelerator-runs-list") || document.getElementById("os-activity-list");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const topSwitcher = document.getElementById("top-project-switcher");
  if (topSwitcher) {
    topSwitcher.addEventListener("change", function () {
      otSetSelectedProject(topSwitcher.value);
      document.getElementById("workspace-engine")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function otSyncTopProjectSwitcher() {
  const topSwitcher = document.getElementById("top-project-switcher");
  if (!topSwitcher) return;

  topSwitcher.innerHTML = `<option value="">Select Project...</option>` + otCloudProjects.map((p) =>
    `<option value="${p.id}" ${p.id === otSelectedProjectId ? "selected" : ""}>${otEscape(p.project_name)}</option>`
  ).join("");
}
