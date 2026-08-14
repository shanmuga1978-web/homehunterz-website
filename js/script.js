/* ==========================================================================
   HOME HUNTERZ — MAIN SCRIPT
   Table of contents:
     1. EDITABLE DATA (Properties + Testimonials) — edit ONLY this section
        to add/remove/update content. No HTML editing required.
     2. Property Card Renderer + Details Modal
     3. Testimonial Renderer + Carousel
     4. Back-to-Top + Scroll Progress Ring
     5. Hero Slideshow
     5b. Hero Property-Intent Selector (Buy/Sell/Rent/Land)
     6. Mobile Navigation
     7. Scroll Reveal Animations
     8. Contact Form Handling
     9. Footer Year
     10. Init
   ========================================================================== */

/* ==========================================================================
   1. EDITABLE DATA
   ------------------------------------------------------------------------
   PROPERTIES: To add a new property, copy one object below, paste it into
   the array, and edit the fields. The card, quick-spec chips and the
   "View Details" modal are all built automatically from this data — no
   HTML changes needed.

   Image field expects a base path WITHOUT extension, e.g.
   "images/properties/prop-7-new-listing" — the renderer automatically
   builds a <picture> tag that serves the .webp version with a .jpg
   fallback, so just save both files with that same name.
   ========================================================================== */
const PROPERTIES = [
  {
    id: "prop-1",
    tag: "For Sale",
    title: "Flat for Sale – Perumbakkam",
    location: "Near Global Hospital Bus Stop",
    price: null,
    image: "images/properties/prop-1-perumbakkam",
    imageAlt: "Living room interior of flat for sale in Perumbakkam",
    features: [
      "Flat Area: 1250 Sq.Ft.",
      "UDS: 52%",
      "Covered Car Parking",
      "Library",
      "Kids Playing Area",
      "24×7 Water",
      "Security",
      "Piped Gas"
    ]
  },
  {
    id: "prop-2",
    tag: "Resale",
    title: "2 BHK Flat – West Tambaram (Resale)",
    location: "West Tambaram",
    price: "₹45 Lakhs (Rate Negotiable)",
    image: "images/properties/prop-2-west-tambaram",
    imageAlt: "Interior of 2 BHK resale flat in West Tambaram",
    features: [
      "2 BHK",
      "Flat Area: 980 Sq.Ft. & 985 Sq.Ft.",
      "UDS: 400 Sq.Ft.",
      "Total Floors: 4",
      "Total Flats: 20",
      "Available Flats: FF4 & FF5",
      "Fourth Floor, North Facing",
      "Unfurnished",
      "Covered Car Parking",
      "Lift Available",
      "Borewell & Metro Water",
      "Approved Flat",
      "8 Years Old",
      "Road Facing"
    ]
  },
  {
    id: "prop-3",
    tag: "For Sale",
    title: "Flat for Sale – K.K. Nagar",
    location: "K.K. Nagar",
    price: "₹55 Lakhs",
    image: "images/properties/prop-3-kk-nagar",
    imageAlt: "Interior of flat for sale in K.K. Nagar",
    features: [
      "2 BHK",
      "Flat Area: 995 Sq.Ft.",
      "UDS: 280 Sq.Ft.",
      "Second Floor",
      "Total Floors: 2",
      "Total Flats: 14",
      "No Parking",
      "No Lift"
    ]
  },
  {
    id: "prop-4",
    tag: "For Sale",
    title: "Villa for Sale – East Tambaram, Selaiyur",
    location: "East Tambaram, Selaiyur",
    price: "₹80 Lakhs",
    image: "images/properties/prop-4-east-tambaram-villa",
    imageAlt: "Exterior of villa for sale in East Tambaram, Selaiyur",
    features: [
      "2 BHK",
      "Built-up Area: 1550 Sq.Ft.",
      "Land Area: 915 Sq.Ft.",
      "Ground + First Floor"
    ]
  },
  {
    id: "prop-5",
    tag: "For Sale",
    title: "Independent 4 BHK Villa – Perungudi, OMR",
    location: "Perungudi, OMR",
    price: null,
    image: "images/properties/prop-5-perungudi-omr-villa",
    imageAlt: "Bedroom interior of independent villa in Perungudi, OMR",
    features: [
      "4 BHK",
      "Gated Community",
      "Ground + 2 Floors",
      "Land Area: 1600 Sq.Ft.",
      "Built-up Area: 2500+ Sq.Ft.",
      "2 Car Parks"
    ]
  },
  {
    id: "prop-6",
    tag: "For Sale",
    title: "Independent House – Adyar",
    location: "Adyar",
    price: "₹3.5 Crores",
    image: "images/properties/prop-6-adyar-house",
    imageAlt: "Interior of independent house for sale in Adyar",
    features: [
      "G+2 Building",
      "Built-up Area: 1379 Sq.Ft.",
      "Land Area: 909 Sq.Ft.",
      "10 Feet Passage Property"
    ]
  }

  /* Example — copy this block to add another property:
  {
    id: "prop-7",
    tag: "For Rent",
    title: "2 BHK Apartment – Velachery",
    location: "Velachery",
    price: "₹35,000 / month",
    image: "images/properties/prop-7-velachery",
    imageAlt: "2 BHK apartment for rent in Velachery, Chennai",
    features: [
      "2 BHK",
      "Flat Area: 1100 Sq.Ft.",
      "Covered Car Parking",
      "Lift Available"
    ]
  },
  */
];

/* TESTIMONIALS: same pattern — copy an object to add a new review. */
const TESTIMONIALS = [
  {
    quote: "Home Hunterz made our first home purchase feel simple. Every document was explained before we signed anything — no pressure, just clarity.",
    name: "Priya Ramachandran",
    role: "Homebuyer, Adyar"
  },
  {
    quote: "We sold our plot within weeks at a fair price. What stood out was how quickly enquiries were followed up and filtered for us.",
    name: "Karthik Subramanian",
    role: "Seller, Sriperumbudur"
  },
  {
    quote: "As an NRI investor, I needed someone I could trust on the ground. Home Hunterz handled site visits and paperwork end to end.",
    name: "Deepa Narayanan",
    role: "Investor, OMR"
  }
];

/* Shared contact details used across property cards and the modal. */
const CONTACT = {
  phone: "+919884038618",
  phoneDisplay: "+91 98840 38618",
  whatsapp: "919884038618"
};

/* ==========================================================================
   2. PROPERTY CARD RENDERER + DETAILS MODAL
   ========================================================================== */
function renderProperties(list, query) {
  const grid = document.getElementById("propertyGrid");
  if (!grid) return;
  const items = list || PROPERTIES;

  if (!items.length) {
    grid.innerHTML = query
      ? `<p class="prop-empty">No properties found for "${escapeHtml(query)}". <button type="button" class="prop-empty-reset" id="propEmptyReset">Clear search</button> or contact us directly for current inventory.</p>`
      : '<p class="prop-empty">New listings are being added — check back soon, or contact us directly for current inventory.</p>';
    const resetBtn = document.getElementById("propEmptyReset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        const input = document.getElementById("heroLocationInput");
        if (input) input.value = "";
        renderProperties();
      });
    }
    return;
  }

  grid.innerHTML = items.map(buildPropertyCard).join("");

  // Wire up "View Details" buttons after render
  grid.querySelectorAll("[data-view-details]").forEach(btn => {
    btn.addEventListener("click", () => openPropertyModal(btn.getAttribute("data-view-details")));
  });

  // Fade the freshly-injected cards in (own observer, scoped to this grid).
  observeReveal(grid.querySelectorAll(".reveal"));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function buildPropertyCard(property) {
  const priceHtml = property.price
    ? `<span class="prop-price-label">Price</span><div class="prop-price">${property.price}</div>`
    : `<span class="prop-price-label">Price</span><div class="prop-price prop-price-muted">On Request</div>`;

  const quickFeatures = property.features.slice(0, 3);
  const quickHtml = quickFeatures
    .map(f => `<span>${featureIcon()} ${f}</span>`)
    .join("");

  const waMessage = encodeURIComponent(`Hi Home Hunterz, I'm interested in "${property.title}". Could you share more details?`);

  return `
    <article class="prop-card reveal" aria-labelledby="${property.id}-title">
      <div class="prop-media">
        <picture>
          <source srcset="${property.image}.webp" type="image/webp">
          <img src="${property.image}.jpg" alt="${property.imageAlt}" loading="lazy" width="900" height="600">
        </picture>
        <span class="prop-tag">${property.tag}</span>
      </div>
      <div class="prop-body">
        ${priceHtml}
        <div class="prop-loc" id="${property.id}-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${property.title}${property.location ? " · " + property.location : ""}</span>
        </div>
        <div class="prop-specs">${quickHtml}${property.features.length > 3 ? `<span class="prop-more">+${property.features.length - 3} more</span>` : ""}</div>
        <div class="prop-actions">
          <a class="btn-icon" href="tel:${CONTACT.phone}" aria-label="Call about ${property.title}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.79.65 2.65a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.43-1.22a2 2 0 0 1 2.11-.45c.86.31 1.75.53 2.65.65A2 2 0 0 1 22 16.92z"/></svg>
          </a>
          <a class="btn-icon whatsapp" href="https://wa.me/${CONTACT.whatsapp}?text=${waMessage}" target="_blank" rel="noopener" aria-label="WhatsApp about ${property.title}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 20l1-5.4A8.5 8.5 0 1 1 21 11.5z"/></svg>
          </a>
          <button type="button" class="btn btn-outline dark btn-sm prop-details-btn" data-view-details="${property.id}">View Details</button>
        </div>
      </div>
    </article>
  `;
}

function featureIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
}

function openPropertyModal(propertyId) {
  const property = PROPERTIES.find(p => p.id === propertyId);
  const modal = document.getElementById("propertyModal");
  const body = document.getElementById("propertyModalBody");
  if (!property || !modal || !body) return;

  const priceHtml = property.price
    ? `<div class="modal-price">${property.price}</div>`
    : `<div class="modal-price modal-price-muted">Price on Request</div>`;

  const featuresHtml = property.features.map(f => `<li>${featureIcon()} ${f}</li>`).join("");
  const waMessage = encodeURIComponent(`Hi Home Hunterz, I'm interested in "${property.title}". Could you share more details?`);

  body.innerHTML = `
    <picture>
      <source srcset="${property.image}.webp" type="image/webp">
      <img src="${property.image}.jpg" alt="${property.imageAlt}" width="900" height="600">
    </picture>
    <span class="prop-tag modal-tag">${property.tag}</span>
    <h3 id="propertyModalTitle">${property.title}</h3>
    ${property.location ? `<p class="modal-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${property.location}</p>` : ""}
    ${priceHtml}
    <ul class="modal-features">${featuresHtml}</ul>
    <div class="modal-actions">
      <a class="btn btn-primary" href="tel:${CONTACT.phone}">Call ${CONTACT.phoneDisplay}</a>
      <a class="btn btn-outline dark" href="https://wa.me/${CONTACT.whatsapp}?text=${waMessage}" target="_blank" rel="noopener">WhatsApp Home Hunterz</a>
    </div>
  `;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("propertyModalClose").focus();
}

function closePropertyModal() {
  const modal = document.getElementById("propertyModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function initPropertyModal() {
  const modal = document.getElementById("propertyModal");
  const closeBtn = document.getElementById("propertyModalClose");
  if (!modal || !closeBtn) return;

  closeBtn.addEventListener("click", closePropertyModal);

  // Clicking the dimmed backdrop (i.e. the modal wrapper itself, not the
  // panel inside it) closes the modal.
  modal.addEventListener("click", e => {
    if (e.target === modal) closePropertyModal();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.classList.contains("open")) closePropertyModal();
  });
}

/* ==========================================================================
   3. TESTIMONIAL RENDERER + CAROUSEL
   ========================================================================== */
let tIndex = 0;

function renderTestimonials() {
  const slidesWrap = document.getElementById("tSlides");
  const dotsWrap = document.getElementById("tDots");
  if (!slidesWrap || !dotsWrap) return;

  slidesWrap.innerHTML = TESTIMONIALS.map(t => {
    const initials = t.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    return `
    <div class="t-slide">
      <div class="t-card">
        <div class="t-quote-mark" aria-hidden="true">&ldquo;</div>
        <div class="t-stars" aria-hidden="true">★★★★★</div>
        <p class="t-quote">${t.quote}</p>
        <div class="t-person">
          <div class="t-avatar" aria-hidden="true">${initials}</div>
          <div class="t-person-text">
            <div class="t-name">${t.name}</div>
            <div class="t-role">${t.role}</div>
          </div>
        </div>
      </div>
    </div>
  `;
  }).join("");

  dotsWrap.innerHTML = "";
  TESTIMONIALS.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "t-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
    dot.addEventListener("click", () => goToTestimonial(i));
    dotsWrap.appendChild(dot);
  });
}

function goToTestimonial(i) {
  const slidesWrap = document.getElementById("tSlides");
  const dotsWrap = document.getElementById("tDots");
  if (!slidesWrap || !dotsWrap || !TESTIMONIALS.length) return;

  tIndex = (i + TESTIMONIALS.length) % TESTIMONIALS.length;
  slidesWrap.style.transform = `translateX(-${tIndex * 100}%)`;
  [...dotsWrap.children].forEach((dot, idx) => dot.classList.toggle("active", idx === tIndex));
}

function initTestimonialCarousel() {
  const prevBtn = document.getElementById("tPrev");
  const nextBtn = document.getElementById("tNext");
  const wrap = document.querySelector(".t-wrap");
  if (!wrap || !TESTIMONIALS.length) return;

  prevBtn.addEventListener("click", () => goToTestimonial(tIndex - 1));
  nextBtn.addEventListener("click", () => goToTestimonial(tIndex + 1));

  let auto = setInterval(() => goToTestimonial(tIndex + 1), 6000);
  wrap.addEventListener("mouseenter", () => clearInterval(auto));
  wrap.addEventListener("mouseleave", () => {
    auto = setInterval(() => goToTestimonial(tIndex + 1), 6000);
  });
}

/* ==========================================================================
   4. BACK-TO-TOP + SCROLL PROGRESS RING
   ------------------------------------------------------------------------
   Note: the header is a normal in-flow block (not fixed/sticky) per the
   client's requirement — it scrolls away with the page, so there is no
   header scroll-state logic here. The back-to-top button's outer ring
   fills clockwise with the brand orange as the visitor scrolls down the
   page, via the --progress custom property.
   ========================================================================== */
function initHeaderScrollEffects() {
  const ring = document.getElementById("toTopRing");
  const button = document.getElementById("toTop");
  const waFloat = document.querySelector(".wa-float");
  const hero = document.querySelector(".hero");
  if (!ring || !button) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;

    ring.style.setProperty("--progress", progress.toFixed(1));
    ring.classList.toggle("show", scrollTop > 400);

    // Mobile only (see .wa-float CSS): keep the floating WhatsApp button
    // out of the way of the hero's Buy/Sell/Rent/Land + search panel by
    // only revealing it once the hero has scrolled out of view. No effect
    // on desktop, where the button is always visible via CSS.
    if (waFloat && hero) {
      const heroPastView = hero.getBoundingClientRect().bottom <= 0;
      waFloat.classList.toggle("show", heroPastView);
    }
  }

  window.addEventListener("scroll", update);
  update(); // set correct initial state on load, before any scrolling

  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ==========================================================================
   5. HERO SLIDESHOW
   ------------------------------------------------------------------------
   Crossfades between the .hero-slide layers behind the (fixed-position)
   hero text/CTA/discovery panel — only the background visual changes.
   Each slide's Ken Burns scale (defined in CSS, skipped automatically
   under prefers-reduced-motion) is restarted on activation by toggling
   its inline animation off/on across a forced reflow, so it always plays
   from 100% scale rather than jumping in mid-way.
   All slide <img>s are eager-loaded in the HTML, and warmed here too, so
   the first frame is instant and later ones never show a blank flash.
   Pauses while the tab is hidden (Page Visibility API) to save battery.
   ========================================================================== */
function initHeroSlideshow() {
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-slide-dot"));
  if (slides.length < 2) return; // nothing to cycle

  // Warm the browser cache for every slide up front.
  slides.forEach(slide => {
    const img = slide.querySelector("img");
    if (img && img.src) {
      const preload = new Image();
      preload.src = img.src;
    }
  });

  let index = 0;
  let timer = null;
  const SLIDE_DURATION = 6000; // ms on screen per slide (5–6s per brief)

  function activate(i) {
    slides.forEach((slide, si) => {
      const isActive = si === i;
      slide.classList.toggle("active", isActive);
      if (isActive) {
        const img = slide.querySelector("img");
        if (img) {
          // Force the Ken Burns keyframe animation to restart from 100%
          // scale every time this slide comes back around.
          img.style.animation = "none";
          void img.offsetWidth; // eslint-disable-line no-unused-expressions
          img.style.animation = "";
        }
      }
    });
    dots.forEach((dot, di) => dot.classList.toggle("active", di === i));
    index = i;
  }

  function next() {
    activate((index + 1) % slides.length);
  }

  function start() {
    stop();
    timer = window.setInterval(next, SLIDE_DURATION);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  start();
}

/* ==========================================================================
   5b. HERO PROPERTY-INTENT SELECTOR (Buy / Sell / Rent / Land)
   ------------------------------------------------------------------------
   Segmented-control behaviour: clicking marks that intent active (orange
   highlight) and still takes the visitor to the right section, same as
   the plain links did before.
   ========================================================================== */
function initHeroIntentSelector() {
  const items = document.querySelectorAll(".hero-nav-item");
  if (!items.length) return;

  const targets = { buy: "#properties", sell: "#contact", rent: "#properties", land: "#properties" };

  items.forEach(item => {
    item.addEventListener("click", () => {
      items.forEach(el => el.classList.remove("active"));
      item.classList.add("active");

      const target = document.querySelector(targets[item.dataset.intent] || "#properties");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ==========================================================================
   6. MOBILE NAVIGATION
   ------------------------------------------------------------------------
   Right-side slide-in drawer: dark overlay behind, page stays visible,
   closes via the close button, overlay click, ESC, or picking a link.
   Body scroll is locked while open and restored on close.
   ========================================================================== */
function initMobileNav() {
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");
  const overlay = document.getElementById("mobileNavOverlay");
  const closeBtn = document.getElementById("mobileNavClose");
  if (!hamburger || !mobileNav || !overlay) return;

  function openDrawer() {
    mobileNav.classList.add("open");
    overlay.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
  }

  function closeDrawer() {
    mobileNav.classList.remove("open");
    overlay.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
  }

  hamburger.addEventListener("click", () => {
    mobileNav.classList.contains("open") ? closeDrawer() : openDrawer();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && mobileNav.classList.contains("open")) closeDrawer();
  });

  mobileNav.querySelectorAll("a").forEach(link =>
    link.addEventListener("click", closeDrawer)
  );
}

/* ==========================================================================
   6b. HERO PROPERTY SEARCH
   ------------------------------------------------------------------------
   Lightweight client-side filter over the existing PROPERTIES data —
   matches the search term against each listing's title and location,
   re-renders the Featured Properties grid, and scrolls it into view.
   No backend/routing involved; the Buy/Sell/Rent/Land bar above it links
   straight to the Properties / Contact sections, same as before.
   ========================================================================== */
function initHeroSearch() {
  const form = document.getElementById("heroSearchForm");
  const input = document.getElementById("heroLocationInput");
  const propertiesSection = document.getElementById("properties");
  if (!form || !input) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const query = input.value.trim();

    if (!query) {
      renderProperties();
    } else {
      const needle = query.toLowerCase();
      const matches = PROPERTIES.filter(p =>
        (p.location && p.location.toLowerCase().includes(needle)) ||
        p.title.toLowerCase().includes(needle)
      );
      renderProperties(matches, query);
    }

    if (propertiesSection) {
      propertiesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

/* ==========================================================================
   7. SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function observeReveal(els) {
  if (!els || !els.length) return;
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  els.forEach(el => io.observe(el));
}

function initScrollReveal() {
  // Property cards observe themselves (see renderProperties) since they're
  // rebuilt on every search — everything else is observed once here.
  const els = Array.from(document.querySelectorAll(".reveal")).filter(
    el => !el.closest("#propertyGrid")
  );
  observeReveal(els);
}

/* ==========================================================================
   8. CONTACT FORM HANDLING
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const success = document.getElementById("formSuccess");
  if (!form || !success) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nameField = document.getElementById("cf-name");
    const phoneField = document.getElementById("cf-phone");
    const emailField = document.getElementById("cf-email");
    const messageField = document.getElementById("cf-message");

    const isValid = [nameField, phoneField, emailField, messageField].every(field => {
      const wrapper = field.closest(".field");
      const valid = field.value.trim().length > 0 && field.checkValidity();
      wrapper.classList.toggle("invalid", !valid);
      return valid;
    });

    if (!isValid) return;

    const subject = encodeURIComponent(`New Enquiry from ${nameField.value}`);
    const body = encodeURIComponent(
      `Name: ${nameField.value}\nPhone: ${phoneField.value}\nEmail: ${emailField.value}\n\nMessage:\n${messageField.value}`
    );

    window.location.href = `mailto:homehunterzady@gmail.com?subject=${subject}&body=${body}`;
    success.classList.add("show");
    form.reset();
  });
}

/* ==========================================================================
   9. FOOTER YEAR
   ========================================================================== */
function setFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ==========================================================================
   10. INIT
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderProperties();
  // renderTestimonials() / initTestimonialCarousel() are paused — the
  // Testimonials section in index.html is commented out until real
  // client reviews are available. Uncomment both when it's restored.
  initPropertyModal();
  initHeaderScrollEffects();
  initHeroSlideshow();
  initHeroIntentSelector();
  initMobileNav();
  initHeroSearch();
  initScrollReveal();
  initContactForm();
  setFooterYear();
});
