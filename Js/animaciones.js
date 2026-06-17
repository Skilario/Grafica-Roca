
(function () {
  'use strict';




  /* ---- SCROLL REVEAL (IntersectionObserver) ---- */
  const revealSelectors = '.reveal-up, .reveal-left, .reveal-right, .reveal-card';

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // No dejar de observar las cards para que la animación quede
        if (!entry.target.classList.contains('reveal-card')) {
          revealObserver.unobserve(entry.target);
        }
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  function initReveal() {
    document.querySelectorAll(revealSelectors).forEach(el => {
      // El hero se anima desde el loader, no desde el observer
      if (!el.closest('.hero')) {
        revealObserver.observe(el);
      }
    });
  }

  /* ---- CONTADORES ANIMADOS ---- */
  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  function initCounters() {
    document.querySelectorAll('.counter').forEach(el => {
      counterObserver.observe(el);
    });
  }

  /* ---- INIT ---- */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initCounters();
  });

})();
