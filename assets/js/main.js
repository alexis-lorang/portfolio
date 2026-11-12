// Portfolio photo — interactions (navigation, apparitions, diaporama, grille, visionneuse)
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FLECHE =
    '<svg viewBox="0 0 32 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M0 8h30M23 1l7 7-7 7"/></svg>';

  /* ---------- Protection des photos : pas de clic droit ni de glisser-déposer ---------- */
  const estPhoto = (cible) =>
    cible instanceof Element &&
    (cible.closest('img, .galerie, .visionneuse, .hero__fond, .cadre, .serie, .suivante') !== null);
  document.addEventListener('contextmenu', (e) => estPhoto(e.target) && e.preventDefault());
  document.addEventListener('dragstart', (e) => estPhoto(e.target) && e.preventDefault());

  /* ---------- En-tête : fond au défilement, se cache en descendant ---------- */
  const entete = document.querySelector('.entete');
  let dernierY = scrollY;
  const surDefilement = () => {
    const y = scrollY;
    entete.classList.toggle('est-pleine', y > 40);
    entete.classList.toggle('est-cachee', y > dernierY && y > 400);
    dernierY = y;
  };
  addEventListener('scroll', surDefilement, { passive: true });
  surDefilement();

  /* ---------- Menu mobile ---------- */
  const burger = document.querySelector('.burger');
  const fermerMenu = () => {
    doc.classList.remove('menu-ouvert');
    burger.setAttribute('aria-expanded', 'false');
  };
  burger.addEventListener('click', () => {
    const ouvert = doc.classList.toggle('menu-ouvert');
    burger.setAttribute('aria-expanded', String(ouvert));
  });
  // Pied du menu mobile : reprend le lien du pied de page
  const menu = document.querySelector('.nav');
  const pied = document.createElement('p'); // <p> : les règles « dernier .nav__item » du menu comptent les <div>
  pied.className = 'nav__pied';
  const reseau = document.querySelector('.pied a')?.cloneNode(true);
  if (reseau) pied.append(reseau);
  pied.append(Object.assign(document.createElement('span'), { textContent: `© ${new Date().getFullYear()} Alexis Lorang` }));
  menu.append(pied);
  document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', fermerMenu));

  /* ---------- Apparition au défilement ---------- */
  const observateur = new IntersectionObserver(
    (entrees) => {
      for (const e of entrees) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('est-visible');
        observateur.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  const observer = (el) => observateur.observe(el);
  document.querySelectorAll('.apparait, .devoile').forEach(observer);

  /* ---------- Diaporama du bandeau ---------- */
  const vues = [...document.querySelectorAll('.hero__vue')];
  if (vues.length > 1) {
    const puces = document.querySelector('.puces');
    let courant = 0;
    let minuterie;
    const boutons = vues.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Image ${i + 1} sur ${vues.length}`);
      b.addEventListener('click', () => aller(i));
      puces?.append(b);
      return b;
    });
    const aller = (i) => {
      vues[courant].classList.remove('est-active');
      courant = (i + vues.length) % vues.length;
      vues[courant].classList.add('est-active');
      boutons.forEach((b, n) => b.setAttribute('aria-current', String(n === courant)));
      clearTimeout(minuterie);
      if (!calme && !enPause()) minuterie = setTimeout(() => aller(courant + 1), 6500);
    };
    // En recadrage, le diaporama reste sur l'image affichée (les puces permettent de changer d'image).
    const enPause = () => document.documentElement.classList.contains('edition');
    window.Diaporama = { arreter: () => clearTimeout(minuterie), relancer: () => aller(courant) };
    aller(0);
    document.addEventListener('visibilitychange', () => {
      clearTimeout(minuterie);
      if (!document.hidden && !calme && !enPause()) minuterie = setTimeout(() => aller(courant + 1), 6500);
    });
  }

  /* ---------- Léger parallaxe du bandeau ---------- */
  const fond = document.querySelector('.hero__fond');
  if (fond && !calme) {
    let attente = false;
    addEventListener(
      'scroll',
      () => {
        if (attente) return;
        attente = true;
        requestAnimationFrame(() => {
          if (scrollY < innerHeight * 1.2) fond.style.transform = `translate3d(0, ${scrollY * 0.22}px, 0)`;
          attente = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------- Galerie de la série ----------
     Chaque sous-catégorie est affichée dans sa propre grille, large de N unités.
     Avec un gabarit (assets/data/gabarits.js) : chaque photo a sa case fixe, rognée si besoin.
     Sinon : rangées automatiques complètes qui respectent le format des photos.
     Le cadrage de chaque photo (assets/data/disposition.js) se règle sans toucher aux cases. */
  const N = 48;
  const racine = document.querySelector('[data-serie]');
  const serie = racine && window.SITE?.series.find((s) => s.id === racine.dataset.serie);
  const etroit = matchMedia('(max-width: 760px)');
  let photos = []; // toutes les photos de la page, dans l'ordre d'affichage (visionneuse)

  const Galerie = {
    N,
    serie,
    edition: false,
    gabarits: window.GABARITS || {},
    // Cadrage { "serie/groupe": { id: [centre x, centre y, zoom] } }, un jeu par taille d'écran.
    // Sur mobile, une photo sans cadrage mobile reprend celui de l'ordinateur.
    cadrage: window.CADRAGE || {},
    cadrageMobile: window.CADRAGE_MOBILE || {},
    mobile: () => etroit.matches,
    reglage: (cle, id) =>
      (etroit.matches && Galerie.cadrageMobile[cle]?.[id]) || Galerie.cadrage[cle]?.[id] || [0.5, 0.5, 1],
    favoris: window.FAVORIS || {}, // { "serie/groupe": [id, …] } : photos mises en avant
    cle: (g) => (g.id ? `${serie.id}/${g.id}` : serie.id),

    /* Disposition automatique : uniquement des rangées complètes, sans recadrage.
       Le découpage en rangées est choisi pour que leurs hauteurs restent proches de la cible.
       Une favorite occupe la hauteur de deux ou trois rangées, les autres photos s'empilent
       à côté (côté alterné d'un bloc à l'autre). Sur mobile, elle prend une rangée à elle seule. */
    auto(liste, favoris = new Set(), { mobile = false, y = 0 } = {}) {
      const n = liste.length;
      if (!n) return {};
      const H = mobile ? 22 : 12; // hauteur cible d'une rangée, en unités
      const PARRANG = mobile ? 3 : 6; // photos au plus par rangée
      const r = liste.map((p) => p.w / p.h);
      const fav = liste.map((p) => favoris.has(p.id));
      const ecart = (h, cible) => Math.log(h / cible) ** 2;

      // Découpe les ratios en rangées consécutives (toutes les façons possibles, rangs non vides).
      function* decoupes(ratios, rangs) {
        if (rangs === 1) return yield [ratios];
        for (let k = 1; k <= Math.min(PARRANG, ratios.length - rangs + 1); k++)
          for (const suite of decoupes(ratios.slice(k), rangs - 1)) yield [ratios.slice(0, k), ...suite];
      }

      // Meilleure façon de poser les photos i…j-1 en un seul bloc pleine largeur.
      function bloc(i, j) {
        const idx = Array.from({ length: j - i }, (_, k) => i + k);
        const f = idx.filter((k) => fav[k]);
        if (!f.length) {
          if (idx.length > PARRANG) return null;
          const h = N / idx.reduce((s, k) => s + r[k], 0);
          return { type: 'rang', idx, h, cout: ecart(h, H) };
        }
        if (f.length > 1) return null;
        if (idx.length === 1) {
          const h = N / r[i];
          return { type: 'rang', idx, h, cout: ecart(h, mobile ? 1.5 * H : 2.6 * H) + 0.4 };
        }
        if (mobile || idx.length < 3) return null;
        const rf = r[f[0]];
        const autres = idx.filter((k) => k !== f[0]);
        let meilleur = null;
        for (const rangs of [2, 3]) {
          if (autres.length < rangs) continue;
          for (const d of decoupes(autres, rangs)) {
            const sommes = d.map((rg) => rg.reduce((s, k) => s + r[k], 0));
            const T = sommes.reduce((s, x) => s + 1 / x, 0);
            const Hb = (N * T) / (1 + rf * T);
            const F = rf * Hb;
            if (F < 0.4 * N || F > 0.72 * N) continue;
            const hauteurs = sommes.map((s) => (N - F) / s);
            const cout = hauteurs.reduce((c, h) => c + ecart(h, H), 0) * 0.8;
            if (!meilleur || cout < meilleur.cout) meilleur = { type: 'pile', fav: f[0], rangs: d, hauteurs, F, cout };
          }
        }
        return meilleur;
      }

      // Programmation dynamique : enchaînement de blocs au coût total minimal.
      const cout = [0];
      const choix = [];
      for (let j = 1; j <= n; j++) {
        cout[j] = Infinity;
        for (let i = j - 1; i >= 0 && j - i <= 12; i--) {
          const b = cout[i] < Infinity && bloc(i, j);
          if (b && cout[i] + b.cout < cout[j]) {
            cout[j] = cout[i] + b.cout;
            choix[j] = { i, b };
          }
        }
      }
      const blocs = [];
      for (let j = n; j > 0; j = choix[j].i) blocs.unshift(choix[j].b);

      // Placement
      const d = {};
      const rangee = (idx, x0, largeur, h) => {
        let x = x0;
        idx.forEach((k, m) => {
          const w = m === idx.length - 1 ? x0 + largeur - x : r[k] * h;
          d[liste[k].id] = [x, y, w, h];
          x += w;
        });
        y += h;
      };
      let piles = 0;
      for (const b of blocs) {
        if (b.type === 'rang') {
          rangee(b.idx, 0, N, b.h);
          continue;
        }
        const gauche = piles++ % 2 === 0;
        const haut = y;
        b.rangs.forEach((idx, m) => rangee(idx, gauche ? b.F : 0, N - b.F, b.hauteurs[m]));
        d[liste[b.fav].id] = [gauche ? 0 : N - b.F, haut, b.F, y - haut];
      }
      return d;
    },

    // Photos dans l'ordre de lecture d'une disposition (les absentes à la fin).
    ordonner(liste, dispo) {
      const rang = (p) => (dispo[p.id] ? dispo[p.id][1] * 1e4 + dispo[p.id][0] : Infinity);
      return [...liste].sort((p, q) => rang(p) - rang(q));
    },

    // Cases d'une grille : celles du gabarit (seules ses photos sont affichées), sinon automatiques.
    cases(cle, liste, favoris) {
      const gabarit = Galerie.gabarits[cle];
      if (!gabarit) return Galerie.auto(liste, favoris, { mobile: etroit.matches });
      const ids = new Set(liste.map((p) => p.id));
      return Object.fromEntries(gabarit.filter(([id]) => ids.has(id)).map(([id, ...r]) => [id, r]));
    },

    /* Cadrage d'une photo dans sa case : [cx, cy] = point de la photo placé au centre de la case
       (0 à 1), z = zoom (1 = la photo couvre juste la case). */
    taille: (rCase, rPhoto, z) => [z * Math.max(1, rPhoto / rCase) * 100, z * Math.max(1, rCase / rPhoto) * 100],
    borner(rCase, rPhoto, [cx, cy, z]) {
      z = Math.min(4, Math.max(1, z));
      const [W, H] = Galerie.taille(rCase, rPhoto, z);
      const bx = 50 / W, by = 50 / H;
      return [Math.min(1 - bx, Math.max(bx, cx)), Math.min(1 - by, Math.max(by, cy)), z];
    },
    cadrer(a) {
      const img = a.querySelector('img');
      const rCase = Number(a.dataset.case), rPhoto = Number(a.dataset.ratio);
      const reglage = Galerie.reglage(a.parentElement.dataset.cle, a.dataset.id);
      const [cx, cy, z] = Galerie.borner(rCase, rPhoto, reglage);
      const [W, H] = Galerie.taille(rCase, rPhoto, z);
      img.style.width = `${W}%`;
      img.style.height = `${H}%`;
      img.style.left = `${50 - cx * W}%`;
      img.style.top = `${50 - cy * H}%`;
    },

    // Applique une disposition aux vignettes d'une grille.
    placer(grille, dispo) {
      const lignes = Math.max(1, ...Object.values(dispo).map((r) => r[1] + r[3]));
      grille.style.aspectRatio = `${N} / ${lignes}`;
      for (const a of grille.children) {
        const [x, y, w, h] = dispo[a.dataset.id];
        a.style.left = `${(x / N) * 100}%`;
        a.style.width = `${(w / N) * 100}%`;
        a.style.top = `${(y / lignes) * 100}%`;
        a.style.height = `${(h / lignes) * 100}%`;
        a.dataset.case = (w / h).toFixed(4);
        Galerie.cadrer(a);
      }
    },

    rendre() {
      Galerie.ajusterLargeur();
      racine.replaceChildren();
      photos = [];
      for (const g of serie.groupes) {
        const base = `assets/photos/${serie.id}/${g.id ? g.id + '/' : ''}`;
        const cle = Galerie.cle(g);
        const favoris = new Set(Galerie.favoris[cle] || []);
        const dispo = Galerie.cases(cle, g.photos, favoris);
        const liste = Galerie.ordonner(g.photos.filter((p) => dispo[p.id]), dispo);

        const section = document.createElement('section');
        section.className = 'groupe';
        if (g.id) section.id = g.id;
        if (g.nom) {
          const titre = document.createElement('h2');
          titre.className = 'groupe__titre apparait';
          titre.textContent = g.nom;
          if (g.annee) titre.append(Object.assign(document.createElement('span'), { textContent: g.annee }));
          section.append(titre);
        }

        const grille = document.createElement('div');
        grille.className = 'galerie galerie--libre';
        grille.dataset.cle = cle;
        liste.forEach((p, n) => {
          const i = photos.length;
          const grand = `${base}${p.id}.webp`;
          photos.push({ ...p, grand });
          const a = document.createElement('a');
          a.href = grand;
          a.dataset.id = p.id;
          a.dataset.ratio = (p.w / p.h).toFixed(4);
          a.className = Galerie.edition ? '' : 'apparait';
          a.style.setProperty('--r', a.dataset.ratio);
          a.style.setProperty('--delai', `${(n % 4) * 0.07}s`);
          const img = new Image(p.w, p.h);
          // une photo affichée en grand reçoit la grande version
          const zoom = Galerie.reglage(cle, p.id)[2];
          img.src = dispo[p.id][2] * zoom >= 26 ? grand : `${base}${p.id}-s.webp`;
          img.alt = p.titre || `${g.nom || serie.nom} — photo ${n + 1}`;
          img.loading = i < 6 ? 'eager' : 'lazy';
          img.decoding = 'async';
          img.draggable = false;
          const vue = document.createElement('span');
          vue.className = 'vue';
          vue.append(img);
          a.append(vue);
          a.addEventListener('click', (e) => {
            e.preventDefault();
            if (!Galerie.edition) ouvrir(i, a);
          });
          grille.append(a);
        });
        section.append(grille);
        Galerie.placer(grille, dispo);
        racine.append(section);
      }
      racine.querySelectorAll('.apparait').forEach(observer);
      document.querySelectorAll('[data-compte]').forEach((el) => (el.textContent = photos.length));
    },
  };

  /* Cadrage des photos de l'accueil (bandeau, cartes des séries, portrait) : enregistré dans CADRAGE
     sous « accueil/bandeau », « accueil/series », « accueil/portrait », [position x, position y, zoom]. */
  const cadresAccueil = [
    ['bandeau', '.hero:not(.hero--court) .hero__vue img', '.hero'],
    ['series', '.series .serie img', '.serie'],
    ['portrait', '.deux-colonnes .cadre img', '.cadre'],
  ].flatMap(([zone, choix, parent]) =>
    [...document.querySelectorAll(choix)].map((img) => ({
      img,
      zone: img.closest(parent),
      cle: `accueil/${zone}`,
      id: img.getAttribute('src').split('/').pop().replace(/\.webp$/, ''),
    }))
  );
  if (!serie && cadresAccueil.length) {
    window.Galerie = Galerie;
    Galerie.cadres = cadresAccueil;
    Galerie.cadrerTout = () => {
      for (const { img, cle, id } of cadresAccueil) {
        const [px, py, z] = Galerie.reglage(cle, id);
        const position = `${px * 100}% ${py * 100}%`;
        img.style.objectPosition = position;
        img.style.transformOrigin = position;
        img.style.scale = z > 1 ? String(z) : '';
      }
    };
    Galerie.cadrerTout();
    etroit.addEventListener('change', () => {
      Galerie.cadrerTout();
      Galerie.apresRendu?.();
    });
  }

  /* Largeur des galeries : la même pour toutes les séries, calculée pour que la case la plus haute
     de tout le site (gabarits et rangées automatiques, sur ordinateur) tienne dans la hauteur de l'écran.
     Utilisée par .section--galerie .conteneur (style.css, --galerie-rapport). */
  Galerie.hauteurMax = () =>
    Math.max(
      1,
      ...window.SITE.series.flatMap((s) =>
        s.groupes.map((g) => {
          const cle = g.id ? `${s.id}/${g.id}` : s.id;
          const gabarit = Galerie.gabarits[cle];
          const dispo = gabarit
            ? Object.fromEntries(gabarit.map(([id, ...r]) => [id, r]))
            : Galerie.auto(g.photos, new Set(Galerie.favoris[cle] || []));
          return Math.max(0, ...Object.values(dispo).map((r) => r[3]));
        })
      )
    );
  Galerie.ajusterLargeur = () =>
    document.documentElement.style.setProperty('--galerie-rapport', (N / Galerie.hauteurMax()).toFixed(4));

  if (serie) {
    window.Galerie = Galerie;
    Galerie.rendre();

    /* Cadrage de la photo de couverture (bandeau) : enregistré dans CADRAGE sous « couverture/<série> »,
       [position x, position y (0 à 1, comme object-position), zoom]. */
    const couverture = document.querySelector('.hero--court .hero__vue img');
    if (couverture) {
      Galerie.couverture = {
        img: couverture,
        cle: `couverture/${serie.id}`,
        id: couverture.getAttribute('src').split('/').pop().replace(/\.webp$/, ''),
      };
      Galerie.cadrerCouverture = () => {
        const { img, cle, id } = Galerie.couverture;
        const [px, py, z] = Galerie.reglage(cle, id);
        const position = `${px * 100}% ${py * 100}%`;
        img.style.objectPosition = position;
        const vue = img.parentElement;
        vue.style.transformOrigin = position;
        vue.style.transform = z > 1 ? `scale(${z})` : '';
      };
      Galerie.cadrerCouverture();
    }
    etroit.addEventListener('change', () => {
      Galerie.rendre();
      Galerie.cadrerCouverture?.();
      Galerie.apresRendu?.(); // mode édition : étoiles et barre d'outils
    });

    // Sommaire des sous-catégories : dans le bandeau, puis en repère fixe à droite pendant le défilement
    const sousNav = document.querySelector('[data-sous-nav]');
    const nommes = serie.groupes.filter((g) => g.id);
    if (sousNav && nommes.length > 1) {
      sousNav.append(
        ...nommes.map((g) => {
          const a = Object.assign(document.createElement('a'), { href: `#${g.id}`, textContent: g.nom });
          if (g.annee) a.append(Object.assign(document.createElement('span'), { textContent: g.annee }));
          return a;
        })
      );

      const repere = document.createElement('nav');
      repere.className = 'repere';
      repere.setAttribute('aria-label', 'Sous-parties de la série');
      const liens = nommes.map((g) => {
        const a = Object.assign(document.createElement('a'), { href: `#${g.id}` });
        a.append(Object.assign(document.createElement('span'), { textContent: g.nom }));
        repere.append(a);
        return a;
      });
      document.body.append(repere);

      // Partie en cours : la dernière dont le titre a passé le tiers haut de l'écran
      const zone = racine.closest('.section');
      let attente = false;
      const suivre = () => {
        attente = false;
        const b = zone.getBoundingClientRect();
        repere.classList.toggle('est-visible', b.top < innerHeight * 0.5 && b.bottom > innerHeight * 0.6);
        let actif = 0;
        nommes.forEach((g, n) => {
          if (document.getElementById(g.id).getBoundingClientRect().top < innerHeight * 0.35) actif = n;
        });
        liens.forEach((a, n) => (n === actif ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
      };
      const demander = () => {
        if (!attente) attente = requestAnimationFrame(suivre);
      };
      addEventListener('scroll', demander, { passive: true });
      addEventListener('resize', demander);
      suivre();
    }
    if (location.hash.length > 1) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }

  // Recadrage : touche « V », uniquement avec le serveur local (node outils/serveur.mjs).
  // Rien n'est affiché tant qu'on n'appuie pas sur V ; V à nouveau pour sortir (si rien n'a changé).
  if (window.Galerie && ['localhost', '127.0.0.1'].includes(location.hostname)) {
    let editeur = null; // chargement unique de editeur.js
    const charger = () =>
      (editeur ??= fetch('/api/etat')
        .then((r) => (r.ok ? r.json() : null))
        .then((etat) => {
          if (!etat?.edition) throw new Error('serveur local sans mode édition');
          return new Promise((ok, ko) => {
            const s = document.createElement('script');
            s.src = 'assets/js/editeur.js';
            s.onload = ok;
            s.onerror = ko;
            document.head.append(s);
          });
        })
        .catch((e) => {
          editeur = null;
          console.warn('Recadrage indisponible :', e);
        }));
    addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() !== 'v' || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
      if (boite?.classList.contains('est-ouverte')) return;
      charger()?.then(() => Galerie.basculerEdition?.());
    });
  }

  /* ---------- Visionneuse plein écran ---------- */
  let boite, scene, legende, compteur, index = 0, origine = null;

  function construire() {
    boite = document.createElement('div');
    boite.className = 'visionneuse';
    boite.setAttribute('role', 'dialog');
    boite.setAttribute('aria-modal', 'true');
    boite.setAttribute('aria-label', 'Visionneuse de photos');
    boite.innerHTML = `
      <div class="visionneuse__barre">
        <span class="visionneuse__compteur" aria-live="polite"></span>
        <button type="button" class="visionneuse__fermer">Fermer <span aria-hidden="true">✕</span></button>
      </div>
      <div class="visionneuse__scene">
        <button type="button" class="visionneuse__fleche visionneuse__fleche--prec" aria-label="Photo précédente">${FLECHE}</button>
        <button type="button" class="visionneuse__fleche visionneuse__fleche--suiv" aria-label="Photo suivante">${FLECHE}</button>
      </div>
      <div class="visionneuse__legende"></div>`;
    document.body.append(boite);
    scene = boite.querySelector('.visionneuse__scene');
    legende = boite.querySelector('.visionneuse__legende');
    compteur = boite.querySelector('.visionneuse__compteur');
    boite.querySelector('.visionneuse__fermer').addEventListener('click', fermer);
    boite.querySelector('.visionneuse__fleche--prec').addEventListener('click', () => montrer(index - 1));
    boite.querySelector('.visionneuse__fleche--suiv').addEventListener('click', () => montrer(index + 1));
    scene.addEventListener('click', (e) => e.target === scene && fermer());

    // Balayage tactile
    let x0 = null, y0 = 0;
    scene.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    scene.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) montrer(index + (dx < 0 ? 1 : -1));
      else if (dy > 90) fermer();
    }, { passive: true });
  }

  function montrer(i) {
    index = (i + photos.length) % photos.length;
    const p = photos[index];
    scene.querySelectorAll('img').forEach((ancienne) => {
      ancienne.classList.remove('est-visible');
      setTimeout(() => ancienne.remove(), 500);
    });
    const img = new Image();
    img.alt = p.titre || `Photo ${index + 1}`;
    img.draggable = false;
    img.src = p.grand;
    scene.prepend(img);
    const afficher = () => requestAnimationFrame(() => img.classList.add('est-visible'));
    img.decode ? img.decode().then(afficher, afficher) : (img.onload = afficher);

    compteur.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    legende.replaceChildren();
    if (p.titre) legende.append(Object.assign(document.createElement('b'), { textContent: p.titre }));
    if (p.titre && p.lieu) legende.append(' — ');
    if (p.lieu) legende.append(p.lieu);

    // Précharge les voisines
    for (const n of [index + 1, index - 1]) {
      new Image().src = photos[(n + photos.length) % photos.length].grand;
    }
  }

  function ouvrir(i, declencheur) {
    if (!boite) construire();
    origine = declencheur;
    montrer(i);
    boite.classList.add('est-ouverte');
    document.body.style.overflow = 'hidden';
    boite.querySelector('.visionneuse__fermer').focus({ preventScroll: true });
  }

  function fermer() {
    boite.classList.remove('est-ouverte');
    document.body.style.overflow = '';
    origine?.focus({ preventScroll: true });
  }

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fermerMenu();
    if (!boite?.classList.contains('est-ouverte')) return;
    if (e.key === 'Escape') fermer();
    else if (e.key === 'ArrowRight') montrer(index + 1);
    else if (e.key === 'ArrowLeft') montrer(index - 1);
    else if (e.key === 'Tab') {
      // Garde le focus dans la visionneuse
      const cibles = [...boite.querySelectorAll('button')].filter((b) => b.offsetParent);
      const premier = cibles[0], dernier = cibles.at(-1);
      if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
    }
  });

  /* ---------- Année du pied de page ---------- */
  document.querySelectorAll('[data-annee]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
