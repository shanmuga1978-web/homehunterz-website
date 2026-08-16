const PROPERTY_CATEGORIES = [
  "Apartment", "Flat", "Independent House", "Villa", "Residential Plot",
  "Land", "Commercial", "Office", "Retail", "Warehouse", "Industrial", "Other"
];

// UI page size only — how many rows the table shows per page. This has
// no bearing on how many properties can exist in the database; it only
// controls how many of the current filtered/sorted result set are asked
// for in a single .range() request. Changing this number changes the
// table's page length, never a storage/database limit.
const PAGE_SIZE = 20;

let currentPage = 1;
let totalMatchingCount = 0;
let currentPageRows = []; // only the ~20 rows actually on screen right now
let pendingDeleteId = null;
let searchDebounceTimer = null;

// Columns needed for the table view. Deliberately excludes property_images
// entirely here — the list doesn't need any image data at all beyond a
// thumbnail, fetched separately per visible row (see loadThumbnails) so a
// list of hundreds/thousands of properties never pulls a whole gallery's
// worth of image rows just to render a 48×36px thumbnail.
const LIST_COLUMNS = "id, slug, title, location, category, listing_type, status, display_price, price, is_featured, is_published, is_archived, created_at, updated_at";

async function loadPropertiesList() {
  const session = await requireAdminAuth();
  if (!session) return;
  watchAuthState();
  renderAdminShell();

  const content = document.getElementById("adminContent");
  const template = document.getElementById("propertiesTemplate");
  content.appendChild(template.content.cloneNode(true));

  document.getElementById("propFilterCategory").innerHTML +=
    PROPERTY_CATEGORIES.map(c => `<option>${c}</option>`).join("");

  // Support the sidebar's quick-filter links, e.g. properties.html?filter=featured
  const urlFilter = new URLSearchParams(window.location.search).get("filter");
  if (urlFilter === "drafts") document.getElementById("propFilterPublished").value = "draft";
  window.__featuredOnly = urlFilter === "featured";
  window.__archivedOnly = urlFilter === "archived";

  document.getElementById("propSearch").addEventListener("input", () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => { currentPage = 1; fetchAndRenderPage(); }, 350);
  });
  ["propFilterCategory", "propFilterListingType", "propFilterStatus", "propFilterPublished", "propSort"]
    .forEach(id => document.getElementById(id).addEventListener("change", () => { currentPage = 1; fetchAndRenderPage(); }));

  document.getElementById("deleteCancelBtn").addEventListener("click", closeDeleteModal);
  document.getElementById("deleteConfirmBtn").addEventListener("click", confirmDeleteProperty);

  await fetchAndRenderPage();
}

/* Builds the Supabase query for the CURRENT filters/search/sort, applies
   .range() for just the current page, and asks for an exact total count
   in the same request (so "page 1 of N" is correct without a second
   round trip) — all filtering, sorting, and pagination happens on the
   server. The browser only ever holds the ~20 rows actually on screen. */
async function fetchAndRenderPage() {
  const search = document.getElementById("propSearch").value.trim();
  const category = document.getElementById("propFilterCategory").value;
  const listingType = document.getElementById("propFilterListingType").value;
  const status = document.getElementById("propFilterStatus").value;
  const published = document.getElementById("propFilterPublished").value;
  const sort = document.getElementById("propSort").value;

  let query = window.supabaseClient
    .from("properties")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("is_archived", !!window.__archivedOnly);

  if (window.__featuredOnly) query = query.eq("is_featured", true);
  if (category) query = query.eq("category", category);
  if (listingType) query = query.eq("listing_type", listingType);
  if (status) query = query.eq("status", status);
  if (published === "published") query = query.eq("is_published", true);
  if (published === "draft") query = query.eq("is_published", false);
  if (search) {
    const escaped = search.replace(/[%,]/g, "");
    query = query.or(`title.ilike.%${escaped}%,location.ilike.%${escaped}%`);
  }

  const sorters = {
    newest: () => query.order("created_at", { ascending: false }),
    oldest: () => query.order("created_at", { ascending: true }),
    price_asc: () => query.order("price", { ascending: true, nullsFirst: false }),
    price_desc: () => query.order("price", { ascending: false, nullsFirst: false }),
    updated: () => query.order("updated_at", { ascending: false })
  };
  query = (sorters[sort] || sorters.newest)();

  const from = (currentPage - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const tbody = document.getElementById("propertiesTableBody");
  tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--slate);">Loading…</td></tr>`;

  const { data, error, count } = await query;

  if (error) {
    showAdminToast("Couldn't load properties: " + error.message, "error");
    tbody.innerHTML = `<tr><td colspan="9"><div class="admin-empty">Couldn't load properties.</div></td></tr>`;
    return;
  }

  currentPageRows = data || [];
  totalMatchingCount = count ?? currentPageRows.length;

  renderPropertiesTable();
  loadThumbnails(currentPageRows.map(p => p.id));
}

function renderPropertiesTable() {
  const tbody = document.getElementById("propertiesTableBody");

  tbody.innerHTML = currentPageRows.length
    ? currentPageRows.map(p => `
        <tr data-row-id="${p.id}">
          <td><div class="thumb-slot" data-thumb-slot="${p.id}" style="width:48px;height:36px;border-radius:6px;overflow:hidden;background:var(--mist);"></div></td>
          <td><strong>${p.title}</strong><div style="font-size:11.5px;color:var(--slate);">${p.location || ""}</div></td>
          <td>${p.category}</td>
          <td>${p.listing_type}</td>
          <td>${statusBadge(p.status)}</td>
          <td>${p.display_price || "—"}</td>
          <td>
            <button type="button" class="admin-btn admin-btn-ghost admin-btn-sm" data-toggle-featured="${p.id}" data-current="${p.is_featured}">
              ${p.is_featured ? "★ Featured" : "☆ Feature"}
            </button>
          </td>
          <td>
            <button type="button" class="admin-btn admin-btn-ghost admin-btn-sm" data-toggle-published="${p.id}" data-current="${p.is_published}">
              ${p.is_published ? '<span class="admin-badge admin-badge-green">Published</span>' : '<span class="admin-badge admin-badge-slate">Draft</span>'}
            </button>
          </td>
          <td style="white-space:nowrap;">
            <a href="property-edit.html?id=${p.id}" class="admin-btn admin-btn-ghost admin-btn-sm">Edit</a>
            <a href="../index.html?property=${p.slug}" target="_blank" class="admin-btn admin-btn-ghost admin-btn-sm">Preview</a>
            <button type="button" class="admin-btn admin-btn-ghost admin-btn-sm" data-duplicate="${p.id}">Duplicate</button>
            <button type="button" class="admin-btn admin-btn-ghost admin-btn-sm" data-archive="${p.id}" data-current="${p.is_archived}">${p.is_archived ? "Unarchive" : "Archive"}</button>
            <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" data-delete="${p.id}">Delete</button>
          </td>
        </tr>
      `).join("")
    : `<tr><td colspan="9"><div class="admin-empty">No properties match these filters.</div></td></tr>`;

  document.getElementById("propResultCount").textContent =
    `${totalMatchingCount} propert${totalMatchingCount === 1 ? "y" : "ies"}`;

  renderPagination();
  wireRowActions();
}

/* Thumbnails are fetched in one small batched query for just the ~20
   property ids currently on screen — never for the whole catalogue —
   and each row grabs only its single featured (or first) image. */
async function loadThumbnails(propertyIds) {
  if (!propertyIds.length) return;
  const { data, error } = await window.supabaseClient
    .from("property_images")
    .select("property_id, public_url, is_featured_image")
    .in("property_id", propertyIds)
    .order("is_featured_image", { ascending: false });

  if (error || !data) return;

  const firstImageByProperty = {};
  data.forEach(img => {
    if (!firstImageByProperty[img.property_id]) firstImageByProperty[img.property_id] = img.public_url;
  });

  Object.entries(firstImageByProperty).forEach(([id, url]) => {
    const slot = document.querySelector(`[data-thumb-slot="${id}"]`);
    if (slot) slot.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;">`;
  });
}

function statusBadge(status) {
  const map = {
    Available: "admin-badge-green", "Under Offer": "admin-badge-amber",
    Sold: "admin-badge-slate", Rented: "admin-badge-slate", Inactive: "admin-badge-red"
  };
  return `<span class="admin-badge ${map[status] || "admin-badge-slate"}">${status}</span>`;
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(totalMatchingCount / PAGE_SIZE));
  const el = document.getElementById("propPagination");
  if (totalPages <= 1) { el.innerHTML = ""; return; }

  // For very large result sets, show a windowed page range (current ± 3)
  // plus first/last, rather than rendering thousands of page buttons.
  const pages = new Set([1, totalPages]);
  for (let i = currentPage - 3; i <= currentPage + 3; i++) if (i >= 1 && i <= totalPages) pages.add(i);
  const sortedPages = [...pages].sort((a, b) => a - b);

  let html = "";
  let prev = 0;
  sortedPages.forEach(p => {
    if (p - prev > 1) html += `<span style="padding:0 4px;color:var(--slate);">…</span>`;
    html += `<button type="button" class="admin-btn ${p === currentPage ? "admin-btn-primary" : "admin-btn-outline"} admin-btn-sm" data-page="${p}">${p}</button>`;
    prev = p;
  });
  el.innerHTML = html;

  el.querySelectorAll("[data-page]").forEach(btn =>
    btn.addEventListener("click", () => { currentPage = Number(btn.dataset.page); fetchAndRenderPage(); })
  );
}

function wireRowActions() {
  document.querySelectorAll("[data-toggle-featured]").forEach(btn =>
    btn.addEventListener("click", () => togglePropertyField(btn.dataset.toggleFeatured, "is_featured", btn.dataset.current !== "true"))
  );
  document.querySelectorAll("[data-toggle-published]").forEach(btn =>
    btn.addEventListener("click", () => togglePropertyField(btn.dataset.togglePublished, "is_published", btn.dataset.current !== "true"))
  );
  document.querySelectorAll("[data-archive]").forEach(btn =>
    btn.addEventListener("click", () => togglePropertyField(btn.dataset.archive, "is_archived", btn.dataset.current !== "true"))
  );
  document.querySelectorAll("[data-duplicate]").forEach(btn =>
    btn.addEventListener("click", () => duplicateProperty(btn.dataset.duplicate))
  );
  document.querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", () => openDeleteModal(btn.dataset.delete))
  );
}

// Every mutation re-fetches the current page from the server afterwards
// rather than patching the local array — with real pagination, "this
// row's new state" can also mean "this row no longer belongs on this
// page" (e.g. unfeaturing it while the Featured filter is active), so a
// fresh server-driven page is simpler and always correct.
async function togglePropertyField(id, field, value) {
  const { error } = await window.supabaseClient.from("properties").update({ [field]: value }).eq("id", id);
  if (error) { showAdminToast("Update failed: " + error.message, "error"); return; }
  showAdminToast("Updated.", "success");
  fetchAndRenderPage();
}

async function duplicateProperty(id) {
  const { data: original, error: fetchError } = await window.supabaseClient
    .from("properties").select("*").eq("id", id).single();
  if (fetchError || !original) { showAdminToast("Couldn't load property to duplicate.", "error"); return; }

  const copy = { ...original };
  delete copy.id;
  delete copy.created_at;
  delete copy.updated_at;
  copy.title = `${copy.title} (Copy)`;
  copy.slug = `${copy.slug}-copy-${Date.now().toString(36)}`;
  copy.is_published = false; // duplicates land as drafts, reviewed before going live

  const { data, error } = await window.supabaseClient.from("properties").insert(copy).select().single();
  if (error) { showAdminToast("Duplicate failed: " + error.message, "error"); return; }
  showAdminToast("Duplicated as a draft.", "success");
  window.location.href = `property-edit.html?id=${data.id}`;
}

function openDeleteModal(id) {
  pendingDeleteId = id;
  document.getElementById("deleteConfirmOverlay").classList.add("open");
}
function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById("deleteConfirmOverlay").classList.remove("open");
}
async function confirmDeleteProperty() {
  if (!pendingDeleteId) return;
  // property_images rows cascade-delete automatically (see schema.sql's
  // "on delete cascade"); this only removes the database rows — actual
  // files in Storage should be cleared from the Media Library if unused.
  const { error } = await window.supabaseClient.from("properties").delete().eq("id", pendingDeleteId);
  if (error) { showAdminToast("Delete failed: " + error.message, "error"); closeDeleteModal(); return; }
  closeDeleteModal();
  showAdminToast("Property deleted.", "success");
  // If this was the last row on the current page (and it's not page 1),
  // step back a page rather than showing an empty page.
  if (currentPageRows.length === 1 && currentPage > 1) currentPage -= 1;
  fetchAndRenderPage();
}

document.addEventListener("DOMContentLoaded", loadPropertiesList);
