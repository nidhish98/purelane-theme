/* ============================================================
   PURELANE — global.js
   Shared behaviours, each scoped to a section root so sections
   can be added / removed / duplicated / reordered safely.
   Respects prefers-reduced-motion.
   ============================================================ */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mqlDesktop = window.matchMedia('(min-width: 1024px)');

  const PL = {
    inits: {},
    intervals: new WeakMap()
  };

  /* ---------------- Reveal on scroll ---------------- */
  function initReveal(root) {
    const els = (root || document).querySelectorAll('.rv');
    if (!els.length) return;
    if ('IntersectionObserver' in window && !reduce) {
      els.forEach((el) => {
        if (el.classList.contains('in')) return;
        const io = new IntersectionObserver((entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
          });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
        io.observe(el);
      });
    } else {
      els.forEach((el) => el.classList.add('in'));
    }
  }

  /* ---------------- Scene crossfade ---------------- */
  const scenesLayer = document.getElementById('pl-scenes');
  const sceneEls = scenesLayer ? Array.prototype.slice.call(scenesLayer.querySelectorAll('.pl-scene')) : [];
  let sceneZones = [];
  let currentScene = 1;

  function scanZones() {
    sceneZones = Array.prototype.slice.call(document.querySelectorAll('[data-scene]'));
  }

  function setScene(n) {
    if (!sceneEls.length || n === currentScene) return;
    currentScene = n;
    sceneEls.forEach((s, i) => s.classList.toggle('on', i + 1 === n));
    if (scenesLayer) scenesLayer.setAttribute('data-d', String(n));
  }

  function pickScene() {
    const focus = window.scrollY + window.innerHeight * 0.5;
    let n = 1;
    for (let i = 0; i < sceneZones.length; i++) {
      const zone = sceneZones[i];
      if (!zone.isConnected) continue;
      const top = zone.getBoundingClientRect().top + window.scrollY;
      if (top <= focus) {
        const s = parseInt(zone.getAttribute('data-scene'), 10);
        if (s) n = s;
      }
    }
    setScene(n);
  }

  /* ---------------- Progress rail sync ---------------- */
  const railSections = [];
  function initRail(root) {
    const links = Array.prototype.slice.call((root || document).querySelectorAll('.rail a'));
    if (!links.length) return;
    const data = { links: links, targets: [] };
    links.forEach((a) => data.targets.push(document.querySelector(a.getAttribute('href'))));
    railSections.push(data);
  }
  function syncRail() {
    const mid = window.scrollY + window.innerHeight * 0.42;
    railSections.forEach((data) => {
      let idx = 0;
      data.targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top + window.scrollY <= mid) idx = i; });
      data.links.forEach((a, i) => a.classList.toggle('on', i === idx));
    });
  }

  /* ---------------- Header + hero product parallax ---------------- */
  const hdr = document.getElementById('pl-header');
  let raf = null, mx = 0, my = 0;
  const heroProds = []; // {el, parent}

  function heroFrame() {
    const y = window.scrollY || 0;
    if (hdr) hdr.classList.toggle('up', y > 90);
    if (!reduce) {
      const wl = document.querySelectorAll('#pl-scenes .wl');
      for (let i = 0; i < wl.length; i++) {
        const d = [0.05, 0.09, 0.03, 0.02][i] || 0.05;
        wl[i].style.setProperty('--px', (mx * d * 130).toFixed(1) + 'px');
        wl[i].style.setProperty('--py', (-y * d + my * d * 90).toFixed(1) + 'px');
      }
    }
    heroProds.forEach((item) => {
      if (reduce) return;
      if (!item.el.isConnected) return;
      const rect = item.el.getBoundingClientRect();
      const vh = window.innerHeight;
      const fromBottom = vh - rect.bottom; // distance scrolled past hero
      const f = Math.min(Math.max(fromBottom / 700, 0), 1);
      item.el.style.transform = 'translate3d(' + (mx * -16).toFixed(2) + 'px,' + (-f * 54 + my * -10).toFixed(2) + 'px,0) scale(' + (1 - f * 0.06).toFixed(3) + ')';
      item.el.style.opacity = (1 - f * 0.55).toFixed(3);
    });
    syncRail();
    pickScene();
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(heroFrame); }

  function bindGlobalScroll() {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    if (!reduce && mqlDesktop.matches) {
      window.addEventListener('mousemove', (e) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
        onScroll();
      }, { passive: true });
    }
  }

  /* ---------------- Mobile menu ---------------- */
  function initMenu(root) {
    const menu = root.querySelector('[data-menu-drawer]');
    const burger = root.querySelector('[data-menu-toggle]');
    const close = root.querySelector('[data-menu-close]');
    const overlay = document.getElementById('overlay');
    if (!menu || !burger) return;

    const open = () => {
      menu.classList.add('is-open');
      if (overlay) overlay.hidden = false;
      requestAnimationFrame(() => { if (overlay) overlay.classList.add('is-open'); });
      document.body.classList.add('is-locked');
      document.addEventListener('keydown', onMenuKey);
    };
    const closeFn = () => {
      menu.classList.remove('is-open');
      if (overlay) { overlay.classList.remove('is-open'); overlay.hidden = true; }
      document.body.classList.remove('is-locked');
      document.removeEventListener('keydown', onMenuKey);
    };
    function onMenuKey(e) { if (e.key === 'Escape') closeFn(); }

    burger.addEventListener('click', open);
    if (close) close.addEventListener('click', closeFn);
    if (overlay) overlay.addEventListener('click', closeFn);
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeFn));
  }

  /* ---------------- Cart ---------------- */
  const cartDrawer = () => document.querySelector('[data-cart-drawer]');
  const cartBubble = () => document.querySelector('[data-cart-bubble]');

  function money(value, currency) {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value / 100);
    } catch (e) {
      return (value / 100).toFixed(2);
    }
  }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function refreshCart() {
    try {
      const res = await fetch('/cart.js', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      const cart = await res.json();
      const bubble = cartBubble();
      if (bubble) {
        const count = cart.item_count || 0;
        bubble.textContent = count;
        bubble.setAttribute('aria-label', count === 1 ? '1 item in cart' : count + ' items in cart');
      }
      const drawer = cartDrawer();
      if (drawer) renderCart(drawer, cart);
    } catch (e) { /* ignore */ }
  }

  function renderCart(drawer, cart) {
    const body = drawer.querySelector('[data-cart-body]');
    const foot = drawer.querySelector('[data-cart-foot]');
    const empty = drawer.querySelector('[data-cart-empty]');
    if (!body) return;
    const items = cart.items || [];
    const hasItems = items.length > 0;

    if (empty) empty.hidden = hasItems;
    if (foot) foot.hidden = !hasItems;
    if (!hasItems) { body.innerHTML = ''; return; }

    body.innerHTML = items.map((it) => {
      const img = it.image ? '<img src="' + esc(it.image) + '" alt="' + esc(it.title) + '" loading="lazy">' : '';
      const price = money(it.final_line_price, it.currency);
      const variantTitle = (it.variant_title && it.variant_title !== 'Default Title') ? it.variant_title : '';
      return '' +
        '<div class="cd-item" data-line="' + it.key + '">' +
          '<div class="cd-img">' + img + '</div>' +
          '<div class="cd-meta">' +
            '<h4>' + esc(it.product_title) + '</h4>' +
            (variantTitle ? '<div class="cd-var">' + esc(variantTitle) + '</div>' : '') +
            '<div class="cd-price">' + price + '</div>' +
            '<div class="cd-qty">' +
              '<button type="button" data-qty="' + it.key + '" data-delta="-1" aria-label="Decrease quantity">−</button>' +
              '<span>' + it.quantity + '</span>' +
              '<button type="button" data-qty="' + it.key + '" data-delta="1" aria-label="Increase quantity">+</button>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="cd-remove" data-remove="' + it.key + '" aria-label="Remove">×</button>' +
        '</div>';
    }).join('');

    const sub = drawer.querySelector('[data-cart-subtotal]');
    if (sub) sub.textContent = money(cart.items_subtotal_price, cart.currency);
  }

  function openCart() {
    const drawer = cartDrawer();
    const overlay = document.getElementById('overlay');
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (overlay) { overlay.hidden = false; requestAnimationFrame(() => overlay.classList.add('is-open')); }
    document.body.classList.add('is-locked');
    document.addEventListener('keydown', onCartKey);
  }
  function closeCart() {
    const drawer = cartDrawer();
    const overlay = document.getElementById('overlay');
    if (drawer) { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); }
    if (overlay) { overlay.classList.remove('is-open'); overlay.hidden = true; }
    document.body.classList.remove('is-locked');
    document.removeEventListener('keydown', onCartKey);
  }
  function onCartKey(e) { if (e.key === 'Escape') closeCart(); }

  async function changeLine(key, quantity) {
    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ line: key, quantity: quantity })
      });
      await refreshCart();
    } catch (e) { /* ignore */ }
  }

  async function addToCart(variantId, qty, onDone) {
    try {
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ items: [{ id: variantId, quantity: qty || 1 }] })
      });
      await refreshCart();
      openCart();
      if (onDone) onDone();
    } catch (e) {
      if (onDone) onDone(e);
    }
  }

  function initCart() {
    const drawer = cartDrawer();
    if (!drawer) return;
    drawer.querySelector('[data-cart-close]').addEventListener('click', closeCart);
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.addEventListener('click', closeCart);

    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add-to-cart]');
      if (addBtn) {
        e.preventDefault();
        const id = addBtn.getAttribute('data-variant-id');
        if (!id || addBtn.disabled) return;
        let qty = 1;
        const form = addBtn.closest('form');
        if (form) {
          const q = form.querySelector('[name="quantity"]');
          if (q) qty = parseInt(q.value, 10) || 1;
        }
        addBtn.classList.add('is-loading');
        addBtn.setAttribute('aria-busy', 'true');
        const label = addBtn.textContent;
        addBtn.textContent = 'Adding…';
        addToCart(id, qty, () => {
          addBtn.textContent = label;
          addBtn.classList.remove('is-loading');
          addBtn.removeAttribute('aria-busy');
        });
        return;
      }
      const openBtn = e.target.closest('[data-cart-open]');
      if (openBtn) { e.preventDefault(); openCart(); return; }

      if (e.target.closest('[data-cart-body]')) {
        const dec = e.target.closest('[data-delta]');
        if (dec) {
          const line = dec.getAttribute('data-qty');
          const span = dec.parentNode.querySelector('span');
          const delta = parseInt(dec.getAttribute('data-delta'), 10);
          const next = Math.max(1, parseInt(span.textContent, 10) + delta);
          span.textContent = next;
          changeLine(line, next);
          return;
        }
        const rem = e.target.closest('[data-remove]');
        if (rem) changeLine(rem.getAttribute('data-remove'), 0);
      }
    });

    refreshCart();
  }

  /* ---------------- Hero product stage ---------------- */
  PL.inits.hero = (root) => {
    const stage = root.querySelector('[data-hero-stage]');
    const prod = root.querySelector('[data-hero-prod]');
    if (prod) heroProds.push({ el: prod });
    if (!stage) return;
    const slides = Array.prototype.slice.call(stage.querySelectorAll('.hslide'));
    const dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;

    let hi = 0;
    let timer = null;

    function hgo(n) {
      hi = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('on', i === hi));
      dots.forEach((d, i) => d.classList.toggle('on', i === hi));
    }
    function hplay() { if (!timer && !reduce && slides.length > 1) timer = setInterval(() => hgo(hi + 1), 3800); }
    function hstop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach((d, i) => {
      d.addEventListener('click', () => { hstop(); hgo(i); hplay(); });
    });
    stage.addEventListener('mouseenter', hstop);
    stage.addEventListener('mouseleave', hplay);
    stage.addEventListener('focusin', hstop);
    stage.addEventListener('focusout', hplay);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => { e.isIntersecting ? hplay() : hstop(); });
      }, { threshold: 0.2 }).observe(stage);
    } else {
      hplay();
    }
    PL.intervals.set(root, () => hstop());
  };

  /* ---------------- Product rotator ---------------- */
  PL.inits.proof = (root) => {
    const rot = root.querySelector('[data-rotator]');
    if (!rot) return;
    const imgs = Array.prototype.slice.call(rot.querySelectorAll('.frame img.pimg'));
    const dots = Array.prototype.slice.call(rot.querySelectorAll('.dots i'));
    const capB = rot.querySelector('.cap b');
    const capS = rot.querySelector('.cap span');
    if (!imgs.length) return;

    let ri = 0;
    let timer = null;
    function rstep() {
      imgs[ri].classList.remove('on');
      if (dots[ri]) dots[ri].classList.remove('on');
      ri = (ri + 1) % imgs.length;
      imgs[ri].classList.add('on');
      if (dots[ri]) dots[ri].classList.add('on');
      if (capB) capB.textContent = imgs[ri].getAttribute('data-name');
      if (capS) capS.textContent = imgs[ri].getAttribute('data-note');
    }
    if (!reduce && imgs.length > 1 && 'IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !timer) timer = setInterval(rstep, 2900);
          else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
        });
      }, { threshold: 0.25 }).observe(rot);
    }
    PL.intervals.set(root, () => { if (timer) clearInterval(timer); });
  };

  /* ---------------- Sticky hero CTA / misc ---------------- */
  PL.inits.progress_rail = (root) => initRail(root);

  /* ---------------- Product page (variant switcher + qty) ---------------- */
  PL.inits.product = (root) => {
    const form = root.querySelector('form.pl-form');
    if (!form) return;
    const select = form.querySelector('[data-variant-select]');
    const btns = Array.prototype.slice.call(root.querySelectorAll('[data-add-to-cart]'));
    const qty = form.querySelector('[data-qty-input]');
    const priceEls = Array.prototype.slice.call(root.querySelectorAll('[data-product-price]'));
    const compareEls = Array.prototype.slice.call(root.querySelectorAll('[data-product-compare]'));
    const dataEl = root.querySelector('[data-product-variants]');
    let variants = [];
    if (dataEl) {
      try { variants = JSON.parse(dataEl.textContent); } catch (e) { variants = []; }
    }

    const update = (id) => {
      const v = variants.find((x) => x.id === id);
      if (!v) return;
      btns.forEach((b) => {
        b.setAttribute('data-variant-id', v.id);
        b.disabled = !v.available;
        b.textContent = v.available ? 'Add to cart' : 'Sold out';
      });
      if (v.price != null) priceEls.forEach((el) => { el.textContent = money(v.price, v.currency); });
      compareEls.forEach((el) => {
        if (v.compare_at_price && v.compare_at_price > v.price) {
          el.textContent = money(v.compare_at_price, v.currency);
          el.style.display = '';
        } else {
          el.textContent = '';
          el.style.display = 'none';
        }
      });
    };

    if (select) select.addEventListener('change', () => update(select.value));

    form.querySelectorAll('[data-qty-minus],[data-qty-plus]').forEach((b) => {
      b.addEventListener('click', () => {
        if (!qty) return;
        const step = b.hasAttribute('data-qty-minus') ? -1 : 1;
        const next = Math.max(1, (parseInt(qty.value, 10) || 1) + step);
        qty.value = next;
      });
    });

    PL.intervals.set(root, () => {});
  };

  /* ---------------- Editor-safe init ---------------- */
  function initSection(root) {
    if (!root) return;
    initReveal(root);
    initMenu(root);
    const module = root.getAttribute('data-pl-module');
    if (module && PL.inits[module]) PL.inits[module](root);
  }

  function initAll() {
    document.querySelectorAll('.shopify-section').forEach(initSection);
    initMenu(document);
    initCart();
    scanZones();
    bindGlobalScroll();
    heroFrame();
  }

  document.addEventListener('DOMContentLoaded', initAll);

  /* ---------------- Theme editor events ---------------- */
  document.addEventListener('shopify:section:load', (e) => {
    const root = document.getElementById('shopify-section-' + e.detail.sectionId);
    if (root) initSection(root);
    scanZones();
    heroFrame();
  });
  document.addEventListener('shopify:section:unload', (e) => {
    const root = document.getElementById('shopify-section-' + e.detail.sectionId);
    if (root && PL.intervals.has(root)) PL.intervals.get(root)();
    scanZones();
  });
  document.addEventListener('shopify:section:select', () => { if (raf) cancelAnimationFrame(raf); raf = null; });
  document.addEventListener('shopify:section:deselect', () => { raf = null; onScroll(); });
  document.addEventListener('shopify:block:select', () => {});
  document.addEventListener('shopify:block:deselect', () => {});
})();