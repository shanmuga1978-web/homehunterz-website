let allLeads = [];

const LEAD_SOURCE_LABELS = {
  property_enquiry: "Property Enquiry",
  list_with_us: "List With Us",
  free_valuation: "Free Valuation",
  joint_venture: "Joint Venture",
  nri_services: "NRI Services",
  contact_form: "Contact Form"
};

const LEAD_STATUS_COLORS = {
  New: "admin-badge-orange", Contacted: "admin-badge-slate", "Follow-up": "admin-badge-amber",
  Qualified: "admin-badge-green", Closed: "admin-badge-slate", "Not Interested": "admin-badge-red"
};

async function loadLeadsPage() {
  const session = await requireAdminAuth();
  if (!session) return;
  watchAuthState();
  renderAdminShell();

  const content = document.getElementById("adminContent");
  content.appendChild(document.getElementById("leadsTemplate").content.cloneNode(true));

  const presetSource = new URLSearchParams(window.location.search).get("source");
  if (presetSource) document.getElementById("leadFilterSource").value = presetSource;

  const { data, error } = await window.supabaseClient
    .from("leads").select("*").eq("is_archived", false).order("created_at", { ascending: false });

  if (error) { showAdminToast("Couldn't load leads: " + error.message, "error"); return; }
  allLeads = data || [];

  ["leadSearch", "leadFilterSource", "leadFilterStatus"].forEach(id =>
    document.getElementById(id).addEventListener("input", renderLeadsTable)
  );
  renderLeadsTable();

  document.getElementById("leadDetailCloseBtn").addEventListener("click", () =>
    document.getElementById("leadDetailOverlay").classList.remove("open")
  );
}

function renderLeadsTable() {
  const search = document.getElementById("leadSearch").value.trim().toLowerCase();
  const source = document.getElementById("leadFilterSource").value;
  const status = document.getElementById("leadFilterStatus").value;

  let list = allLeads;
  if (search) {
    list = list.filter(l =>
      (l.name || "").toLowerCase().includes(search) ||
      (l.phone || "").toLowerCase().includes(search) ||
      (l.email || "").toLowerCase().includes(search)
    );
  }
  if (source) list = list.filter(l => l.source === source);
  if (status) list = list.filter(l => l.status === status);

  const tbody = document.getElementById("leadsTableBody");
  tbody.innerHTML = list.length
    ? list.map(l => `
        <tr>
          <td><strong>${l.name || "Unnamed"}</strong></td>
          <td>${l.phone || ""}${l.email ? `<br><span style="color:var(--slate);font-size:12px;">${l.email}</span>` : ""}</td>
          <td>${LEAD_SOURCE_LABELS[l.source] || l.source}</td>
          <td>${l.property_title_snapshot || "—"}</td>
          <td><span class="admin-badge ${LEAD_STATUS_COLORS[l.status] || "admin-badge-slate"}">${l.status}</span></td>
          <td style="white-space:nowrap;color:var(--slate);font-size:12.5px;">${new Date(l.created_at).toLocaleDateString()}</td>
          <td><button type="button" class="admin-btn admin-btn-ghost admin-btn-sm" data-view-lead="${l.id}">View</button></td>
        </tr>
      `).join("")
    : `<tr><td colspan="7"><div class="admin-empty">No enquiries match these filters.</div></td></tr>`;

  document.getElementById("leadResultCount").textContent = `${list.length} enquir${list.length === 1 ? "y" : "ies"}`;

  tbody.querySelectorAll("[data-view-lead]").forEach(btn =>
    btn.addEventListener("click", () => openLeadDetail(btn.dataset.viewLead))
  );
}

function openLeadDetail(id) {
  const lead = allLeads.find(l => l.id === id);
  if (!lead) return;

  const extraFields = lead.source_details && typeof lead.source_details === "object"
    ? Object.entries(lead.source_details).map(([k, v]) => `<div style="margin-bottom:6px;"><strong style="text-transform:capitalize;">${k.replace(/_/g, " ")}:</strong> ${v}</div>`).join("")
    : "";

  document.getElementById("leadDetailBody").innerHTML = `
    <h3>${lead.name || "Unnamed"}</h3>
    <div style="font-size:13px;color:var(--slate);margin-bottom:16px;">${LEAD_SOURCE_LABELS[lead.source] || lead.source} · ${new Date(lead.created_at).toLocaleString()}</div>
    <div style="margin-bottom:14px;">
      ${lead.phone ? `<div>📞 ${lead.phone}</div>` : ""}
      ${lead.whatsapp ? `<div>💬 ${lead.whatsapp}</div>` : ""}
      ${lead.email ? `<div>✉️ ${lead.email}</div>` : ""}
      ${lead.property_title_snapshot ? `<div>🏠 ${lead.property_title_snapshot}</div>` : ""}
    </div>
    ${lead.message ? `<div class="admin-field"><label>Message</label><p style="font-size:13.5px;">${lead.message}</p></div>` : ""}
    ${extraFields ? `<div class="admin-field"><label>Additional Details</label>${extraFields}</div>` : ""}
    <div class="admin-field">
      <label>Status</label>
      <select id="leadStatusSelect">
        ${Object.keys(LEAD_STATUS_COLORS).map(s => `<option ${s === lead.status ? "selected" : ""}>${s}</option>`).join("")}
      </select>
    </div>
    <div class="admin-field">
      <label>Internal Notes</label>
      <textarea id="leadNotesInput">${lead.internal_notes || ""}</textarea>
    </div>
    <div style="display:flex;gap:10px;">
      <button type="button" class="admin-btn admin-btn-primary admin-btn-sm" id="leadSaveBtn">Save Changes</button>
      <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" id="leadArchiveBtn">Archive</button>
    </div>
  `;

  document.getElementById("leadSaveBtn").addEventListener("click", () => saveLeadChanges(lead.id));
  document.getElementById("leadArchiveBtn").addEventListener("click", () => archiveLead(lead.id));
  document.getElementById("leadDetailOverlay").classList.add("open");
}

async function saveLeadChanges(id) {
  const status = document.getElementById("leadStatusSelect").value;
  const notes = document.getElementById("leadNotesInput").value;
  const { error } = await window.supabaseClient.from("leads").update({ status, internal_notes: notes }).eq("id", id);
  if (error) { showAdminToast("Save failed: " + error.message, "error"); return; }
  const lead = allLeads.find(l => l.id === id);
  if (lead) { lead.status = status; lead.internal_notes = notes; }
  document.getElementById("leadDetailOverlay").classList.remove("open");
  renderLeadsTable();
  showAdminToast("Lead updated.", "success");
}

async function archiveLead(id) {
  const { error } = await window.supabaseClient.from("leads").update({ is_archived: true }).eq("id", id);
  if (error) { showAdminToast("Archive failed: " + error.message, "error"); return; }
  allLeads = allLeads.filter(l => l.id !== id);
  document.getElementById("leadDetailOverlay").classList.remove("open");
  renderLeadsTable();
  showAdminToast("Lead archived.", "success");
}

document.addEventListener("DOMContentLoaded", loadLeadsPage);
