const DASHBOARD_STATS = [
  { key: "total", label: "Total Properties" },
  { key: "available", label: "Available" },
  { key: "forSale", label: "For Sale" },
  { key: "forRent", label: "For Rent" },
  { key: "forLease", label: "For Lease" },
  { key: "sold", label: "Sold" },
  { key: "rented", label: "Rented" },
  { key: "featured", label: "Featured" },
  { key: "drafts", label: "Draft Properties" },
  { key: "newEnquiries", label: "New Enquiries" },
  { key: "totalEnquiries", label: "Total Enquiries" }
];

async function loadDashboard() {
  const session = await requireAdminAuth();
  if (!session) return;
  watchAuthState();
  renderAdminShell();

  const content = document.getElementById("adminContent");
  const template = document.getElementById("dashboardTemplate");
  content.appendChild(template.content.cloneNode(true));

  const statGrid = document.getElementById("statGrid");
  statGrid.innerHTML = DASHBOARD_STATS.map(s => `
    <div class="admin-stat-card">
      <div class="admin-stat-label">${s.label}</div>
      <div class="admin-stat-value" id="stat-${s.key}">—</div>
    </div>
  `).join("");

  const quickAddRow = document.createElement("div");
  quickAddRow.style.cssText = "margin-bottom:20px;";
  quickAddRow.innerHTML = `<a href="property-edit.html" class="admin-btn admin-btn-primary">+ Quick Add Property</a>`;
  statGrid.parentElement.insertBefore(quickAddRow, statGrid);

  // Each stat is its own lightweight `count`-only query (head: true means
  // Supabase returns just a row count via a response header, not the
  // actual rows) rather than fetching every property/lead into the
  // browser and counting client-side. That old approach had two real
  // problems at scale: it would silently under-report every number once
  // the table passed Supabase's default ~1000-row cap per request, and
  // it was pulling full records just to throw them away after counting.
  const countQuery = (table, filters) => {
    let q = window.supabaseClient.from(table).select("*", { count: "exact", head: true });
    Object.entries(filters).forEach(([col, val]) => { q = q.eq(col, val); });
    return q;
  };

  const [
    total, available, forSale, forRent, forLease, sold, rented, featured, drafts,
    newEnquiries, totalEnquiries
  ] = await Promise.all([
    countQuery("properties", { is_archived: false }),
    countQuery("properties", { is_archived: false, status: "Available" }),
    countQuery("properties", { is_archived: false, listing_type: "For Sale" }),
    countQuery("properties", { is_archived: false, listing_type: "For Rent" }),
    countQuery("properties", { is_archived: false, listing_type: "For Lease" }),
    countQuery("properties", { is_archived: false, status: "Sold" }),
    countQuery("properties", { is_archived: false, status: "Rented" }),
    countQuery("properties", { is_archived: false, is_featured: true }),
    countQuery("properties", { is_archived: false, is_published: false }),
    countQuery("leads", { is_archived: false, status: "New" }),
    countQuery("leads", { is_archived: false })
  ]);

  const stats = {
    total: total.count ?? 0,
    available: available.count ?? 0,
    forSale: forSale.count ?? 0,
    forRent: forRent.count ?? 0,
    forLease: forLease.count ?? 0,
    sold: sold.count ?? 0,
    rented: rented.count ?? 0,
    featured: featured.count ?? 0,
    drafts: drafts.count ?? 0,
    newEnquiries: newEnquiries.count ?? 0,
    totalEnquiries: totalEnquiries.count ?? 0
  };

  DASHBOARD_STATS.forEach(s => {
    const el = document.getElementById(`stat-${s.key}`);
    if (el) el.textContent = stats[s.key] ?? 0;
  });

  // "Recent" widgets intentionally ask the server for only 5 rows via an
  // explicit .limit(5) — a deliberate UI choice for a small activity
  // list, not a hidden cap on the underlying data (the stats above
  // already prove the true totals can be far larger than 5).
  const [recentPropsRes, recentLeadsRes] = await Promise.all([
    window.supabaseClient.from("properties").select("id, title, location, updated_at")
      .eq("is_archived", false).order("updated_at", { ascending: false }).limit(5),
    window.supabaseClient.from("leads").select("id, name, source, status, created_at")
      .eq("is_archived", false).order("created_at", { ascending: false }).limit(5)
  ]);
  const recent = recentPropsRes.data || [];
  const leads = recentLeadsRes.data || [];
  document.getElementById("recentProperties").innerHTML = recent.length
    ? recent.map(p => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);">
          <div>
            <div style="font-weight:600;font-size:13.5px;">${p.title}</div>
            <div style="font-size:12px;color:var(--slate);">${p.location || ""}</div>
          </div>
          <a href="property-edit.html?id=${p.id}" class="admin-btn admin-btn-ghost admin-btn-sm">Edit</a>
        </div>
      `).join("")
    : `<p style="color:var(--slate);font-size:13px;">No properties yet. <a href="property-edit.html" style="color:var(--orange-600);font-weight:600;">Add your first one</a>.</p>`;

  document.getElementById("recentLeads").innerHTML = leads.length
    ? leads.map(l => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);">
          <div>
            <div style="font-weight:600;font-size:13.5px;">${l.name || "Unnamed"}</div>
            <div style="font-size:12px;color:var(--slate);">${leadSourceLabel(l.source)}</div>
          </div>
          <span class="admin-badge admin-badge-orange">${l.status}</span>
        </div>
      `).join("")
    : `<p style="color:var(--slate);font-size:13px;">No enquiries yet.</p>`;
}

function leadSourceLabel(source) {
  const map = {
    property_enquiry: "Property Enquiry",
    list_with_us: "List With Us",
    free_valuation: "Free Valuation",
    joint_venture: "Joint Venture",
    nri_services: "NRI Services",
    contact_form: "Contact Form"
  };
  return map[source] || source;
}

document.addEventListener("DOMContentLoaded", loadDashboard);
