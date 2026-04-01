const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function setYear() {
  const el = $("#year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function initMobileNav() {
  const toggle = $(".nav__toggle");
  const links = $("#navLinks");
  if (!toggle || !links) return;

  const close = () => {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    if (toggle.contains(e.target) || links.contains(e.target)) return;
    close();
  });

  $$(".nav__link", links).forEach((a) => {
    a.addEventListener("click", () => close());
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function initSmoothScrollOffset() {
  // Keep smooth scroll but account for sticky header height.
  const header = $(".site-header");
  if (!header) return;

  const getOffset = () => header.getBoundingClientRect().height + 14;

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#" || href === "#top") return;

      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const y = window.scrollY + target.getBoundingClientRect().top - getOffset();
      window.scrollTo({ top: y, behavior: "smooth" });

      history.pushState(null, "", href);
    });
  });
}

function initActiveNavLink() {
  const links = $$(".nav__link");
  if (!links.length) return;

  const byHash = new Map(links.map((a) => [a.getAttribute("href"), a]));
  const sections = links
    .map((a) => {
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#") || href.length < 2) return null;
      const el = document.getElementById(href.slice(1));
      if (!el) return null;
      return { href, el };
    })
    .filter(Boolean);

  const setActive = (href) => {
    links.forEach((a) => a.classList.remove("is-active"));
    const a = byHash.get(href);
    if (a) a.classList.add("is-active");
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
      if (!visible) return;

      const match = sections.find((s) => s.el === visible.target);
      if (match) setActive(match.href);
    },
    { root: null, threshold: [0.2, 0.35, 0.5], rootMargin: "-25% 0px -65% 0px" }
  );

  sections.forEach((s) => io.observe(s.el));

  // On load, match current hash.
  if (location.hash && byHash.has(location.hash)) setActive(location.hash);
}

function initTestimonialsSlider() {
  const slider = $("[data-slider]");
  const track = $("[data-slider-track]");
  if (!slider || !track) return;

  const prev = $("[data-slider-prev]");
  const next = $("[data-slider-next]");

  const scrollByCard = (dir) => {
    const card = track.querySelector(".t-card");
    const gap = 14;
    const amount = (card ? card.getBoundingClientRect().width : 320) + gap;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  prev?.addEventListener("click", () => scrollByCard(-1));
  next?.addEventListener("click", () => scrollByCard(1));

  // Keyboard support when slider is focused.
  slider.tabIndex = 0;
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") scrollByCard(-1);
    if (e.key === "ArrowRight") scrollByCard(1);
  });
}

const cloudName = "dgq3xkdqy";
const folder = "Cofetarie";

fetch(`https://res.cloudinary.com/${cloudName}/image/list/${folder}.json`)
  .then((res) => res.json())
  .then((data) => {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    data.resources.forEach((img) => {
      const image = document.createElement("img");
      image.src = `https://res.cloudinary.com/${cloudName}/image/upload/${img.public_id}.jpg`;
      image.className = "gallery-image";
      gallery.appendChild(image);
    });
  })
  .catch((err) => console.error("Cloudinary error:", err));

setYear();
initMobileNav();
initSmoothScrollOffset();
initActiveNavLink();
initTestimonialsSlider();

