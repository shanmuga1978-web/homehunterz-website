/* ==========================================================================
   ADMIN AUTH
   ------------------------------------------------------------------------
   Uses Supabase Auth directly — no custom password handling anywhere in
   this codebase. Supabase stores passwords hashed on their end; this
   frontend only ever sends the password once, over HTTPS, to Supabase's
   own login endpoint, and gets back a session token it stores (Supabase's
   client library manages that storage/refresh itself).
   ========================================================================== */

const ADMIN_LOGIN_PAGE = "login.html";

/* Call at the top of every protected admin page (dashboard, properties,
   leads, etc). Redirects to the login page if there's no active session.
   Returns the session if one exists, so pages can show "Logged in as…". */
async function requireAdminAuth() {
  if (!window.supabaseClient) {
    // Supabase isn't configured yet — send to login, which will show a
    // clear explanation rather than silently failing.
    window.location.href = ADMIN_LOGIN_PAGE;
    return null;
  }

  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = ADMIN_LOGIN_PAGE;
    return null;
  }
  return session;
}

/* If Supabase's session ever expires or is signed out from another tab,
   bounce back to login immediately rather than leaving a stale admin
   page visible. */
function watchAuthState() {
  if (!window.supabaseClient) return;
  window.supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      window.location.href = ADMIN_LOGIN_PAGE;
    }
  });
}

async function adminLogout() {
  if (window.supabaseClient) {
    await window.supabaseClient.auth.signOut();
  }
  window.location.href = ADMIN_LOGIN_PAGE;
}

/* ---------- Login page wiring ---------- */
function initAdminLoginForm() {
  const form = document.getElementById("adminLoginForm");
  if (!form) return;

  const errorBox = document.getElementById("adminLoginError");
  const submitBtn = form.querySelector('button[type="submit"]');
  const passwordInput = document.getElementById("adminPassword");
  const toggleBtn = document.getElementById("adminPasswordToggle");

  if (!window.supabaseClient) {
    errorBox.textContent = "Supabase isn't configured yet. See supabase/SETUP.md to finish one-time setup before logging in.";
    errorBox.classList.add("show");
    submitBtn.disabled = true;
  }

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      toggleBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    });
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    errorBox.classList.remove("show");

    const email = document.getElementById("adminEmail").value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      errorBox.textContent = "Enter both your email and password.";
      errorBox.classList.add("show");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in…";

    const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      errorBox.textContent = "Incorrect email or password.";
      errorBox.classList.add("show");
      submitBtn.disabled = false;
      submitBtn.textContent = "Log In";
      return;
    }

    window.location.href = "dashboard.html";
  });
}

/* ---------- Change password (used on the Profile page) ---------- */
async function changeAdminPassword(newPassword) {
  if (!window.supabaseClient) return { error: "Supabase not configured." };
  const { error } = await window.supabaseClient.auth.updateUser({ password: newPassword });
  return { error: error ? error.message : null };
}
