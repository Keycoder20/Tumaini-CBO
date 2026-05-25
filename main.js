/* ============================================================
   Tumaini Dice CBO – Main JavaScript
   main.js  |  Mbita, Kenya
   ============================================================ */

'use strict';

/* ── 1. SCROLL PROGRESS BAR ── */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();


/* ── 2. NAVBAR: shrink on scroll + active link highlight ── */
(function initNavbar() {
  const nav        = document.querySelector('nav');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');
  const allLinks   = navLinks ? navLinks.querySelectorAll('a[href^="#"]') : [];
  const sections   = [];

  // Build section list from nav links
  allLinks.forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    const section = document.getElementById(id);
    if (section) sections.push({ id, section, link });
  });

  function onScroll() {
    const scrollY = window.scrollY;

    // Shrink nav
    if (nav) nav.classList.toggle('scrolled', scrollY > 60);

    // Active link
    let current = '';
    sections.forEach(({ id, section }) => {
      if (scrollY >= section.offsetTop - 100) current = id;
    });
    allLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      }
    });
  }
})();


/* ── 3. BACK-TO-TOP BUTTON ── */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ── 4. SCROLL REVEAL (Intersection Observer) ── */
(function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // Staggered delay for siblings in a grid
        const siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.querySelectorAll('.reveal'))
          : [];
        const position = siblings.indexOf(entry.target);
        const delay = position >= 0 ? position * 80 : 0;

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(item => observer.observe(item));
})();


/* ── 5. ANIMATED STAT COUNTER ── */
(function initCounters() {
  const nums = document.querySelectorAll('.stat-num[data-count]');
  if (!nums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(el => observer.observe(el));
})();


/* ── 6. GALLERY FILTER ── */
function filterGallery(cat, btn) {
  // Update active tab
  document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide segments with a smooth fade
  document.querySelectorAll('.gallery-segment').forEach(seg => {
    const match = cat === 'all' || seg.dataset.cat === cat;
    if (match) {
      seg.style.display = '';
      // Slight delay so display:'' takes effect before opacity transition
      requestAnimationFrame(() => seg.style.opacity = '1');
    } else {
      seg.style.opacity = '0';
      setTimeout(() => {
        if (seg.style.opacity === '0') seg.style.display = 'none';
      }, 300);
    }
  });
}


/* ── 7. LIGHTBOX ── */
(function initLightbox() {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  if (!lightbox) return;

  // Open
  window.openLightbox = function(el) {
    const img     = el.querySelector('img');
    const caption = el.querySelector('.g-overlay p');
    if (!img) return; // placeholder – no image yet

    lbImg.src = img.src;
    lbImg.alt = caption ? caption.textContent : 'Gallery image';
    lbCaption.textContent = caption ? caption.textContent : '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  // Close
  window.closeLightbox = function(e) {
    if (!e || e.target === lightbox || (e.target && e.target.classList.contains('lb-close'))) {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      // Small delay before clearing src to avoid flicker
      setTimeout(() => { lbImg.src = ''; }, 250);
    }
  };

  // Keyboard close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeLightbox({ target: lightbox });
  });
})();


/* ── 8. PHOTO PREVIEW UPLOAD ── */
window.previewPhotos = function(event) {
  const files       = Array.from(event.target.files);
  const placeholders = document.querySelectorAll('.gallery-item.placeholder');

  files.forEach((file, i) => {
    if (i >= placeholders.length) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const item    = placeholders[i];
      const overlay = item.querySelector('.g-overlay');
      const caption = overlay ? overlay.querySelector('p') : null;
      const label   = caption ? caption.textContent : 'Community Photo';

      item.innerHTML = `
        <img src="${ev.target.result}" alt="${label}">
        <div class="g-overlay"><p>${label}</p></div>
      `;
      item.classList.remove('placeholder');
      item.setAttribute('onclick', '');
      item.addEventListener('click', function() {
        window.openLightbox(this);
      });
    };
    reader.readAsDataURL(file);
  });

  // Reset input so the same files can be re-selected
  event.target.value = '';
};


/* ── 9. SMOOTH SCROLL OFFSET (compensate for fixed nav) ── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
      ) || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ── 10. LAZY LOAD IMAGES ── */
(function initLazyImages() {
  if (!('IntersectionObserver' in window)) return;

  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => observer.observe(img));
})();


/* ── 11. CURRENT YEAR IN FOOTER ── */
(function setFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();


/* ── 12. CONTACT FORM (if added later) ── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const original = btn ? btn.textContent : '';

    // Simple client-side validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#e74c3c';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (!valid) return;

    if (btn) {
      btn.textContent = 'Sending…';
      btn.disabled = true;
    }

    // Simulate submission – replace with a real backend / Formspree endpoint
    setTimeout(() => {
      form.reset();
      if (btn) {
        btn.textContent = '✓ Message Sent!';
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 3000);
      }
    }, 1200);
  });
})();
