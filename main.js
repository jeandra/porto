(function () {
  'use strict';

  // Reveal styles are gated on this class so the content still shows if the
  // script never runs.
  document.documentElement.classList.add('has-js');

  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------
  const TOTAL_FRAMES = 299;
  const FRAMES_DIR = 'frames/';
  const BG_COLOR = '#16070e';
  // Bump this whenever the frame set changes so browsers never reuse an old
  // cached image sequence for the same URL.
  const FRAME_VERSION = '3';

  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isLowMemory =
    typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
  const isPortable = isCoarsePointer || isLowMemory;
  // Opening index.html directly (file://) blocks fetch(); fall back to <img>.
  const canFetchFrames =
    typeof createImageBitmap === 'function' && window.location.protocol !== 'file:';

  // Each decoded 1920x1080 RGBA frame costs ~8.3 MB. Only keep a window of
  // frames around the current scroll position instead of all 299 (~2.4 GB).
  const RADIUS = isPortable ? 5 : 12; // ~11 / ~25 frames alive
  const HYSTERESIS = isPortable ? 2 : 4; // slack before a frame is released
  const MAX_CACHE = RADIUS * 2 + 1 + HYSTERESIS * 2;
  const CONCURRENCY = isPortable ? 4 : 6;
  const SEARCH_RANGE = RADIUS + HYSTERESIS;

  // Exponential smoothing constant. ~130ms matches the old 0.12 @ 60fps feel
  // but stays consistent on 120Hz displays.
  const SMOOTH_TAU = 130;

  // ---------------------------------------------------------------------------
  // DOM
  // ---------------------------------------------------------------------------
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const loaderEl = document.getElementById('loader');
  const loaderFill = loaderEl ? loaderEl.querySelector('.loader-fill') : null;

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let dpr = 1;
  let viewWidth = 0;
  let viewHeight = 0;
  let maxScroll = 0;

  let targetFrame = 0;
  let currentFrame = 0;
  let lastDrawnFrame = -1;

  /** @type {Map<number, ImageBitmap|HTMLImageElement>} */
  const cache = new Map();
  /** @type {Map<number, AbortController>} */
  const pending = new Map();
  const failed = new Set();

  let wanted = [];
  let windowCenter = -1;
  let activeLoads = 0;

  let loaderDone = false;
  let prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function frameUrl(index) {
    return (
      FRAMES_DIR +
      'ezgif-frame-' +
      String(index + 1).padStart(3, '0') +
      '.webp?v=' +
      FRAME_VERSION
    );
  }

  function closeFrame(frame) {
    if (frame && typeof frame.close === 'function') {
      frame.close();
    }
  }

  function updateMetrics() {
    const doc = document.documentElement;
    const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
    maxScroll = Math.max(0, scrollHeight - window.innerHeight);
  }

  function frameAtScroll() {
    if (maxScroll <= 0) return 0;
    const y = window.scrollY || window.pageYOffset || 0;
    const progress = Math.min(1, Math.max(0, y / maxScroll));
    return progress * (TOTAL_FRAMES - 1);
  }

  function nearestLoaded(index) {
    const direct = cache.get(index);
    if (direct) return direct;

    for (let offset = 1; offset <= SEARCH_RANGE; offset++) {
      const before = cache.get(index - offset);
      if (before) return before;
      const after = cache.get(index + offset);
      if (after) return after;
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  function loadFrameFromImage(url, signal) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const onAbort = () => {
        img.onload = img.onerror = null;
        img.src = '';
        reject(new DOMException('Aborted', 'AbortError'));
      };
      if (signal) {
        if (signal.aborted) return onAbort();
        signal.addEventListener('abort', onAbort, { once: true });
      }
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to decode ' + url));
      img.src = url;
    });
  }

  async function startLoad(index) {
    const controller = new AbortController();
    pending.set(index, controller);
    activeLoads++;

    try {
      let frame;
      if (canFetchFrames) {
        const res = await fetch(frameUrl(index), { signal: controller.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + frameUrl(index));
        const blob = await res.blob();
        frame = await createImageBitmap(blob);
      } else {
        frame = await loadFrameFromImage(frameUrl(index), controller.signal);
      }

      if (controller.signal.aborted) {
        closeFrame(frame);
        return;
      }

      cache.set(index, frame);

      // If the frame we are currently trying to draw just arrived, force a redraw.
      if (index === Math.round(currentFrame)) {
        lastDrawnFrame = -1;
      }
      updateProgress();
    } catch (err) {
      if (!err || err.name !== 'AbortError') {
        failed.add(index);
        console.warn('[frames]', err && err.message ? err.message : err);
      }
    } finally {
      pending.delete(index);
      activeLoads--;
      pump();
    }
  }

  function pump() {
    for (let i = 0; i < wanted.length; i++) {
      if (activeLoads >= CONCURRENCY) return;
      const index = wanted[i];
      if (cache.has(index) || pending.has(index) || failed.has(index)) continue;
      startLoad(index);
    }
  }

  function evict(center) {
    const keepRadius = RADIUS + HYSTERESIS;

    for (const [index, frame] of cache) {
      if (Math.abs(index - center) > keepRadius) {
        closeFrame(frame);
        cache.delete(index);
      }
    }

    // Safety net for cases where a big scroll jump raced with pending loads.
    while (cache.size > MAX_CACHE) {
      let farthest = -1;
      let farthestIndex = -1;
      for (const index of cache.keys()) {
        const distance = Math.abs(index - center);
        if (distance > farthest) {
          farthest = distance;
          farthestIndex = index;
        }
      }
      if (farthestIndex < 0) break;
      closeFrame(cache.get(farthestIndex));
      cache.delete(farthestIndex);
    }
  }

  function setWindow(center, forward) {
    if (center === windowCenter) return;
    windowCenter = center;

    const list = [];
    for (let offset = 0; offset <= RADIUS; offset++) {
      const behind = center - offset;
      const ahead = center + offset;

      if (offset === 0) {
        list.push(center);
        continue;
      }

      // Prefetch toward the direction the user is scrolling first.
      if (forward) {
        if (ahead < TOTAL_FRAMES) list.push(ahead);
        if (behind >= 0) list.push(behind);
      } else {
        if (behind >= 0) list.push(behind);
        if (ahead < TOTAL_FRAMES) list.push(ahead);
      }
    }

    wanted = list;

    // Cancel in-flight loads that are no longer useful.
    const needed = new Set(list);
    for (const [index, controller] of pending) {
      if (!needed.has(index)) controller.abort();
    }

    evict(center);
    pump();
    updateProgress();
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewWidth = window.innerWidth;
    viewHeight = window.innerHeight;

    canvas.width = Math.max(1, Math.floor(viewWidth * dpr));
    canvas.height = Math.max(1, Math.floor(viewHeight * dpr));

    // Setting width/height resets the context; apply the DPR transform once.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;

    updateMetrics();
    lastDrawnFrame = -1;
  }

  function renderFrame(index) {
    const frame = nearestLoaded(index);
    if (!frame) return false;

    const imgW = frame.naturalWidth || frame.width || 1920;
    const imgH = frame.naturalHeight || frame.height || 1080;

    // Cover in both orientations: on a phone a contained 16:9 frame would
    // shrink to a letterboxed strip, so the film always fills the viewport.
    const scale = Math.max(viewWidth / imgW, viewHeight / imgH);

    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = (viewWidth - drawW) / 2;
    const drawY = (viewHeight - drawH) / 2;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, viewWidth, viewHeight);
    ctx.drawImage(frame, drawX, drawY, drawW, drawH);

    return true;
  }

  // ---------------------------------------------------------------------------
  // Loader
  // ---------------------------------------------------------------------------
  function updateProgress() {
    if (loaderDone || !wanted.length) return;

    let loaded = 0;
    for (let i = 0; i < wanted.length; i++) {
      if (cache.has(wanted[i])) loaded++;
    }

    if (loaderFill) {
      const ratio = wanted.length ? loaded / wanted.length : 1;
      loaderFill.style.transform = 'scaleX(' + ratio + ')';
    }

    const current = Math.round(currentFrame);
    const enough = Math.min(4, wanted.length);
    if (cache.has(current) && loaded >= enough) {
      hideLoader();
    }
  }

  function hideLoader() {
    if (loaderDone) return;
    loaderDone = true;
    if (!loaderEl) return;
    loaderEl.classList.add('is-hidden');
    window.setTimeout(function () {
      if (loaderEl.parentNode) loaderEl.parentNode.removeChild(loaderEl);
    }, 700);
  }

  // ---------------------------------------------------------------------------
  // Animation loop
  // ---------------------------------------------------------------------------
  let lastTime = 0;

  function tick(now) {
    const delta = lastTime ? Math.min(now - lastTime, 100) : 16.7;
    lastTime = now;

    targetFrame = frameAtScroll();
    const forward = targetFrame > currentFrame;

    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.01) {
      if (prefersReducedMotion) {
        currentFrame = targetFrame;
      } else {
        currentFrame += diff * (1 - Math.exp(-delta / SMOOTH_TAU));
      }
    } else {
      currentFrame = targetFrame;
    }

    const frameToDraw = Math.round(currentFrame);

    // Redraw only when the frame actually changes (or after a resize).
    if (frameToDraw !== lastDrawnFrame) {
      renderFrame(frameToDraw);
      lastDrawnFrame = frameToDraw;
    }

    setWindow(frameToDraw, forward);

    window.requestAnimationFrame(tick);
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  let resizeQueued = false;
  function queueResize() {
    if (resizeQueued) return;
    resizeQueued = true;
    window.requestAnimationFrame(function () {
      resizeQueued = false;
      resizeCanvas();
    });
  }

  window.addEventListener('resize', queueResize, { passive: true });
  window.addEventListener('orientationchange', queueResize, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', queueResize, { passive: true });
  }

  if (typeof ResizeObserver === 'function') {
    const sections = document.getElementById('sections');
    if (sections) new ResizeObserver(queueResize).observe(sections);
  }

  // The webfonts arrive after first paint and change panel heights.
  window.addEventListener('load', queueResize, { passive: true });

  if (document.fonts && typeof document.fonts.ready === 'object') {
    document.fonts.ready.then(queueResize).catch(function () {});
  }

  // ---------------------------------------------------------------------------
  // Sections: reveal on scroll + nav state
  // ---------------------------------------------------------------------------
  const navEl = document.getElementById('site-nav');
  const panels = document.querySelectorAll('.panel');

  let lastScrollY = window.scrollY || 0;

  function onScrollState() {
    const y = window.scrollY || 0;
    if (navEl) {
      navEl.classList.toggle('is-scrolled', y > 24);

      // Scrolling down collapses the floating pill into a single icon;
      // scrolling back up restores the full pill.
      if (y > 120) {
        if (y > lastScrollY) navEl.classList.add('is-compact');
        else navEl.classList.remove('is-compact');
      } else {
        navEl.classList.remove('is-compact');
      }
    }
    lastScrollY = y;
  }

  if (navEl) {
    navEl.addEventListener('click', function (e) {
      // In compact mode the single icon is the only control: expand the pill.
      if (navEl.classList.contains('is-compact')) {
        e.preventDefault();
        e.stopPropagation();
        navEl.classList.remove('is-compact');
      }
    });
  }

  // Spotlight cards: track pointer position per card for the hover glow.
  document.querySelectorAll('.work-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', (e.clientX - r.left) + 'px');
      card.style.setProperty('--spot-y', (e.clientY - r.top) + 'px');
    });
    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--spot-x', '50%');
      card.style.setProperty('--spot-y', '50%');
    });
  });

  // 3D tilt for work cards (spotlight-card style).
  document.querySelectorAll('.work-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      var rx = (0.5 - py) * 16;
      var ry = (px - 0.5) * 20;
      card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-3px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  if (typeof IntersectionObserver === 'function') {
    const reveal = new IntersectionObserver(
      function (entries) {
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add('is-visible');
            reveal.unobserve(entries[i].target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 }
    );

    for (let i = 0; i < panels.length; i++) reveal.observe(panels[i]);
  } else {
    for (let i = 0; i < panels.length; i++) panels[i].classList.add('is-visible');
  }

  onScrollState();
  window.addEventListener('scroll', onScrollState, { passive: true });

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onReducedMotionChange = function (event) {
    prefersReducedMotion = event.matches;
  };
  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', onReducedMotionChange);
  } else if (typeof reducedMotionQuery.addListener === 'function') {
    reducedMotionQuery.addListener(onReducedMotionChange);
  }

  // Never leave the loader stuck if a frame 404s.
  window.setTimeout(hideLoader, 4000);

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  resizeCanvas();

  currentFrame = targetFrame = frameAtScroll();
  lastDrawnFrame = -1;

  setWindow(Math.round(currentFrame), true);

  updateProgress();

  window.requestAnimationFrame(tick);
})();
