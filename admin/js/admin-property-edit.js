const AMENITIES_LIST = [
  "Car Parking", "Lift", "Power Backup", "Security", "CCTV", "Gated Community",
  "Swimming Pool", "Gym", "Clubhouse", "Garden", "Balcony", "Private Terrace",
  "Water Supply", "EB Connection", "Rainwater Harvesting", "Metro Water",
  "Borewell", "Pet Friendly", "Corner Property", "Main Road Property", "Sea View", "Other"
];

// Every field id in the form maps 1:1 to a `properties` column via the
// "f-<column_name>" convention, so load/save can loop instead of listing
// every field twice.
const TEXT_FIELDS = [
  "title", "reference_id", "category", "listing_type", "status",
  "location", "locality", "city", "state", "pincode", "full_address",
  "google_maps_url", "latitude", "longitude",
  "display_price", "price_per_sqft", "price",
  "land_area", "builtup_area", "carpet_area", "uds", "plot_area", "area_unit",
  "bedrooms", "bathrooms", "balconies", "car_parking", "property_age",
  "floor_number", "total_floors", "facing", "furnishing", "possession_status",
  "road_width", "frontage", "depth", "approval_authority", "rera_info",
  "short_description", "full_description", "nearby_landmarks",
  "video_youtube_url", "video_instagram_url", "video_other_url",
  "slug", "seo_title", "seo_description", "seo_keywords", "canonical_url", "og_image_url"
];
const CHECKBOX_FIELDS = ["is_negotiable", "is_price_on_request"];

let editingPropertyId = null;
let currentImages = []; // { id, public_url, is_featured_image, sort_order, storage_path } — new uploads pushed here too
let draggedImageId = null;

async function loadPropertyEditPage() {
  const session = await requireAdminAuth();
  if (!session) return;
  watchAuthState();
  renderAdminShell();

  const content = document.getElementById("adminContent");
  const template = document.getElementById("propertyEditTemplate");
  content.appendChild(template.content.cloneNode(true));

  initTabs();
  renderAmenitiesChecklist();
  initImageUpload();

  editingPropertyId = new URLSearchParams(window.location.search).get("id");
  if (editingPropertyId) {
    document.getElementById("ADMIN_PAGE_TITLE_EL") // no-op guard, title already set via head script
    await loadExistingProperty(editingPropertyId);
  }

  document.getElementById("saveDraftBtn").addEventListener("click", () => saveProperty(false));
  document.getElementById("publishBtn").addEventListener("click", () => saveProperty(true));
  document.getElementById("previewBtn").addEventListener("click", previewProperty);
}

function initTabs() {
  const tabs = document.querySelectorAll(".pe-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".pe-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector(`.pe-panel[data-panel="${tab.dataset.tab}"]`).classList.add("active");
    });
  });
}

function renderAmenitiesChecklist() {
  const grid = document.getElementById("amenitiesGrid");
  grid.innerHTML = AMENITIES_LIST.map(a => `
    <label class="admin-checkbox">
      <input type="checkbox" value="${a}" class="amenity-checkbox">
      ${a}
    </label>
  `).join("");
}

async function loadExistingProperty(id) {
  const { data, error } = await window.supabaseClient
    .from("properties").select("*, property_images(*)").eq("id", id).single();

  if (error || !data) {
    showAdminToast("Couldn't load this property.", "error");
    return;
  }

  TEXT_FIELDS.forEach(field => {
    const el = document.getElementById(`f-${field}`);
    if (el && data[field] != null) el.value = data[field];
  });
  CHECKBOX_FIELDS.forEach(field => {
    const el = document.getElementById(`f-${field}`);
    if (el) el.checked = !!data[field];
  });

  if (data.highlights) document.getElementById("f-highlights").value = (data.highlights || []).join("\n");
  const amenitySet = new Set(data.amenities || []);
  document.querySelectorAll(".amenity-checkbox").forEach(cb => { cb.checked = amenitySet.has(cb.value); });

  currentImages = (data.property_images || []).sort((a, b) => a.sort_order - b.sort_order);
  renderImageGrid();
}

function collectFormData() {
  const payload = {};
  TEXT_FIELDS.forEach(field => {
    const el = document.getElementById(`f-${field}`);
    if (!el) return;
    let val = el.value.trim();
    if (["price", "price_per_sqft", "bedrooms", "bathrooms", "balconies", "latitude", "longitude"].includes(field)) {
      payload[field] = val === "" ? null : Number(val);
    } else {
      payload[field] = val === "" ? null : val;
    }
  });
  CHECKBOX_FIELDS.forEach(field => {
    payload[field] = document.getElementById(`f-${field}`).checked;
  });

  payload.highlights = document.getElementById("f-highlights").value
    .split("\n").map(s => s.trim()).filter(Boolean);
  payload.amenities = Array.from(document.querySelectorAll(".amenity-checkbox:checked")).map(cb => cb.value);

  if (!payload.slug) {
    payload.slug = slugify(payload.title || "property") + "-" + Date.now().toString(36).slice(-5);
  }

  return payload;
}

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function saveProperty(publish) {
  const requiredIds = ["f-title", "f-category", "f-listing_type", "f-location"];
  const invalid = requiredIds.filter(id => !document.getElementById(id).value.trim());
  if (invalid.length) {
    document.getElementById("propertyFormStatus").textContent = "Please fill in the required fields (Title, Category, Listing Type, Location) in the Basic Details tab.";
    document.querySelector('.pe-tab[data-tab="basic"]').click();
    return;
  }

  const payload = collectFormData();
  payload.is_published = publish;
  document.getElementById("propertyFormStatus").textContent = "Saving…";

  let result;
  if (editingPropertyId) {
    result = await window.supabaseClient.from("properties").update(payload).eq("id", editingPropertyId).select().single();
  } else {
    result = await window.supabaseClient.from("properties").insert(payload).select().single();
  }

  if (result.error) {
    document.getElementById("propertyFormStatus").textContent = "";
    showAdminToast("Save failed: " + result.error.message, "error");
    return;
  }

  editingPropertyId = result.data.id;
  window.history.replaceState({}, "", `property-edit.html?id=${editingPropertyId}`);
  document.getElementById("propertyFormStatus").textContent = `Saved · ${new Date().toLocaleTimeString()}`;
  showAdminToast(publish ? "Property published." : "Draft saved.", "success");
}

function previewProperty() {
  const slug = document.getElementById("f-slug").value || slugify(document.getElementById("f-title").value || "");
  if (!editingPropertyId) {
    showAdminToast("Save the property first, then preview.", "error");
    return;
  }
  window.open(`../index.html?property=${slug || editingPropertyId}`, "_blank");
}

/* ---------- Images ---------- */
function initImageUpload() {
  const dropzone = document.getElementById("imageDropzone");
  const input = document.getElementById("imageFileInput");

  input.addEventListener("change", () => handleImageFiles(input.files));

  dropzone.addEventListener("dragover", e => { e.preventDefault(); dropzone.classList.add("dragover"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", e => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    handleImageFiles(e.dataTransfer.files);
  });
}

async function handleImageFiles(fileList) {
  if (!editingPropertyId) {
    showAdminToast("Save the property (Save Draft is fine) before uploading images.", "error");
    return;
  }

  const files = Array.from(fileList).filter(f => {
    const validType = ["image/jpeg", "image/png", "image/webp"].includes(f.type);
    const validSize = f.size <= 8 * 1024 * 1024;
    if (!validType) showAdminToast(`${f.name}: unsupported file type.`, "error");
    if (!validSize) showAdminToast(`${f.name}: file too large (max 8MB).`, "error");
    return validType && validSize;
  });
  if (!files.length) return;

  const progressWrap = document.getElementById("uploadProgressWrap");
  const progressFill = document.getElementById("uploadProgressFill");
  const progressLabel = document.getElementById("uploadProgressLabel");
  progressWrap.style.display = "block";

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    progressLabel.textContent = `Uploading ${i + 1} of ${files.length}: ${file.name}`;
    progressFill.style.width = `${Math.round(((i) / files.length) * 100)}%`;

    // Unique, safe filename: propertyId/timestamp-random.ext — never
    // collides with another property's images or another upload of the
    // same original filename.
    const ext = file.name.split(".").pop().replace(/[^a-z0-9]/gi, "").toLowerCase();
    const safeName = `${editingPropertyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await window.supabaseClient.storage
      .from("property-images").upload(safeName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      showAdminToast(`${file.name}: upload failed — ${uploadError.message}`, "error");
      continue;
    }

    const { data: urlData } = window.supabaseClient.storage.from("property-images").getPublicUrl(safeName);

    const isFirstImageEver = currentImages.length === 0;
    const { data: imgRow, error: insertError } = await window.supabaseClient
      .from("property_images")
      .insert({
        property_id: editingPropertyId,
        storage_path: safeName,
        public_url: urlData.publicUrl,
        alt_text: document.getElementById("f-title").value || "",
        is_featured_image: isFirstImageEver,
        sort_order: currentImages.length
      })
      .select().single();

    if (insertError) {
      showAdminToast(`${file.name}: saved to storage but failed to record — ${insertError.message}`, "error");
      continue;
    }

    currentImages.push(imgRow);
  }

  progressFill.style.width = "100%";
  setTimeout(() => { progressWrap.style.display = "none"; progressFill.style.width = "0%"; }, 600);
  renderImageGrid();
  showAdminToast("Images uploaded.", "success");
}

function renderImageGrid() {
  const grid = document.getElementById("imageGrid");
  grid.innerHTML = currentImages.map(img => `
    <div class="admin-image-item ${img.is_featured_image ? "featured" : ""}" draggable="true" data-image-id="${img.id}">
      ${img.is_featured_image ? '<span class="admin-image-featured-tag">Featured</span>' : ""}
      <img src="${img.public_url}" alt="${img.alt_text || ""}">
      <div class="admin-image-actions">
        <button type="button" data-set-featured="${img.id}" aria-label="Set as featured image" title="Set as featured image">
          <svg viewBox="0 0 24 24" fill="${img.is_featured_image ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
        <button type="button" data-delete-image="${img.id}" aria-label="Delete image" title="Delete image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll("[data-set-featured]").forEach(btn =>
    btn.addEventListener("click", () => setFeaturedImage(btn.dataset.setFeatured))
  );
  grid.querySelectorAll("[data-delete-image]").forEach(btn =>
    btn.addEventListener("click", () => deleteImage(btn.dataset.deleteImage))
  );
  wireImageDragReorder();
}

async function setFeaturedImage(imageId) {
  // Selecting a new featured image never deletes or affects any other
  // image — it only flips the boolean flag on the old and new featured
  // rows, everything else in the gallery stays exactly as-is.
  const previousFeatured = currentImages.find(i => i.is_featured_image);
  currentImages.forEach(i => { i.is_featured_image = i.id === imageId; });
  renderImageGrid();

  const updates = [
    window.supabaseClient.from("property_images").update({ is_featured_image: true }).eq("id", imageId)
  ];
  if (previousFeatured && previousFeatured.id !== imageId) {
    updates.push(window.supabaseClient.from("property_images").update({ is_featured_image: false }).eq("id", previousFeatured.id));
  }
  await Promise.all(updates);
}

async function deleteImage(imageId) {
  const img = currentImages.find(i => i.id === imageId);
  if (!img) return;
  if (!window.confirm("Delete this image? This only removes it from this property — no other property is affected.")) return;

  await window.supabaseClient.storage.from("property-images").remove([img.storage_path]);
  await window.supabaseClient.from("property_images").delete().eq("id", imageId);

  const wasFeatured = img.is_featured_image;
  currentImages = currentImages.filter(i => i.id !== imageId);

  // If the featured image was deleted, promote the next one so the
  // property never ends up with zero featured image while others remain.
  if (wasFeatured && currentImages.length) {
    currentImages[0].is_featured_image = true;
    await window.supabaseClient.from("property_images").update({ is_featured_image: true }).eq("id", currentImages[0].id);
  }

  renderImageGrid();
  showAdminToast("Image deleted.", "success");
}

function wireImageDragReorder() {
  const items = document.querySelectorAll("[data-image-id]");
  items.forEach(item => {
    item.addEventListener("dragstart", () => { draggedImageId = item.dataset.imageId; item.style.opacity = "0.4"; });
    item.addEventListener("dragend", () => { item.style.opacity = "1"; });
    item.addEventListener("dragover", e => e.preventDefault());
    item.addEventListener("drop", async e => {
      e.preventDefault();
      const targetId = item.dataset.imageId;
      if (!draggedImageId || draggedImageId === targetId) return;

      const fromIdx = currentImages.findIndex(i => i.id === draggedImageId);
      const toIdx = currentImages.findIndex(i => i.id === targetId);
      const [moved] = currentImages.splice(fromIdx, 1);
      currentImages.splice(toIdx, 0, moved);

      currentImages.forEach((img, idx) => { img.sort_order = idx; });
      renderImageGrid();

      await Promise.all(currentImages.map((img, idx) =>
        window.supabaseClient.from("property_images").update({ sort_order: idx }).eq("id", img.id)
      ));
    });
  });
}

document.addEventListener("DOMContentLoaded", loadPropertyEditPage);
