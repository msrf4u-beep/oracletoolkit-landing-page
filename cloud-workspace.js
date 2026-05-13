// OracleToolkit Cloud Workspace v1
// Uses Clerk JWT template named "supabase" so Supabase RLS can read auth.jwt()->>'sub'.

async function getSupabaseClient() {
  if (!window.supabase) {
    console.error("Supabase JS library not loaded.");
    return null;
  }
  if (!window.Clerk || !window.Clerk.session || !window.Clerk.user) {
    console.warn("User is not signed in with Clerk.");
    return null;
  }

  let token = null;
  try {
    token = await window.Clerk.session.getToken({ template: "supabase" });
  } catch (error) {
    console.error("Could not get Clerk Supabase JWT. Check Clerk JWT template name = supabase.", error);
    return null;
  }

  if (!token) {
    console.error("No Clerk Supabase JWT returned.");
    return null;
  }

  return window.supabase.createClient(
    ORACLETK_SUPABASE_URL,
    ORACLETK_SUPABASE_PUBLISHABLE_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

function cloudWorkspaceStatus(message, type = "info") {
  const el = document.getElementById("cloud-workspace-status");
  if (!el) return;
  el.textContent = message;
  el.className = `cloud-workspace-status ${type}`;
}

function getCloudProjectFromForm() {
  return {
    project_name: document.getElementById("os-project-name")?.value?.trim() || "",
    client_name: document.getElementById("os-client-name")?.value?.trim() || "",
    sector: document.getElementById("os-sector")?.value || "",
    phase: document.getElementById("os-phase")?.value || "",
    module: document.getElementById("os-module")?.value || "",
    go_live_date: document.getElementById("os-golive")?.value || null,
    notes: document.getElementById("os-notes")?.value?.trim() || ""
  };
}

async function saveProjectToCloud(projectData) {
  const client = await getSupabaseClient();
  if (!client) {
    cloudWorkspaceStatus("Cloud save unavailable. Confirm login and Clerk Supabase JWT setup.", "error");
    return null;
  }
  if (!projectData.project_name) {
    cloudWorkspaceStatus("Please enter a project name before saving to cloud.", "error");
    return null;
  }

  cloudWorkspaceStatus("Saving project to cloud...", "info");

  const { data, error } = await client
    .from("projects")
    .insert({
      project_name: projectData.project_name,
      client_name: projectData.client_name,
      sector: projectData.sector,
      phase: projectData.phase,
      module: projectData.module,
      go_live_date: projectData.go_live_date || null,
      notes: projectData.notes,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Cloud project save failed:", error);
    cloudWorkspaceStatus(`Cloud save failed: ${error.message}`, "error");
    return null;
  }

  cloudWorkspaceStatus("Project saved to cloud successfully.", "success");
  await renderCloudProjects();

  if (typeof gtagSafe === "function") {
    gtagSafe("cloud_workspace_project_saved");
  }

  return data;
}

async function loadProjectsFromCloud() {
  const client = await getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Cloud project load failed:", error);
    cloudWorkspaceStatus(`Could not load cloud projects: ${error.message}`, "error");
    return [];
  }

  return data || [];
}

function renderCloudProjectCards(projects) {
  const container = document.getElementById("cloud-projects-list");
  const countEl = document.getElementById("cloud-project-count");
  const lastEl = document.getElementById("cloud-last-project");

  if (countEl) countEl.textContent = projects.length;
  if (lastEl) lastEl.textContent = projects[0]?.project_name || "—";
  if (!container) return;

  if (!projects.length) {
    container.innerHTML = `<div class="empty-projects-state"><strong>No cloud projects yet.</strong><span>Save your first workspace to create cloud project history.</span></div>`;
    return;
  }

  container.innerHTML = projects.map((project) => `
    <article class="cloud-project-card">
      <div class="cloud-project-top">
        <div>
          <h4>${escapeHtml(project.project_name)}</h4>
          <span>${escapeHtml(project.client_name || "Oracle Client")}</span>
        </div>
        <em>${escapeHtml(project.phase || "Phase")}</em>
      </div>
      <div class="cloud-project-meta">
        <span>${escapeHtml(project.sector || "Sector")}</span>
        <span>${escapeHtml(project.module || "Module")}</span>
        <span>Go-live: ${escapeHtml(project.go_live_date || "Not set")}</span>
      </div>
      <p>${escapeHtml(project.notes || "No notes added.")}</p>
      <button class="small-btn secondary-btn" type="button" data-load-cloud-project="${project.id}">Resume This Project</button>
    </article>
  `).join("");

  document.querySelectorAll("[data-load-cloud-project]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-load-cloud-project");
      const project = projects.find((item) => item.id === id);
      if (!project) return;
      fillWorkspaceFormFromCloud(project);
      cloudWorkspaceStatus(`Loaded "${project.project_name}" into workspace form.`, "success");
      document.getElementById("workspace-os")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function fillWorkspaceFormFromCloud(project) {
  const values = {
    "os-project-name": project.project_name || "",
    "os-client-name": project.client_name || "",
    "os-sector": project.sector || "",
    "os-phase": project.phase || "",
    "os-module": project.module || "",
    "os-golive": project.go_live_date || "",
    "os-notes": project.notes || ""
  };
  Object.entries(values).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
}

async function renderCloudProjects() {
  const container = document.getElementById("cloud-projects-list");
  if (container) {
    container.innerHTML = `<div class="empty-projects-state"><strong>Loading cloud workspace...</strong><span>Please wait while OracleToolkit loads your saved projects.</span></div>`;
  }
  const projects = await loadProjectsFromCloud();
  renderCloudProjectCards(projects);
}

async function saveCurrentWorkspaceToCloud() {
  const project = getCloudProjectFromForm();
  await saveProjectToCloud(project);
}

function initializeCloudWorkspace() {
  const saveBtn = document.getElementById("save-cloud-workspace-btn");
  if (saveBtn) saveBtn.addEventListener("click", saveCurrentWorkspaceToCloud);

  const refreshBtn = document.getElementById("refresh-cloud-projects-btn");
  if (refreshBtn) refreshBtn.addEventListener("click", renderCloudProjects);

  setTimeout(() => {
    if (window.Clerk && window.Clerk.user) {
      renderCloudProjects();
    }
  }, 1800);
}

window.addEventListener("load", initializeCloudWorkspace);
