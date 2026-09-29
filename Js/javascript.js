/* =============================================
   GRÁFICA ROCA — javascript.js
   Menú · Header · Reveal · Galería · Lightbox · Formulario · Mapa · Analytics
   ============================================= */
(function () {
  'use strict';

  const WA_NUM = '5491169326880';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  function track(evento, params) {
    if (typeof window.gtag === 'function') window.gtag('event', evento, params || {});
  }

  /* ---------- Header + menú mobile ---------- */
  const header = $('#header');
  const nav = $('#nav');
  const toggle = $('#menuToggle');

  function cerrarMenu() {
    nav.classList.remove('abierto');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    const abierto = nav.classList.toggle('abierto');
    toggle.setAttribute('aria-expanded', String(abierto));
  });
  $$('a', nav).forEach(a => a.addEventListener('click', cerrarMenu));
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) cerrarMenu();
  });

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Link activo según sección ---------- */
  const navLinks = $$('.nav-link');
  const secObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle('activo', l.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(l => {
    const sec = $(l.getAttribute('href'));
    if (sec) secObserver.observe(sec);
  });

  /* ---------- Reveal al hacer scroll ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach((el, i) => {
    // pequeño escalonado entre hermanos
    const hermanos = $$('.reveal', el.parentElement);
    el.style.transitionDelay = (hermanos.indexOf(el) % 6) * 70 + 'ms';
    revealObserver.observe(el);
  });

  /* ---------- Lightbox genérico (recibe una lista de fotos) ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCaption');
  let lista = [];
  let actual = 0;
  let ultimoFoco = null;

  function mostrar(idx) {
    actual = (idx + lista.length) % lista.length;
    lbImg.src = lista[actual].src;
    lbImg.alt = lista[actual].alt;
    lbCap.textContent = lista[actual].alt + (lista.length > 1 ? '  ·  ' + (actual + 1) + ' / ' + lista.length : '');
    const multi = lista.length > 1;
    $('#lbPrev').hidden = !multi;
    $('#lbNext').hidden = !multi;
    // precargar la siguiente
    if (multi) { const pre = new Image(); pre.src = lista[(actual + 1) % lista.length].src; }
  }
  function abrir(fotos, idx) {
    lista = fotos;
    ultimoFoco = document.activeElement;
    mostrar(idx || 0);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lbCerrar').focus();
    track('ver_foto', { foto: lista[actual].alt });
  }
  function cerrar() {
    lb.hidden = true;
    document.body.style.overflow = '';
    lbImg.src = '';
    if (ultimoFoco) ultimoFoco.focus();
  }

  $('#lbCerrar').addEventListener('click', cerrar);
  $('#lbPrev').addEventListener('click', () => mostrar(actual - 1));
  $('#lbNext').addEventListener('click', () => mostrar(actual + 1));
  lb.addEventListener('click', e => { if (e.target === lb) cerrar(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') cerrar();
    if (e.key === 'ArrowLeft') mostrar(actual - 1);
    if (e.key === 'ArrowRight') mostrar(actual + 1);
  });
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null || lista.length < 2) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  /* ---------- Servicios: detalle en ventana ---------- */
  $$('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dlg = document.getElementById(btn.dataset.modal);
      if (!dlg) return;
      dlg.showModal();
      document.body.style.overflow = 'hidden';
      track('ver_detalle_servicio', { servicio: btn.dataset.modal.slice(2) });
    });
  });
  $$('dialog.modal').forEach(dlg => {
    dlg.addEventListener('close', () => { document.body.style.overflow = ''; });
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });  // click afuera
    $$('[data-cerrar]', dlg).forEach(b => b.addEventListener('click', () => dlg.close()));
  });

  /* ---------- Trabajos: filtros + "Ver más" ---------- */
  const trabajos = $$('.trabajo');
  const grid = $('#galeria');
  const verMas = $('#verMas');
  let filtroActual = 'todos';
  let mostrados = 0;

  const coinciden = () => trabajos.filter(t => filtroActual === 'todos' || t.dataset.cat === filtroActual);
  const porTanda = () => {
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length || 4;
    return cols <= 2 ? cols * 3 : cols * 2;   // filas completas
  };

  function render(animar) {
    const lista = coinciden();
    trabajos.forEach(t => { t.hidden = true; t.classList.remove('entra'); });
    lista.slice(0, mostrados).forEach((t, i) => {
      t.hidden = false;
      if (animar) { t.style.animationDelay = (i % porTanda()) * 50 + 'ms'; t.classList.add('entra'); }
    });
    const quedan = lista.length - mostrados;
    verMas.hidden = quedan <= 0;
    $('#verMasN').textContent = quedan > 0 ? '(' + quedan + ')' : '';
  }

  $$('.filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filtro').forEach(b => b.classList.toggle('activo', b === btn));
      filtroActual = btn.dataset.filtro;
      mostrados = porTanda();
      render(true);
      track('filtro_trabajos', { categoria: filtroActual });
    });
  });
  verMas.addEventListener('click', () => {
    const antes = mostrados;
    mostrados += porTanda();
    render(false);
    coinciden().slice(antes, mostrados).forEach((t, i) => { t.style.animationDelay = i * 50 + 'ms'; t.classList.add('entra'); });
    track('ver_mas_trabajos');
  });
  mostrados = porTanda();
  render(false);

  // Abrir foto: el visor recorre solo los trabajos visibles del filtro actual
  trabajos.forEach(t => {
    $('.trabajo-foto', t).addEventListener('click', () => {
      const visibles = coinciden();
      const fotos = visibles.map(v => {
        const img = $('img', v);
        return { src: img.dataset.full, alt: $('h3', v).textContent + '. ' + $('p', v).textContent };
      });
      abrir(fotos, visibles.indexOf(t));
    });
  });

  // "Ver trabajos de este tipo" desde el detalle de un servicio
  $$('[data-ver-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('dialog').close();
      const f = $(`.filtro[data-filtro="${btn.dataset.verCat}"]`);
      if (f) f.click();
      $('#trabajos').scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Hero: fotos que van rotando ---------- */
  const mosaicos = $$('[data-rotar]');
  mosaicos.forEach(fig => {
    const fotos = $$('img', fig);
    fig.addEventListener('click', () => {
      const i = fotos.findIndex(im => im.classList.contains('on'));
      abrir(fotos.map(im => ({ src: (im.src || im.dataset.src).replace('-sm.webp', '.webp'), alt: im.alt })), i);
    });
  });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.addEventListener('load', () => {
    // las fotos extra del hero se cargan recién cuando terminó todo lo importante
    $$('[data-rotar] img[data-src]').forEach(im => { im.src = im.dataset.src; im.removeAttribute('data-src'); });
    if (reduceMotion || !mosaicos.length) return;
    let paso = 0;
    setInterval(() => {
      if (document.hidden) return;
      const fig = mosaicos[paso % mosaicos.length];
      const fotos = $$('img', fig);
      const i = fotos.findIndex(im => im.classList.contains('on'));
      const sig = fotos[(i + 1) % fotos.length];
      if (!sig.complete) return;
      fotos[i].classList.remove('on');
      sig.classList.add('on');
      $('figcaption', fig).textContent = sig.dataset.cap;
      paso++;
    }, 3200);
  });

  /* ---------- Formulario → WhatsApp ---------- */
  const form = $('#formPresupuesto');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    const servicio = form.servicio.value;
    const detalle = form.detalle.value.trim();
    const err = $('#formError');

    if (!nombre || !servicio) {
      err.hidden = false;
      (nombre ? form.servicio : form.nombre).focus();
      return;
    }
    err.hidden = true;

    let msg = `Hola Gráfica Roca! Soy ${nombre}. Quiero pedir presupuesto por: ${servicio}.`;
    if (detalle) msg += `\n\n${detalle}`;

    track('generar_presupuesto', { servicio });
    window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  /* ---------- Tracking de clics ---------- */
  $$('[data-wa]').forEach(a => a.addEventListener('click', () => track('click_whatsapp', { ubicacion: a.dataset.wa })));
  $$('[data-evento]').forEach(a => a.addEventListener('click', () => track(a.dataset.evento)));

  /* ---------- Abierto / cerrado ahora (hora de Argentina) ---------- */
  (function estadoLocal() {
    const el = $('#estadoLocal');
    if (!el) return;
    try {
      const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
      }).formatToParts(new Date());
      const get = t => partes.find(p => p.type === t).value;
      const dia = get('weekday');
      const h = (parseInt(get('hour'), 10) % 24) + parseInt(get('minute'), 10) / 60;
      let abierto = false;
      if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(dia)) abierto = h >= 9 && h < 19;
      if (dia === 'Sat') abierto = h >= 9 && h < 14;
      el.textContent = abierto ? '● Abierto ahora' : 'Cerrado ahora';
      el.classList.add(abierto ? 'abierto' : 'cerrado');
    } catch (_) { /* navegador sin soporte de zonas horarias: no mostramos nada */ }
  })();

  /* ---------- Mapa: se carga solo cuando se acerca a la pantalla ---------- */
  const mapa = $('#mapa iframe');
  if (mapa) {
    const mapObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        mapa.src = mapa.dataset.src;
        mapObserver.disconnect();
      }
    }, { rootMargin: '400px' });
    mapObserver.observe(mapa);
  }

  /* ---------- Burbuja de WhatsApp (una vez, a los 8 s) ---------- */
  const waFlot = $('.wa-flotante');
  if (waFlot) {
    setTimeout(() => {
      waFlot.classList.add('saludo');
      setTimeout(() => waFlot.classList.remove('saludo'), 5000);
    }, 8000);
  }

  /* ---------- Año del footer ---------- */
  $('#anio').textContent = new Date().getFullYear();
})();
