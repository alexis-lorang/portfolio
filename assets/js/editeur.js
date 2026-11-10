// Mode édition — chargé uniquement avec le serveur local (outils/serveur.mjs).
// Les cases des photos ne bougent pas : on règle seulement le cadrage de chaque photo dans sa case
// (glisser pour déplacer l'image, molette pour zoomer, double-clic pour revenir au cadrage centré).
// Le cadrage est propre à la taille d'écran affichée : en dessous de 760 px de large, on règle
// le cadrage mobile (qui reprend celui de l'ordinateur tant qu'il n'a pas été modifié).
// Dans les grilles automatiques (sans gabarit), l'étoile met une photo en avant.
(() => {
  const G = window.Galerie;
  if (!G?.serie && !G?.cadres) return; // page de série, ou accueil
  const racine = document.querySelector('[data-serie]');
  const doc = document.documentElement;
  const copie = (o) => JSON.parse(JSON.stringify(o));
  const arrondi = (v) => Math.round(v * 1000) / 1000;

  let avant = null; // réglages tels qu'enregistrés, pour « Annuler »
  const etat = () => JSON.stringify([G.cadrage, G.cadrageMobile, G.favoris]);

  // Note un cadrage dans le jeu de la taille d'écran affichée (rien si c'est le cadrage par défaut).
  const pareil = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 0.002);
  function noter(cle, id, r) {
    const mobile = G.mobile();
    const jeu = mobile ? G.cadrageMobile : G.cadrage;
    const base = mobile ? G.cadrage[cle]?.[id] || [0.5, 0.5, 1] : [0.5, 0.5, 1];
    jeu[cle] ??= {};
    if (pareil(r, base)) delete jeu[cle][id];
    else jeu[cle][id] = r;
    if (!Object.keys(jeu[cle]).length) delete jeu[cle];
  }

  /* ---------- Barre d'outils ---------- */
  const barre = document.createElement('div');
  barre.className = 'editeur';
  document.body.append(barre);

  // Hors recadrage, la barre est masquée (seul un message bref, ex. « Réglages enregistrés. », peut s'afficher).
  let minuterie;
  function dessinerBarre(message) {
    clearTimeout(minuterie);
    barre.hidden = !G.edition && !message;
    barre.innerHTML = G.edition
      ? `<span class="editeur__mode">${G.mobile() ? 'Cadrage mobile' : 'Cadrage ordinateur'}</span>
         <span class="editeur__aide">${message || 'Glissez une photo ou le bandeau pour recadrer · molette pour zoomer · double-clic pour recentrer · V pour sortir'}</span>
         <button type="button" data-action="annuler">Annuler</button>
         <button type="button" data-action="enregistrer" class="editeur__principal">Enregistrer</button>`
      : message ? `<span class="editeur__aide">${message}</span>` : '';
    if (!G.edition && message) minuterie = setTimeout(() => dessinerBarre(), 2500);
  }

  function rafraichir() {
    if (G.serie) G.rendre(); // pas de grille sur l'accueil
    G.cadrerCouverture?.();
    G.cadrerTout?.();
    decorer();
  }

  // Après chaque rendu en mode édition : étoiles des grilles automatiques.
  function decorer() {
    if (!G.edition || !racine) return;
    for (const a of racine.querySelectorAll('.galerie a')) {
      const cle = a.parentElement.dataset.cle;
      if (G.gabarits[cle]) continue; // gabarit fixe : pas de favorites
      const favori = (G.favoris[cle] || []).includes(a.dataset.id);
      const etoile = document.createElement('button');
      etoile.type = 'button';
      etoile.className = 'etoile';
      etoile.textContent = favori ? '★' : '☆';
      etoile.title = favori ? 'Retirer des favorites' : 'Mettre en favorite';
      etoile.setAttribute('aria-pressed', String(favori));
      a.classList.toggle('est-favorite', favori);
      a.append(etoile);
    }
  }

  // Passage mobile ⇄ ordinateur pendant l'édition (la page est redessinée par main.js).
  G.apresRendu = () => {
    if (!G.edition) return;
    decorer();
    dessinerBarre();
  };

  const actions = {
    modifier() {
      avant = copie([G.cadrage, G.cadrageMobile, G.favoris]);
      G.edition = true;
      doc.classList.add('edition');
      window.Diaporama?.arreter();
      rafraichir();
      dessinerBarre();
    },
    annuler() {
      [G.cadrage, G.cadrageMobile, G.favoris] = avant;
      quitter();
    },
    async enregistrer() {
      try {
        const r = await fetch('/api/reglages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cadrage: G.cadrage, cadrageMobile: G.cadrageMobile, favoris: G.favoris }),
        });
        if (!r.ok) throw new Error(await r.text());
        window.CADRAGE = G.cadrage;
        window.CADRAGE_MOBILE = G.cadrageMobile;
        window.FAVORIS = G.favoris;
        quitter('Réglages enregistrés.');
      } catch (e) {
        dessinerBarre("L'enregistrement a échoué — le serveur local tourne-t-il toujours ?");
        console.error(e);
      }
    },
  };

  function quitter(message) {
    G.edition = false;
    doc.classList.remove('edition');
    window.Diaporama?.relancer();
    rafraichir();
    dessinerBarre(message);
  }

  barre.addEventListener('click', (e) => actions[e.target.closest('button')?.dataset.action]?.());

  // Touche V (gérée par main.js) : entre en recadrage, ou en sort si rien n'a été modifié.
  G.basculerEdition = () => {
    if (!G.edition) actions.modifier();
    else if (etat() === JSON.stringify(avant)) quitter();
    else dessinerBarre('Modifications en cours : Enregistrer ou Annuler');
  };

  /* ---------- Cadrage ---------- */
  const lien = (e) => (G.edition ? e.target.closest('.galerie a') : null);

  function regler(a, reglage) {
    const cle = a.parentElement.dataset.cle;
    const r = G.borner(Number(a.dataset.case), Number(a.dataset.ratio), reglage).map(arrondi);
    noter(cle, a.dataset.id, r);
    G.cadrer(a);
    // passe à la grande version de la photo quand on zoome
    const img = a.querySelector('img');
    if (r[2] > 1.2 && img.src.endsWith('-s.webp')) img.src = img.src.replace(/-s\.webp$/, '.webp');
  }
  const reglageDe = (a) => G.reglage(a.parentElement.dataset.cle, a.dataset.id);

  racine?.addEventListener('pointerdown', (e) => {
    const a = lien(e);
    if (!a || e.button !== 0 || e.target.closest('.etoile')) return;
    e.preventDefault();
    const vue = a.querySelector('.vue');
    const [cx, cy, z] = G.borner(Number(a.dataset.case), Number(a.dataset.ratio), reglageDe(a));
    const [W, H] = G.taille(Number(a.dataset.case), Number(a.dataset.ratio), z);
    // largeur et hauteur de la photo affichée, en pixels
    const pw = (W / 100) * vue.clientWidth, ph = (H / 100) * vue.clientHeight;
    a.setPointerCapture(e.pointerId);
    a.classList.add('est-saisie');
    const bouge = (ev) => regler(a, [cx - (ev.clientX - e.clientX) / pw, cy - (ev.clientY - e.clientY) / ph, z]);
    const fin = () => {
      a.removeEventListener('pointermove', bouge);
      a.removeEventListener('pointerup', fin);
      a.removeEventListener('pointercancel', fin);
      a.classList.remove('est-saisie');
    };
    a.addEventListener('pointermove', bouge);
    a.addEventListener('pointerup', fin);
    a.addEventListener('pointercancel', fin);
  });

  racine?.addEventListener(
    'wheel',
    (e) => {
      const a = lien(e);
      if (!a) return;
      e.preventDefault();
      const [cx, cy, z] = reglageDe(a);
      regler(a, [cx, cy, z * Math.exp(-e.deltaY * 0.0015)]);
    },
    { passive: false }
  );

  racine?.addEventListener('dblclick', (e) => {
    const a = lien(e);
    if (a && !e.target.closest('.etoile')) regler(a, [0.5, 0.5, 1]);
  });

  /* ---------- Cadrage de la photo de couverture (bandeau) ---------- */
  const C = G.couverture;
  const hero = C?.img.closest('.hero');
  if (hero) {
    const reglageCouverture = () => G.reglage(C.cle, C.id);
    const reglerCouverture = ([px, py, z]) => {
      const r = [Math.min(1, Math.max(0, px)), Math.min(1, Math.max(0, py)), Math.min(3, Math.max(1, z))].map(arrondi);
      noter(C.cle, C.id, r);
      G.cadrerCouverture();
    };
    const dansHero = (e) => G.edition && !e.target.closest('a, button');

    hero.addEventListener('pointerdown', (e) => {
      if (!dansHero(e) || e.button !== 0) return;
      e.preventDefault();
      const [px, py, z] = reglageCouverture();
      // débordement de la photo (object-fit: cover) par rapport au bandeau, en pixels
      const boite = C.img.parentElement.getBoundingClientRect();
      const echelle = Math.max(boite.width / C.img.naturalWidth, boite.height / C.img.naturalHeight);
      const dx0 = C.img.naturalWidth * echelle - boite.width;
      const dy0 = C.img.naturalHeight * echelle - boite.height;
      hero.setPointerCapture(e.pointerId);
      hero.classList.add('est-saisie');
      const bouge = (ev) =>
        reglerCouverture([
          dx0 > 1 ? px - (ev.clientX - e.clientX) / dx0 : px,
          dy0 > 1 ? py - (ev.clientY - e.clientY) / dy0 : py,
          z,
        ]);
      const fin = () => {
        hero.removeEventListener('pointermove', bouge);
        hero.removeEventListener('pointerup', fin);
        hero.removeEventListener('pointercancel', fin);
        hero.classList.remove('est-saisie');
      };
      hero.addEventListener('pointermove', bouge);
      hero.addEventListener('pointerup', fin);
      hero.addEventListener('pointercancel', fin);
    });
    hero.addEventListener(
      'wheel',
      (e) => {
        if (!dansHero(e)) return;
        e.preventDefault();
        const [px, py, z] = reglageCouverture();
        reglerCouverture([px, py, z * Math.exp(-e.deltaY * 0.0015)]);
      },
      { passive: false }
    );
    hero.addEventListener('dblclick', (e) => dansHero(e) && reglerCouverture([0.5, 0.5, 1]));
  }

  /* ---------- Cadrage des photos de l'accueil (bandeau, cartes des séries, portrait) ---------- */
  if (G.cadres) {
    const zones = [...new Set(G.cadres.map((c) => c.zone))];
    // Dans le bandeau, on recadre l'image du diaporama affichée.
    const cadreDe = (zone) =>
      G.cadres.find((c) => c.zone === zone && (c.img.closest('.hero__vue')?.classList.contains('est-active') ?? true));
    const regler = (c, [px, py, z]) => {
      const r = [Math.min(1, Math.max(0, px)), Math.min(1, Math.max(0, py)), Math.min(3, Math.max(1, z))].map(arrondi);
      noter(c.cle, c.id, r);
      G.cadrerTout();
    };
    const actif = (e) => G.edition && !e.target.closest('button, .puces');

    for (const zone of zones) {
      zone.addEventListener('pointerdown', (e) => {
        const c = cadreDe(zone);
        if (!c || !actif(e) || e.button !== 0) return;
        e.preventDefault();
        const [px, py, z] = G.reglage(c.cle, c.id);
        // débordement de la photo (object-fit: cover) par rapport à son cadre, en pixels
        const l = c.img.offsetWidth, h = c.img.offsetHeight;
        const echelle = Math.max(l / c.img.naturalWidth, h / c.img.naturalHeight) * z;
        const dx0 = c.img.naturalWidth * echelle - l;
        const dy0 = c.img.naturalHeight * echelle - h;
        zone.setPointerCapture(e.pointerId);
        zone.classList.add('est-saisie');
        const bouge = (ev) =>
          regler(c, [
            dx0 > 1 ? px - (ev.clientX - e.clientX) / dx0 : px,
            dy0 > 1 ? py - (ev.clientY - e.clientY) / dy0 : py,
            z,
          ]);
        const fin = () => {
          zone.removeEventListener('pointermove', bouge);
          zone.removeEventListener('pointerup', fin);
          zone.removeEventListener('pointercancel', fin);
          zone.classList.remove('est-saisie');
        };
        zone.addEventListener('pointermove', bouge);
        zone.addEventListener('pointerup', fin);
        zone.addEventListener('pointercancel', fin);
      });
      zone.addEventListener(
        'wheel',
        (e) => {
          const c = cadreDe(zone);
          if (!c || !actif(e)) return;
          e.preventDefault();
          const [px, py, z] = G.reglage(c.cle, c.id);
          regler(c, [px, py, z * Math.exp(-e.deltaY * 0.0015)]);
        },
        { passive: false }
      );
      zone.addEventListener('dblclick', (e) => {
        const c = cadreDe(zone);
        if (c && actif(e)) regler(c, [0.5, 0.5, 1]);
      });
      // Pas de navigation en cliquant sur une carte pendant le recadrage
      zone.addEventListener('click', (e) => G.edition && actif(e) && e.preventDefault());
    }
  }

  // Étoile : met une photo en favorite ou la retire (la grille automatique est recalculée).
  racine?.addEventListener('click', (e) => {
    const etoile = e.target.closest('.etoile');
    if (!etoile || !G.edition) return;
    const a = etoile.closest('a');
    const cle = a.parentElement.dataset.cle;
    const liste = new Set(G.favoris[cle] || []);
    if (liste.has(a.dataset.id)) liste.delete(a.dataset.id);
    else liste.add(a.dataset.id);
    if (liste.size) G.favoris[cle] = [...liste];
    else delete G.favoris[cle];
    rafraichir();
  });

  addEventListener('beforeunload', (e) => {
    if (G.edition && etat() !== JSON.stringify(avant)) e.preventDefault();
  });

  dessinerBarre();
})();
