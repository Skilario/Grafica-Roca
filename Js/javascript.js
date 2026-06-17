/* =============================================
   GRÁFICA ROCA — javascript.js
   Nav · Header · Acordeón · Scroll Top
   ============================================= */

(function () {
  'use strict';

  /* =============================================
     REFERENCIAS
     ============================================= */
  const header    = document.getElementById('header');
  const botonera  = document.getElementById('botonera');
  const scrollTop = document.getElementById('scrollTop');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks  = document.querySelectorAll('.nav-link[data-section]');
  const sections  = [];

  /* =============================================
     HEADER: Encogimiento al bajar el scroll
     ============================================= */
  function handleScroll() {
    const scrollY = window.scrollY;

    // Clase scrolled en el header
    if (scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Botón volver arriba
    if (scrollTop) {
      if (scrollY > 400) {
        scrollTop.classList.add('visible');
      } else {
        scrollTop.classList.remove('visible');
      }
    }

    // Nav: marcar sección activa
    updateActiveNav(scrollY);
  }

  /* =============================================
     NAVEGACIÓN ACTIVA según sección visible
     ============================================= */
  function buildSectionMap() {
    navLinks.forEach(link => {
      const id  = link.dataset.section;
      const sec = document.getElementById(id);
      if (sec) sections.push({ link, sec });
    });
  }

  function updateActiveNav(scrollY) {
    const offset = 140; // header + nav
    let current  = null;

    sections.forEach(({ sec }) => {
      if (scrollY + offset >= sec.offsetTop) {
        current = sec;
      }
    });

    sections.forEach(({ link, sec }) => {
      link.classList.toggle('active', sec === current);
    });
  }

  /* =============================================
     SMOOTH SCROLL al hacer clic en nav links
     ============================================= */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const hash    = this.getAttribute('href');
      const target  = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();

      const headerH  = parseInt(getComputedStyle(document.documentElement)
                                .getPropertyValue('--header-h'), 10) || 80;
      const navH     = parseInt(getComputedStyle(document.documentElement)
                                .getPropertyValue('--nav-h'), 10) || 52;
      const offset   = headerH + navH + 12;
      const targetY  = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: targetY, behavior: 'smooth' });

      // Cerrar menú mobile si está abierto
      if (botonera.classList.contains('open')) {
        botonera.classList.remove('open');
        menuToggle.classList.remove('active');
      }
    });
  });

  /* =============================================
     MENÚ HAMBURGUESA (mobile)
     ============================================= */
  if (menuToggle && botonera) {
    menuToggle.addEventListener('click', () => {
      botonera.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!botonera.contains(e.target) && !menuToggle.contains(e.target)) {
        botonera.classList.remove('open');
        menuToggle.classList.remove('active');
      }
    });
  }

  /* =============================================
     BOTÓN SCROLL TOP
     ============================================= */
  if (scrollTop) {
    scrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* =============================================
     ACORDEÓN DE SERVICIOS
     ============================================= */
  const cards = document.querySelectorAll('.servicio-card');

  cards.forEach(card => {
    const cardHeader = card.querySelector('.servicio-header');
    const body       = card.querySelector('.servicio-body');

    if (!cardHeader || !body) return;

    // Accesibilidad
    cardHeader.setAttribute('role', 'button');
    cardHeader.setAttribute('tabindex', '0');
    cardHeader.setAttribute('aria-expanded', 'false');

    function toggleCard() {
      const estaAbierto = card.dataset.abierto === 'true';

      if (!estaAbierto) {
        // Abrir esta card
        card.dataset.abierto = 'true';
        cardHeader.setAttribute('aria-expanded', 'true');

        // Forzar reflow para que la transición arranque bien
        body.offsetHeight;

      } else {
        // Cerrar
        card.dataset.abierto = 'false';
        cardHeader.setAttribute('aria-expanded', 'false');
      }
    }

    // Click
    cardHeader.addEventListener('click', toggleCard);

    // Teclado (Enter / Space)
    cardHeader.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard();
      }
    });
  });

  /* =============================================
     LOGO → volver al inicio
     ============================================= */
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', window.location.pathname);
    });
  }

  /* =============================================
     LIGHTBOX — click en fotos de servicios
     ============================================= */
  const lightbox        = document.getElementById('lightbox');
  const lightboxImg     = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCerrar  = document.getElementById('lightboxCerrar');

  function abrirLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    if (lightboxCaption) lightboxCaption.textContent = alt || '';
    lightbox.classList.add('activo');
    document.body.style.overflow = 'hidden';
    lightboxImg.focus();
  }

  function cerrarLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('activo');
    document.body.style.overflow = '';
    // Limpiar src con delay para que la transición cierre suave
    setTimeout(() => { if (!lightbox.classList.contains('activo')) lightboxImg.src = ''; }, 400);
  }

  // Click en cualquier imagen dentro de .servicio-fotos
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.foto-placeholder img');
    if (img) {
      e.stopPropagation();
      abrirLightbox(img.src, img.alt);
    }
  });

  // Cerrar con el botón X
  if (lightboxCerrar) {
    lightboxCerrar.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarLightbox();
    });
  }

  // Cerrar al hacer click en el fondo oscuro
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.closest('.lightbox-overlay') === lightbox && !e.target.closest('.lightbox-img-wrap')) {
        cerrarLightbox();
      }
    });
  }

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('activo')) {
      cerrarLightbox();
    }
  });

  /* =============================================
     INIT
     ============================================= */
  document.addEventListener('DOMContentLoaded', () => {
    buildSectionMap();
    handleScroll();
  });

  window.addEventListener('scroll', handleScroll, { passive: true });

})();
