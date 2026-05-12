// OracleToolkit v12 dashboard.js — workspace, saved runs, and lightweight interactions

const TOOL_URLS = {
  "COA Transformation Accelerator": "https://coaacceleratormvp-immxr6kprgxex4wkhomcby.streamlit.app/",
  "BCEA Design Accelerator": "https://budgetarycontrol-architectv3-yt4uifrftfksbjezcycgak.streamlit.app/",
  "Journal Approvals Accelerator": "https://jounralapprovals-whvpagrk9m9ugkqxcfwxsl.streamlit.app/",
  "AP Invoice Approvals Accelerator": "https://apinvoiceapprovals-prvs4kmw9bmfjnc5qm3rdw.streamlit.app/",
  "Per Diem Transformation Engine": "https://perdiem-toolkit-2j5pceprutup553f6c5mvm.streamlit.app/",
  "Future / Roadmap Tool": "#member-tools"
};

const STORAGE_KEY = "oracletoolkit_saved_runs_v1";

function getSavedRuns() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.warn("Could not read saved runs:", error);
    return [];
  }
}

function setSavedRuns(runs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSavedRuns() {
  const list = document.getElementById("saved-runs-list");
  const count = document.getElementById("saved-run-count");
  const lastTool = document.getElementById("last-run-tool");

  if (!list) return;

  const runs = getSavedRuns();

  if (count) count.textContent = runs.length;
  if (lastTool) lastTool.textContent = runs[0] ? runs[0].tool.replace(" Accelerator", "").replace(" Transformation Engine", "") : "—";

  if (!runs.length) {
    list.innerHTML = `
      <div class="empty-runs">
        <strong>No saved runs yet.</strong>
        <span>Create your first project workspace entry above.</span>
      </div>
    `;
    return;
  }

  list.innerHTML = runs.map((run) => {
    const toolUrl = TOOL_URLS[run.tool] || "#member-tools";

    return `
      <article class="saved-run-card" data-run-id="${escapeHtml(run.id)}">
        <div class="saved-run-top">
          <div>
            <h4>${escapeHtml(run.projectName)}</h4>
            <small>Saved ${escapeHtml(formatDate(run.createdAt))}</small>
          </div>
          <span class="saved-run-pill">${escapeHtml(run.status)}</span>
        </div>

        <div class="saved-run-meta">
          <span>${escapeHtml(run.module)}</span>
          <span>${escapeHtml(run.tool)}</span>
        </div>

        <div class="saved-run-notes">${escapeHtml(run.notes || "No notes added.")}</div>

        <div class="saved-run-footer">
          <a href="${toolUrl}" target="_blank" onclick="gtagSafe && gtagSafe('saved_run_launch_tool')">Launch Related Tool</a>
          <button class="delete-run-btn" type="button" data-delete-run="${escapeHtml(run.id)}">Delete</button>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-delete-run]").forEach((button) => {
    button.addEventListener("click", function () {
      const id = button.getAttribute("data-delete-run");
      const updated = getSavedRuns().filter((run) => run.id !== id);
      setSavedRuns(updated);
      renderSavedRuns();
    });
  });
}

function saveWorkspaceRun(event) {
  event.preventDefault();

  const projectName = document.getElementById("project-name")?.value.trim();
  const module = document.getElementById("project-module")?.value;
  const tool = document.getElementById("project-tool")?.value;
  const status = document.getElementById("project-status")?.value;
  const notes = document.getElementById("project-notes")?.value.trim();

  if (!projectName) {
    alert("Please enter a project or client name before saving.");
    return;
  }

  const run = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    projectName,
    module,
    tool,
    status,
    notes,
    createdAt: new Date().toISOString()
  };

  const runs = getSavedRuns();
  runs.unshift(run);
  setSavedRuns(runs.slice(0, 30));

  const form = document.getElementById("workspace-form");
  if (form) form.reset();

  renderSavedRuns();

  if (typeof gtagSafe === "function") {
    gtagSafe("workspace_saved_run");
  }

  document.getElementById("saved-runs")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function exportSavedRuns() {
  const runs = getSavedRuns();
  const blob = new Blob([JSON.stringify(runs, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `oracletoolkit-saved-runs-${today}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function clearSavedRuns() {
  const runs = getSavedRuns();

  if (!runs.length) {
    alert("No saved runs to clear.");
    return;
  }

  if (confirm("Clear all saved project history from this browser?")) {
    setSavedRuns([]);
    renderSavedRuns();
  }
}

window.addEventListener("load", function () {
  const searchInput = document.getElementById("dashboard-search");
  const toolCards = Array.from(document.querySelectorAll("[data-tool-card]"));

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const value = searchInput.value.toLowerCase().trim();

      toolCards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(value) ? "block" : "none";
      });
    });
  }

  const form = document.getElementById("workspace-form");
  if (form) form.addEventListener("submit", saveWorkspaceRun);

  const clearForm = document.getElementById("clear-form-btn");
  if (clearForm) {
    clearForm.addEventListener("click", function () {
      document.getElementById("workspace-form")?.reset();
    });
  }

  const exportBtn = document.getElementById("export-runs-btn");
  if (exportBtn) exportBtn.addEventListener("click", exportSavedRuns);

  const clearRunsBtn = document.getElementById("clear-runs-btn");
  if (clearRunsBtn) clearRunsBtn.addEventListener("click", clearSavedRuns);

  renderSavedRuns();
});


// OracleToolkit Workspace v1 — Project workspace, resume previous work, phase tracker, notes, and recommendations

const PROJECT_KEY = "oracletoolkit_workspace_project_v1";
const ACTIVITY_KEY = "oracletoolkit_workspace_activity_v1";

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getProjectWorkspace() {
  return readJson(PROJECT_KEY, null);
}

function setProjectWorkspace(project) {
  writeJson(PROJECT_KEY, project);
}

function getWorkspaceActivity() {
  return readJson(ACTIVITY_KEY, []);
}

function addWorkspaceActivity(message, meta) {
  const activity = getWorkspaceActivity();
  activity.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    message,
    meta,
    createdAt: new Date().toLocaleString()
  });
  writeJson(ACTIVITY_KEY, activity.slice(0, 10));
}

function updatePhaseTracker(phase) {
  document.querySelectorAll(".phase-step").forEach((step) => {
    const stepPhase = step.getAttribute("data-phase");
    step.classList.toggle("active", stepPhase === phase);
  });
}

function updateRecommendations(project) {
  const list = document.getElementById("recommendation-list");
  if (!list || !project) return;

  const module = (project.module || "").toLowerCase();
  const sector = (project.sector || "").toLowerCase();

  let recommendations = [];

  if (module.includes("gl") || module.includes("bcea") || sector.includes("public") || sector.includes("k-12")) {
    recommendations.push({
      title: "COA Transformation Accelerator",
      desc: "Use for legacy-to-Oracle mapping, segment design review, and public sector readiness.",
      url: TOOL_URLS["COA Transformation Accelerator"]
    });
    recommendations.push({
      title: "BCEA Design Accelerator",
      desc: "Use for budgetary control structure, funds check readiness, and advisory vs absolute decisions.",
      url: TOOL_URLS["BCEA Design Accelerator"]
    });
    recommendations.push({
      title: "Journal Approvals Accelerator",
      desc: "Use for GL workflow governance, approval routing, and journal approval design.",
      url: TOOL_URLS["Journal Approvals Accelerator"]
    });
  }

  if (module.includes("payables")) {
    recommendations.push({
      title: "AP Invoice Approvals Accelerator",
      desc: "Use for AP approval routing, invoice workflow rules, and Payables readiness.",
      url: TOOL_URLS["AP Invoice Approvals Accelerator"]
    });
  }

  if (module.includes("expenses")) {
    recommendations.push({
      title: "Per Diem Transformation Engine",
      desc: "Use for Oracle Expenses per diem setup, GSA file normalization, and validation review.",
      url: TOOL_URLS["Per Diem Transformation Engine"]
    });
  }

  if (!recommendations.length) {
    recommendations = [
      {
        title: "COA Transformation Accelerator",
        desc: "Start with COA mapping and design readiness for most Oracle Finance implementations.",
        url: TOOL_URLS["COA Transformation Accelerator"]
      },
      {
        title: "BCEA Design Accelerator",
        desc: "Use for public sector, K-12, fund accounting, and budgetary control design.",
        url: TOOL_URLS["BCEA Design Accelerator"]
      }
    ];
  }

  list.innerHTML = recommendations.map((item) => `
    <a href="${item.url}" target="_blank">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.desc)}</span>
    </a>
  `).join("");
}

function renderWorkspaceActivity() {
  const list = document.getElementById("os-activity-list");
  if (!list) return;

  const activity = getWorkspaceActivity();

  if (!activity.length) {
    list.innerHTML = `
      <div class="empty-runs">
        <strong>No activity yet.</strong>
        <span>Create or update a project workspace to begin.</span>
      </div>
    `;
    return;
  }

  list.innerHTML = activity.map((item) => `
    <div class="os-activity-item">
      <strong>${escapeHtml(item.message)}</strong>
      <span>${escapeHtml(item.meta)} • ${escapeHtml(item.createdAt)}</span>
    </div>
  `).join("");
}

function renderProjectWorkspace() {
  const project = getProjectWorkspace();

  const resumeName = document.getElementById("resume-project-name");
  const resumeMeta = document.getElementById("resume-project-meta");

  const fields = {
    "summary-project": project?.projectName || "Not created",
    "summary-client": project?.clientName || "—",
    "summary-sector": project?.sector || "—",
    "summary-phase": project?.phase || "—",
    "summary-module": project?.module || "—",
    "summary-golive": project?.goLive || "—"
  };

  Object.entries(fields).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });

  if (resumeName) resumeName.textContent = project?.projectName || "No project saved yet";
  if (resumeMeta) {
    resumeMeta.textContent = project
      ? `${project.clientName || "Client"} • ${project.phase || "Phase"} • ${project.module || "Module"}`
      : "Create your first project workspace below.";
  }

  const notesBox = document.getElementById("saved-notes-box");
  if (notesBox) {
    if (project?.notes) {
      notesBox.classList.add("note-active");
      notesBox.innerHTML = `<strong>Latest Project Notes</strong><span>${escapeHtml(project.notes)}</span>`;
    } else {
      notesBox.classList.remove("note-active");
      notesBox.innerHTML = `<strong>No saved notes yet.</strong><span>Your project notes will appear here after saving the workspace.</span>`;
    }
  }

  updatePhaseTracker(project?.phase || "");
  updateRecommendations(project);
  renderWorkspaceActivity();
}

function populateProjectForm(project) {
  if (!project) return;

  const map = {
    "os-project-name": project.projectName,
    "os-client-name": project.clientName,
    "os-sector": project.sector,
    "os-phase": project.phase,
    "os-module": project.module,
    "os-golive": project.goLive,
    "os-notes": project.notes
  };

  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.value = value;
  });
}

function saveProjectWorkspace(event) {
  event.preventDefault();

  const project = {
    projectName: document.getElementById("os-project-name")?.value.trim(),
    clientName: document.getElementById("os-client-name")?.value.trim(),
    sector: document.getElementById("os-sector")?.value,
    phase: document.getElementById("os-phase")?.value,
    module: document.getElementById("os-module")?.value,
    goLive: document.getElementById("os-golive")?.value || "Not set",
    notes: document.getElementById("os-notes")?.value.trim(),
    updatedAt: new Date().toISOString()
  };

  if (!project.projectName) {
    alert("Please enter a project name before saving.");
    return;
  }

  setProjectWorkspace(project);
  addWorkspaceActivity("Project workspace saved", `${project.projectName} • ${project.phase} • ${project.module}`);
  renderProjectWorkspace();

  if (typeof gtagSafe === "function") {
    gtagSafe("workspace_project_saved");
  }
}

function initializeWorkspaceOS() {
  const project = getProjectWorkspace();
  if (project) populateProjectForm(project);
  renderProjectWorkspace();

  const projectForm = document.getElementById("project-form");
  if (projectForm) projectForm.addEventListener("submit", saveProjectWorkspace);

  const clearProjectForm = document.getElementById("clear-project-form-btn");
  if (clearProjectForm) {
    clearProjectForm.addEventListener("click", function () {
      document.getElementById("project-form")?.reset();
    });
  }

  const resumeButton = document.getElementById("resume-work-btn");
  if (resumeButton) {
    resumeButton.addEventListener("click", function () {
      const project = getProjectWorkspace();
      if (project) {
        populateProjectForm(project);
        document.getElementById("workspace-os")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        alert("No project saved yet. Create your first project workspace.");
      }
    });
  }
}

window.addEventListener("load", initializeWorkspaceOS);
