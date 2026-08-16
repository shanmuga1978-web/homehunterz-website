/* ==========================================================================
   GENERIC SETTINGS FORM
   ------------------------------------------------------------------------
   Settings, Contact Details, SEO, and Homepage are all really just
   different subsets of fields on the same single `settings` row (see
   schema.sql — it's a singleton table, id is always 1). Rather than
   duplicate near-identical load/save code four times, each of those
   pages just calls initSettingsForm() with its own list of field ids —
   any element with id="s-<column_name>" gets populated on load and
   written back to that column on save.
   ========================================================================== */
async function initSettingsForm(fieldNames) {
  const session = await requireAdminAuth();
  if (!session) return;
  watchAuthState();
  renderAdminShell();

  const template = document.getElementById("settingsFormTemplate");
  document.getElementById("adminContent").appendChild(template.content.cloneNode(true));

  const { data, error } = await window.supabaseClient.from("settings").select("*").eq("id", 1).single();
  if (error) {
    showAdminToast("Couldn't load settings: " + error.message, "error");
  } else if (data) {
    fieldNames.forEach(field => {
      const el = document.getElementById(`s-${field}`);
      if (el && data[field] != null) el.value = data[field];
    });
  }

  document.getElementById("settingsForm").addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {};
    fieldNames.forEach(field => {
      const el = document.getElementById(`s-${field}`);
      if (el) payload[field] = el.value.trim() || null;
    });

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Saving…";

    const { error: saveError } = await window.supabaseClient.from("settings").update(payload).eq("id", 1);

    btn.disabled = false;
    btn.textContent = "Save Changes";

    if (saveError) {
      showAdminToast("Save failed: " + saveError.message, "error");
      return;
    }
    showAdminToast("Saved. Changes apply across the site immediately.", "success");
  });
}
