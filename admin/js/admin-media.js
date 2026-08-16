let allMediaImages = [];

async function loadMediaPage() {
  const session = await requireAdminAuth();
  if (!session) return;
  watchAuthState();
  renderAdminShell();

  document.getElementById("adminContent").appendChild(document.getElementById("mediaTemplate").content.cloneNode(true));

  // Media Library shows every image already tracked in property_images
  // (each row knows which property it belongs to, which is exactly what
  // lets us warn before deleting something still in use) rather than
  // listing raw Storage files directly.
  const { data, error } = await window.supabaseClient
    .from("property_images")
    .select("*, properties(title)")
    .order("created_at", { ascending: false });

  if (error) { showAdminToast("Couldn't load media: " + error.message, "error"); return; }
  allMediaImages = data || [];

  document.getElementById("mediaSearch").addEventListener("input", renderMediaGrid);
  renderMediaGrid();
}

function renderMediaGrid() {
  const search = document.getElementById("mediaSearch").value.trim().toLowerCase();
  const list = search
    ? allMediaImages.filter(img => (img.storage_path || "").toLowerCase().includes(search) || (img.properties && img.properties.title.toLowerCase().includes(search)))
    : allMediaImages;

  const grid = document.getElementById("mediaGrid");
  grid.innerHTML = list.length
    ? list.map(img => `
        <div class="admin-image-item ${img.is_featured_image ? "featured" : ""}">
          ${img.is_featured_image ? '<span class="admin-image-featured-tag">Featured</span>' : ""}
          <img src="${img.public_url}" alt="${img.alt_text || ""}" loading="lazy">
          <div class="admin-image-actions">
            <button type="button" data-delete-media="${img.id}" aria-label="Delete image" title="Delete image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </div>
        <div style="font-size:10.5px;color:var(--slate);margin-top:-8px;margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${img.properties ? img.properties.title : "Unknown property"}</div>
      `).join("")
    : `<div class="admin-empty" style="grid-column:1/-1;">No images match your search.</div>`;

  grid.querySelectorAll("[data-delete-media]").forEach(btn =>
    btn.addEventListener("click", () => deleteMediaImage(btn.dataset.deleteMedia))
  );
}

async function deleteMediaImage(id) {
  const img = allMediaImages.find(i => i.id === id);
  if (!img) return;

  const propertyName = img.properties ? img.properties.title : "a property";
  const warning = img.is_featured_image
    ? `This is the FEATURED image for "${propertyName}" — deleting it will leave that property without a featured photo (its next image, if any, becomes featured automatically). Continue?`
    : `Delete this image from "${propertyName}"? This can't be undone.`;

  if (!window.confirm(warning)) return;

  await window.supabaseClient.storage.from("property-images").remove([img.storage_path]);
  await window.supabaseClient.from("property_images").delete().eq("id", id);

  if (img.is_featured_image) {
    const sibling = allMediaImages.find(i => i.property_id === img.property_id && i.id !== id);
    if (sibling) {
      await window.supabaseClient.from("property_images").update({ is_featured_image: true }).eq("id", sibling.id);
      sibling.is_featured_image = true;
    }
  }

  allMediaImages = allMediaImages.filter(i => i.id !== id);
  renderMediaGrid();
  showAdminToast("Image deleted.", "success");
}

document.addEventListener("DOMContentLoaded", loadMediaPage);
