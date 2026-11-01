(function () {
  'use strict';

  // Tahun otomatis di footer
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Menu mobile
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal (IntersectionObserver = ringan, tanpa scroll listener)
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Jeda animasi 3D saat hero tidak terlihat (hemat baterai/CPU)
  var scene = document.querySelector('.scene');
  if (scene && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      scene.classList.toggle('paused', !entries[0].isIntersecting);
    }).observe(scene);
  }

  // Efek tilt 3D pada kartu (hanya perangkat dengan hover/mouse)
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      var raf = null;
      card.addEventListener('mousemove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = 'perspective(900px) rotateY(' + (px * 10) + 'deg) rotateX(' + (-py * 10) + 'deg) translateZ(6px)';
          raf = null;
        });
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }
})();

// Lightbox galeri
(function () {
  var dlg = document.getElementById('lightbox');
  if (!dlg || !dlg.showModal) return;
  var big = dlg.querySelector('img');
  var cap = dlg.querySelector('.lb-cap');
  document.querySelectorAll('.g-item').forEach(function (b) {
    b.addEventListener('click', function () {
      var im = b.querySelector('img');
      big.src = im.currentSrc || im.src;
      big.alt = im.alt;
      var c = b.querySelector('.cap');
      cap.textContent = c ? c.textContent : '';
      dlg.showModal();
    });
  });
  dlg.addEventListener('click', function (e) { if (e.target !== big) dlg.close(); });
})();

// Rotator 360: seret, jeda, preset Depan/Samping/Belakang
(function () {
  var scene = document.getElementById('scene');
  if (!scene) return;
  var cube = scene.querySelector('.cube');
  var out = document.getElementById('angle');
  var pauseBtn = document.getElementById('rotPause');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var angle = 30, target = null, auto = !reduce, drag = false, lastX = 0, last = performance.now(), dirty = true;

  function render() {
    cube.style.transform = 'rotateX(-20deg) rotateY(' + angle + 'deg)';
    out.textContent = Math.round(((angle % 360) + 360) % 360);
    dirty = false;
  }
  function setPause(p) {
    auto = !p;
    pauseBtn.setAttribute('aria-pressed', p);
    pauseBtn.textContent = p ? 'Putar' : 'Jeda';
  }
  if (reduce) setPause(true);

  function tick(t) {
    var dt = Math.min(t - last, 50); last = t;
    if (!scene.classList.contains('paused')) {
      if (target !== null) {
        var d = (((target - angle) % 360) + 540) % 360 - 180;
        if (Math.abs(d) < 0.5) { angle += d; target = null; } else { angle += d * Math.min(1, dt / 120); }
        dirty = true;
      } else if (auto && !drag) {
        angle += dt * 0.02; dirty = true;
      }
      if (dirty) render();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  scene.addEventListener('pointerdown', function (e) {
    drag = true; lastX = e.clientX; target = null;
    try { scene.setPointerCapture(e.pointerId); } catch (x) {}
  });
  scene.addEventListener('pointermove', function (e) {
    if (!drag) return;
    angle += (e.clientX - lastX) * 0.6; lastX = e.clientX; dirty = true;
  });
  ['pointerup', 'pointercancel'].forEach(function (n) {
    scene.addEventListener(n, function () { drag = false; });
  });
  scene.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { angle -= 15; dirty = true; }
    if (e.key === 'ArrowRight') { angle += 15; dirty = true; }
  });
  pauseBtn.addEventListener('click', function () { setPause(auto); });
  document.querySelectorAll('.rot-ctrl [data-angle]').forEach(function (b) {
    b.addEventListener('click', function () { setPause(true); target = Number(b.dataset.angle); });
  });
})();

// Mode gelap / terang
(function () {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  function sync() {
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.textContent = dark ? '☀' : '☾';
    btn.setAttribute('aria-label', dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap');
    if (meta) meta.setAttribute('content', dark ? '#0a0a09' : '#ffffff');
  }
  sync();
  btn.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark';
    if (dark) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'dark');
    try { localStorage.setItem('theme', dark ? 'light' : 'dark'); } catch (e) {}
    sync();
  });
})();

// Parallax kedalaman di hero (hanya perangkat dengan mouse, throttle rAF)
(function () {
  var hero = document.getElementById('top');
  var scene = document.getElementById('scene');
  if (!hero || !scene) return;
  if (!window.matchMedia('(hover: hover)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var raf = null, x = 0, y = 0;
  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (raf) return;
    raf = requestAnimationFrame(function () {
      scene.style.setProperty('--px', x.toFixed(3));
      scene.style.setProperty('--py', y.toFixed(3));
      raf = null;
    });
  });
  hero.addEventListener('pointerleave', function () {
    scene.style.setProperty('--px', 0); scene.style.setProperty('--py', 0);
  });
})();

// Sembunyikan slot aset yang filenya belum ada (foto/video baru), termasuk judul grup yang jadi kosong
(function () {
  function tidy() {
    document.querySelectorAll('.gallery').forEach(function (g) {
      if (g.querySelector('.g-item')) return;
      var t = g.previousElementSibling;
      if (t && t.classList.contains('gal-title')) t.remove();
      g.remove();
    });
  }
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (!el || !el.closest) return;
    var item = el.closest('.g-item, .videos figure');
    if (!item) return;
    item.remove();
    tidy();
  }, true);
})();

// Cek poster video: kalau file poster tidak ada, sembunyikan slot videonya
(function () {
  document.querySelectorAll('.videos video[poster]').forEach(function (v) {
    var probe = new Image();
    probe.onerror = function () {
      var fig = v.closest('figure');
      if (fig) fig.remove();
    };
    probe.src = v.getAttribute('poster');
  });
})();

// Cek file video: kalau file mp4-nya belum ada, sembunyikan slot videonya
// (dipakai bila poster sudah ada tapi video belum di-upload)
(function () {
  function hide(v) { var f = v.closest('figure'); if (f) f.remove(); }
  if (location.protocol === 'file:') return;
  document.querySelectorAll('.videos video').forEach(function (v) {
    var src = v.querySelector('source');
    if (!src) return;
    fetch(src.getAttribute('src'), { method: 'HEAD' })
      .then(function (r) { if (r.status === 404 || r.status === 410) hide(v); })
      .catch(function () {});
  });
})();

// Cek foto galeri: kalau file tidak ada, sembunyikan slot dan judul grup yang kosong
(function () {
  document.querySelectorAll('.g-item img').forEach(function (im) {
    var probe = new Image();
    probe.onerror = function () {
      var item = im.closest('.g-item');
      if (!item) return;
      var g = item.parentElement;
      item.remove();
      if (g && !g.querySelector('.g-item')) {
        var t = g.previousElementSibling;
        if (t && t.classList.contains('gal-title')) t.remove();
        g.remove();
      }
    };
    probe.src = im.getAttribute('src');
  });
})();
