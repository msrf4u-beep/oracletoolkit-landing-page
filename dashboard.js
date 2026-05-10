// OracleToolkit v12 dashboard.js — workspace, saved runs, and lightweight interactions

const TOOL_URLS = {
  "COA Transformation Accelerator": "https://coaacceleratormvp-immxr6kprgxex4wkhomcby.streamlit.app/",
  "BCEA Design Accelerator": "https://budgetarycontrol-architectv3-yt4uifrftfksbjezcycgak.streamlit.app/",
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
