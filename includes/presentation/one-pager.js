(function () {
  'use strict';

  /* ===============================================================
     Friends Hunt – One-Pager JavaScript
     Vanilla ES6 — kein Framework
     Sektionen: Crosshair-Pointer, Scroll-Reveal, Hunt-Tabs,
                Mini-Demo (Spieler-Marker bewegt sich auf Radar)
     =============================================================== */

  const APP = {
    init() {
      this.initCrosshair();
      this.initScrollReveal();
      this.initHuntTabs();
      this.initRadarDemo();
      this.initNav();
      this.initSlider();
      this.initLightbox();
    },

    /**
     * Crosshair-Pointer folgt der Maus im Hero-Bereich.
     * Außerhalb des Heroes wird das Crosshair ausgeblendet.
     * Nur auf Geräten mit fine-Pointer (Maus).
     */
    initCrosshair() {
      const crosshair = document.getElementById('crosshair');
      const hero = document.getElementById('hero');
      if (!crosshair || !hero) return;
      if (!window.matchMedia('(pointer: fine)').matches) return;

      let inHero = false;

      document.addEventListener('pointermove', (e) => {
        const rect = hero.getBoundingClientRect();
        const inside = e.clientY >= rect.top && e.clientY <= rect.bottom;
        if (inside !== inHero) {
          inHero = inside;
          crosshair.style.opacity = inside ? '0.8' : '0';
        }
        if (inside) {
          crosshair.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
        }
      });
    },

    /**
     * Scroll-Reveal via IntersectionObserver.
     * Elemente mit .reveal werden sichtbar, wenn sie in den Viewport kommen.
     * Fallback: sofort sichtbar, falls IntersectionObserver fehlt.
     */
    initScrollReveal() {
      const revealElements = document.querySelectorAll('.reveal');
      if (revealElements.length === 0) return;

      if (!('IntersectionObserver' in window)) {
        revealElements.forEach((el) => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
      );

      revealElements.forEach((el) => observer.observe(el));
    },

    /**
     * Tab-Switch zwischen Silent Hunt und Speed Hunt.
     * Toggle .active auf den Tabs und zugehörigen Panes.
     */
    initHuntTabs() {
      const tabs = document.querySelectorAll('.hunt-tab');
      const panes = document.querySelectorAll('.hunt-pane');
      if (tabs.length === 0) return;

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          const target = tab.dataset.tab;
          tabs.forEach((t) => t.classList.remove('active'));
          tab.classList.add('active');
          panes.forEach((p) => {
            p.classList.toggle('active', p.dataset.pane === target);
          });
        });
      });
    },

    /**
     * Mini-Demo: Spieler-Marker bewegt sich in Schritten auf dem Radar.
     * Simuliert GPS-Updates. Aktualisiert via CSS-Variablen (--x, --y).
     */
    initRadarDemo() {
      const radar = document.getElementById('hero-radar');
      if (!radar) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const playerMarker = radar.querySelector('.radar-marker.marker-player');
      if (!playerMarker) return;

      const path = [
        { x: 30, y: 20 },
        { x: 35, y: 28 },
        { x: 42, y: 35 },
        { x: 50, y: 32 },
        { x: 58, y: 24 },
        { x: 64, y: 18 },
        { x: 70, y: 26 },
        { x: 75, y: 32 }
      ];

      let idx = 0;
      const stepMs = 2000;

      const tick = () => {
        const pos = path[idx % path.length];
        playerMarker.style.setProperty('--x', pos.x + '%');
        playerMarker.style.setProperty('--y', pos.y + '%');

        // Ping-Animation neu starten an aktueller Position
        const ping = document.getElementById('radar-ping');
        if (ping) {
          ping.style.setProperty('--x', pos.x + '%');
          ping.style.setProperty('--y', pos.y + '%');
          ping.style.animation = 'none';
          // Reflow erzwingen, damit die Animation neu startet
          void ping.offsetWidth;
          ping.style.animation = '';
        }

        idx++;
      };

      tick();
      setInterval(tick, stepMs);
    },

    /**
     * Sticky-Top-Navigation:
     *  – Burger-Toggle für Mobile
     *  – Scrollspy: .active auf aktuellen nav-link setzen
     *  – Menü nach Klick auf Mobile automatisch schließen
     */
    initNav() {
      const nav = document.getElementById('main-nav');
      const toggle = document.getElementById('nav-toggle');
      const list = document.getElementById('nav-list');
      const navLinks = document.querySelectorAll('.nav-link');
      if (!nav || !toggle || !list) return;

      // Burger-Toggle
      toggle.addEventListener('click', () => {
        const open = list.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      });

      // Klick auf Link schließt Mobile-Menü
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          if (list.classList.contains('is-open')) {
            list.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Menü öffnen');
          }
        });
      });

      // Scrollspy
      if (!('IntersectionObserver' in window)) return;
      const sections = Array.from(navLinks)
        .map((link) => document.getElementById(link.dataset.target))
        .filter(Boolean);
      if (sections.length === 0) return;

      const setActive = (id) => {
        navLinks.forEach((l) => l.classList.toggle('active', l.dataset.target === id));
      };

      const spy = new IntersectionObserver(
        (entries) => {
          // Bei mehreren gleichzeitig sichtbaren Sektionen: oberste nehmen
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) setActive(visible[0].target.id);
        },
        { rootMargin: '-72px 0px -40% 0px', threshold: 0 }
      );
      sections.forEach((s) => spy.observe(s));
    },

    /**
     * Lightbox für Screenshots:
     *  – Klick / Enter / Space öffnet Großansicht
     *  – Pfeil-Tasten / Prev/Next-Buttons navigieren
     *  – Esc / Backdrop-Klick schließt
     *  – Touch-Swipe links/rechts auf Mobile
     *  – Body-Scroll gesperrt, solange Lightbox offen
     */
    initLightbox() {
      const lightbox = document.getElementById('lightbox');
      const lightboxImage = document.getElementById('lightbox-image');
      const lightboxCaption = document.getElementById('lightbox-caption');
      const lightboxCounter = document.getElementById('lightbox-counter');
      const figures = document.querySelectorAll('.screenshot-figure');
      if (!lightbox || figures.length === 0) return;

      const slides = Array.from(figures).map((fig) => {
        const img = fig.querySelector('img');
        const cap = fig.querySelector('figcaption');
        return {
          src: img ? img.getAttribute('src') : '',
          alt: img ? img.getAttribute('alt') : '',
          caption: cap ? cap.textContent.trim() : ''
        };
      });

      let currentIdx = -1;
      let lastFocused = null;

      const open = (idx) => {
        if (idx < 0 || idx >= slides.length) return;
        currentIdx = idx;
        lastFocused = document.activeElement;
        renderSlide();
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        // Fokus auf Close-Button für Keyboard-Nutzer
        const closeBtn = lightbox.querySelector('.lightbox-close');
        if (closeBtn) closeBtn.focus();
      };

      const close = () => {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        currentIdx = -1;
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
      };

      const renderSlide = () => {
        if (currentIdx < 0) return;
        const slide = slides[currentIdx];
        lightboxImage.setAttribute('src', slide.src);
        lightboxImage.setAttribute('alt', slide.alt);
        lightboxCaption.textContent = slide.caption;
        lightboxCounter.textContent = (currentIdx + 1) + ' / ' + slides.length;
      };

      const next = () => {
        if (currentIdx < 0) return;
        currentIdx = (currentIdx + 1) % slides.length;
        renderSlide();
      };

      const prev = () => {
        if (currentIdx < 0) return;
        currentIdx = (currentIdx - 1 + slides.length) % slides.length;
        renderSlide();
      };

      // Klick / Keyboard auf Figure
      figures.forEach((fig, idx) => {
        fig.addEventListener('click', () => open(idx));
        fig.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open(idx);
          }
        });
      });

      // Klick auf Close-Buttons / Backdrop
      lightbox.querySelectorAll('[data-close]').forEach((el) => {
        el.addEventListener('click', close);
      });

      // Prev/Next-Buttons
      lightbox.querySelector('[data-prev]').addEventListener('click', (e) => {
        e.stopPropagation();
        prev();
      });
      lightbox.querySelector('[data-next]').addEventListener('click', (e) => {
        e.stopPropagation();
        next();
      });

      // Klick auf Bild nicht schließen lassen
      const content = document.getElementById('lightbox-content');
      if (content) {
        content.addEventListener('click', (e) => e.stopPropagation());
      }

      // Keyboard
      document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;
        switch (e.key) {
          case 'Escape': close(); break;
          case 'ArrowRight': next(); break;
          case 'ArrowLeft': prev(); break;
        }
      });

      // Touch-Swipe (Mobile)
      let touchStartX = null;
      let touchStartY = null;
      lightbox.addEventListener('touchstart', (e) => {
        if (e.changedTouches.length === 1) {
          touchStartX = e.changedTouches[0].clientX;
          touchStartY = e.changedTouches[0].clientY;
        }
      }, { passive: true });
      lightbox.addEventListener('touchend', (e) => {
        if (touchStartX === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        // Nur horizontale Swipes werten (dx dominant)
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) next(); else prev();
        }
        touchStartX = null;
        touchStartY = null;
      }, { passive: true });
    },

    /**
     * Screenshot-Slider (Multi-View):
     *  – Desktop: 3 Slides nebeneinander, Tablet: 2, Mobile: 1
     *  – Track verschiebt sich pixelgenau (resize-safe via offsetWidth)
     *  – Autoplay Ping-Pong (vor bis max, dann zurück) – kein Sprung am Ende
     *  – Prev/Next-Buttons mit disabled-State an den Rändern
     *  – Pagination-Dots: eine pro Screenshot, aktiver Dot = linker sichtbarer
     *  – Pause on Hover/Focus/Außerhalb Viewport/Lightbox offen/Tab-Wechsel
     *  – Touch-Swipe links/rechts auf Mobile
     *  – Klick auf Slide öffnet Lightbox (bestehende Funktionalität)
     *  – Bei prefers-reduced-motion: kein Autoplay
     */
    initSlider() {
      const slider = document.getElementById('screenshots-slider');
      const track = document.getElementById('slider-track');
      const viewport = document.getElementById('slider-viewport');
      const counter = document.getElementById('slider-counter');
      const dotsContainer = document.getElementById('slider-dots');
      if (!slider || !track) return;

      const slides = Array.from(track.querySelectorAll('.screenshot-slide'));
      const total = slides.length;
      if (total === 0) return;

      const prevBtn = slider.querySelector('[data-prev]');
      const nextBtn = slider.querySelector('[data-next]');

      let currentIdx = 0;
      let direction = 1; // 1 = vorwärts, -1 = rückwärts (Ping-Pong)
      let isLightboxOpen = false;
      let isInViewport = false;
      let isHovering = false;
      let isFocused = false;
      let autoplayId = null;
      const AUTOPLAY_MS = 5000;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Sichtbare Slides je Breakpoint ermitteln
      const getVisibleCount = () => {
        if (window.matchMedia('(max-width: 650px)').matches) return 1;
        if (window.matchMedia('(max-width: 1024px)').matches) return 2;
        return 3;
      };

      // Maximaler Start-Index (damit nicht ins Leere gescrollt wird)
      const getMaxStart = () => Math.max(0, total - getVisibleCount());

      // Lightbox-Status beobachten (Pause solange offen)
      const lightbox = document.getElementById('lightbox');
      if (lightbox) {
        const lbObserver = new MutationObserver(() => {
          const open = lightbox.classList.contains('is-open');
          if (open !== isLightboxOpen) {
            isLightboxOpen = open;
            updateAutoplay();
          }
        });
        lbObserver.observe(lightbox, { attributes: true, attributeFilter: ['class'] });
      }

      // Dots generieren (eine pro Screenshot)
      const dots = [];
      if (dotsContainer) {
        for (let i = 0; i < total; i++) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'slider-dot';
          dot.setAttribute('role', 'tab');
          dot.setAttribute('aria-label', 'Screenshot ' + (i + 1) + ' von ' + total);
          dot.addEventListener('click', () => goTo(i));
          dotsContainer.appendChild(dot);
          dots.push(dot);
        }
      }

      // Track pixelgenau verschieben (resize-safe)
      const applyTransform = () => {
        if (slides.length === 0) return;
        const slideWidth = slides[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        const step = slideWidth + gap;
        track.style.transform = 'translateX(' + (-currentIdx * step) + 'px)';
      };

      const render = () => {
        applyTransform();
        const visibleCount = getVisibleCount();
        const maxStart = getMaxStart();
        // Active-Klassen: alle aktuell sichtbaren Slides
        slides.forEach((s, i) => {
          const isVisible = i >= currentIdx && i < currentIdx + visibleCount;
          s.classList.toggle('is-active', isVisible);
        });
        // Active Dot = linker sichtbarer Slide
        dots.forEach((d, i) => d.classList.toggle('is-active', i === currentIdx));
        if (counter) counter.textContent = (currentIdx + 1) + ' / ' + total;
        if (prevBtn) prevBtn.disabled = currentIdx <= 0;
        if (nextBtn) nextBtn.disabled = currentIdx >= maxStart;
      };

      const goTo = (idx) => {
        const maxStart = getMaxStart();
        currentIdx = Math.max(0, Math.min(idx, maxStart));
        render();
      };

      const next = () => {
        const maxStart = getMaxStart();
        if (currentIdx >= maxStart) {
          // Am rechten Rand: Richtung umkehren
          direction = -1;
          currentIdx = Math.max(0, currentIdx - 1);
        } else {
          currentIdx = currentIdx + 1;
        }
        render();
      };

      const prev = () => {
        if (currentIdx <= 0) {
          // Am linken Rand: Richtung umkehren
          direction = 1;
          currentIdx = Math.min(getMaxStart(), currentIdx + 1);
        } else {
          currentIdx = currentIdx - 1;
        }
        render();
      };

      // Autoplay: Ping-Pong je nach currentIdx und direction
      const autoplayTick = () => {
        const maxStart = getMaxStart();
        if (direction === 1 && currentIdx >= maxStart) {
          direction = -1;
        } else if (direction === -1 && currentIdx <= 0) {
          direction = 1;
        }
        if (direction === 1) {
          currentIdx = Math.min(maxStart, currentIdx + 1);
        } else {
          currentIdx = Math.max(0, currentIdx - 1);
        }
        render();
      };

      // Buttons
      if (prevBtn) prevBtn.addEventListener('click', prev);
      if (nextBtn) nextBtn.addEventListener('click', next);

      // Keyboard (nur wenn Slider sichtbar und Hover/Focus aktiv)
      document.addEventListener('keydown', (e) => {
        if (isLightboxOpen) return;
        const isSliderKey = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
        if (!isSliderKey) return;
        if (!isInViewport || !(isHovering || isFocused)) return;
        e.preventDefault();
        if (e.key === 'ArrowRight') next(); else prev();
      });

      // Touch-Swipe
      let touchStartX = null;
      let touchStartY = null;
      viewport.addEventListener('touchstart', (e) => {
        if (e.changedTouches.length === 1) {
          touchStartX = e.changedTouches[0].clientX;
          touchStartY = e.changedTouches[0].clientY;
        }
      }, { passive: true });
      viewport.addEventListener('touchend', (e) => {
        if (touchStartX === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) next(); else prev();
        }
        touchStartX = null;
        touchStartY = null;
      }, { passive: true });

      // Pause on Hover / Focus
      slider.addEventListener('mouseenter', () => { isHovering = true; updateAutoplay(); });
      slider.addEventListener('mouseleave', () => { isHovering = false; updateAutoplay(); });
      slider.addEventListener('focusin', () => { isFocused = true; updateAutoplay(); });
      slider.addEventListener('focusout', () => { isFocused = false; updateAutoplay(); });

      // Viewport-Beobachtung für Autoplay
      if ('IntersectionObserver' in window) {
        const vpObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              isInViewport = entry.isIntersecting;
              updateAutoplay();
            });
          },
          { threshold: 0.4 }
        );
        vpObserver.observe(slider);
      } else {
        isInViewport = true;
      }

      // Autoplay-Steuerung
      function updateAutoplay() {
        if (!prefersReducedMotion && isInViewport && !isHovering && !isFocused && !isLightboxOpen) {
          startAutoplay();
        } else {
          stopAutoplay();
        }
      }
      function startAutoplay() {
        if (autoplayId !== null) return;
        autoplayId = setInterval(autoplayTick, AUTOPLAY_MS);
      }
      function stopAutoplay() {
        if (autoplayId === null) return;
        clearInterval(autoplayId);
        autoplayId = null;
      }

      // Page-Visibility (Tab-Wechsel -> Pause)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAutoplay(); else updateAutoplay();
      });

      // Resize: Position neu berechnen + currentIdx clampen
      let resizeId = null;
      window.addEventListener('resize', () => {
        if (resizeId !== null) clearTimeout(resizeId);
        resizeId = setTimeout(() => {
          const maxStart = getMaxStart();
          if (currentIdx > maxStart) currentIdx = maxStart;
          render();
        }, 150);
      });

      // Initial rendern + Autoplay starten
      render();
      updateAutoplay();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => APP.init());
  } else {
    APP.init();
  }
})();
