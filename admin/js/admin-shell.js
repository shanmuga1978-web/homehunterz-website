/* ==========================================================================
   ADMIN SHELL — renders the sidebar + topbar into every protected admin
   page so the nav only has to be maintained in one place. Each page sets
   window.ADMIN_PAGE_TITLE and window.ADMIN_ACTIVE_NAV before this runs
   (see the small inline script at the top of each admin HTML file).
   ========================================================================== */

const ADMIN_NAV = [
  { key: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "grid" },
  {
    key: "properties", label: "Properties", icon: "home",
    children: [
      { key: "properties-all", label: "All Properties", href: "properties.html" },
      { key: "properties-add", label: "Add Property", href: "property-edit.html" },
      { key: "properties-featured", label: "Featured", href: "properties.html?filter=featured" },
      { key: "properties-drafts", label: "Drafts", href: "properties.html?filter=drafts" },
      { key: "properties-archived", label: "Archived", href: "properties.html?filter=archived" }
    ]
  },
  {
    key: "leads", label: "Leads / Enquiries", icon: "inbox",
    children: [
      { key: "leads-all", label: "All Enquiries", href: "leads.html" },
      { key: "leads-property", label: "Property Enquiries", href: "leads.html?source=property_enquiry" },
      { key: "leads-list", label: "List With Us", href: "leads.html?source=list_with_us" },
      { key: "leads-valuation", label: "Free Valuation", href: "leads.html?source=free_valuation" },
      { key: "leads-jv", label: "Joint Venture", href: "leads.html?source=joint_venture" },
      { key: "leads-nri", label: "NRI Services", href: "leads.html?source=nri_services" }
    ]
  },
  { key: "testimonials", label: "Testimonials", href: "testimonials.html", icon: "star" },
  { key: "media", label: "Media Library", href: "media.html", icon: "image" },
  { key: "homepage", label: "Homepage", href: "homepage.html", icon: "layout" },
  { key: "contact", label: "Contact Details", href: "contact-settings.html", icon: "phone" },
  { key: "seo", label: "SEO", href: "seo.html", icon: "search" },
  { key: "profile", label: "Admin Profile", href: "profile.html", icon: "user" },
  { key: "settings", label: "Settings", href: "settings.html", icon: "settings" }
];

const ADMIN_ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.79.65 2.65a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.43-1.22a2 2 0 0 1 2.11-.45c.86.31 1.75.53 2.65.65A2 2 0 0 1 22 16.92z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
};

function renderAdminShell() {
  const slot = document.getElementById("adminShellSlot");
  if (!slot) return;

  const activeKey = window.ADMIN_ACTIVE_NAV || "";
  const pageTitle = window.ADMIN_PAGE_TITLE || "";

  const navHtml = ADMIN_NAV.map(item => {
    if (item.children) {
      const childActive = item.children.some(c => c.key === activeKey);
      const childrenHtml = item.children.map(c => `
        <a href="${c.href}" class="${c.key === activeKey ? "active" : ""}">${c.label}</a>
      `).join("");
      return `
        <div class="admin-nav-item-group">
          <span class="admin-nav-toggle" style="opacity:.9;cursor:default;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ADMIN_ICONS[item.icon]}</svg>
            ${item.label}
          </span>
          <div class="admin-nav-sub">${childrenHtml}</div>
        </div>
      `;
    }
    return `
      <a href="${item.href}" class="${item.key === activeKey ? "active" : ""}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ADMIN_ICONS[item.icon]}</svg>
        ${item.label}
      </a>
    `;
  }).join("");

  slot.innerHTML = `
    <div class="admin-shell">
      <aside class="admin-sidebar" id="adminSidebar">
        <div class="admin-brand">
          <img src="../icons/home-hunterz-icon-transparent.png" alt="">
          <div>
            <div class="admin-brand-word">HOME <span>HUNTERZ</span></div>
            <span class="admin-brand-sub">Admin</span>
          </div>
        </div>
        <nav class="admin-nav">${navHtml}</nav>
        <div class="admin-sidebar-footer">
          <button type="button" class="admin-logout-btn" id="adminLogoutBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </aside>
      <div class="admin-mobile-overlay" id="adminMobileOverlay" style="display:none;position:fixed;inset:0;background:rgba(10,17,48,.5);z-index:890;"></div>
      <div class="admin-main">
        <div class="admin-topbar">
          <div style="display:flex;align-items:center;gap:12px;">
            <button class="admin-mobile-toggle" id="adminMobileToggle" aria-label="Open menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1>${pageTitle}</h1>
          </div>
          <div class="admin-topbar-actions" id="adminTopbarActions"></div>
        </div>
        <div class="admin-content" id="adminContent"></div>
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById("adminLogoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", adminLogout);

  const mobileToggle = document.getElementById("adminMobileToggle");
  const sidebar = document.getElementById("adminSidebar");
  const overlay = document.getElementById("adminMobileOverlay");
  if (mobileToggle && sidebar && overlay) {
    mobileToggle.addEventListener("click", () => {
      sidebar.classList.add("open");
      overlay.style.display = "block";
    });
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.style.display = "none";
    });
  }
}

function showAdminToast(message, type) {
  const existing = document.querySelector(".admin-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `admin-toast ${type || ""}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
