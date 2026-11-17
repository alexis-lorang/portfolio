// Réglages enregistrés depuis le site (mode édition). La mise en page fixe est dans gabarits.js.

// Cadrage des photos dans leur case : [centre x, centre y (0 à 1, dans la photo), zoom, rotation (90, 180 ou 270°, facultative)].
window.CADRAGE = {
 "mers-de-nuages": {
  "dsc3756-modifier": [0.536, 0.5, 1],
  "dsc4992": [0.455, 0.5, 1],
  "b2": [0.5, 0.491, 1],
  "a1": [0.5, 0.495, 1],
  "c4": [0.5, 0.494, 1],
  "dsc0602-modifier": [0.47, 0.5, 1],
  "c6": [0.515, 0.5, 1],
  "a2": [0.479, 0.5, 1],
  "a3": [0.5, 0.497, 1],
  "c1": [0.514, 0.5, 1],
  "c5": [0.5, 0.461, 1],
  "c3": [0.515, 0.5, 1]
 },
 "alpes/val-thorens": {
  "dsc1262": [0.5, 0.511, 1]
 },
 "couverture/alpes": {
  "dsc3370-panorama-modifier": [0.5, 0.139, 1]
 },
 "couverture/astronomie": {
  "dsc6161-modifier": [0.5, 0.687, 1]
 },
 "couverture/mers-de-nuages": {
  "dsc4957": [0.5, 0.572, 1]
 },
 "accueil/bandeau": {
  "dsc0860": [0.5, 0.755, 1],
  "dsc3370-panorama-modifier": [0.5, 0, 1],
  "dsc0672-2": [0.5, 0.228, 1],
  "dsc0581-modifier-2": [0.5, 0, 1],
  "dsc6230-modifier-modifier-modifier": [0.5, 0.812, 1],
  "dsc0491-modifier": [0.5, 0, 1],
  "dsc0845": [0.5, 0.535, 1]
 },
 "accueil/series": {
  "dsc4957": [0.547, 1, 1],
  "dsc3370-panorama-modifier": [0.466, 0.575, 1],
  "dsc0337-modifier": [0.621, 0.5, 1],
  "dsc0798-modifier-modifier": [0.235, 0.5, 1],
  "dsc6161-modifier": [0.414, 0.5, 1],
  "dsc0862": [0, 0.5, 1],
  "dsc2289": [0.5, 1, 1],
  "dsc0860": [0.791, 0.5, 1],
  "dsc6053-modifier": [0.5, 1, 1]
 },
 "couverture/corse": {
  "dsc0862": [0.5, 0.309, 1]
 },
 "couverture/nature": {
  "dsc2289": [0.5, 0.541, 1],
  "dsc0860": [0.5, 0.755, 1]
 },
 "suivante/mers-de-nuages": {
  "dsc3370-panorama-modifier": [0.5, 0.497, 1]
 },
 "suivante/alpes": {
  "dsc0862": [0.5, 0.569, 1]
 },
 "suivante/corse": {
  "dsc2289": [0.5, 0.761, 1]
 },
 "suivante/nature": {
  "dsc6161-modifier": [0.5, 0.335, 1],
  "dsc6053-modifier": [0.5, 0.839, 1]
 },
 "suivante/astronomie": {
  "dsc4957": [0.5, 0.173, 1]
 },
 "astronomie/astrophotographie": {
  "orion-final": [0.522, 0.439, 1.157, 270],
  "sadr": [0.5, 0.474, 1, 90]
 },
 "couverture/hiver": {
  "dsc6053-modifier": [0.5, 0.605, 1]
 },
 "hiver": {
  "dsc5740-modifier-modifier": [0.5, 0.534, 1],
  "dsc6053-modifier": [0.5, 0.45, 1],
  "dsc1657-modifier": [0.5, 0.478, 1],
  "dsc0143-modifier-modifier": [0.51, 0.5, 1],
  "dsc5841": [0.5, 0.511, 1]
 },
 "accueil/portrait": {
  "dsc4957": [1, 0.5, 1],
  "a-propos": [0.7, 0.5, 1]
 }
};

// Cadrage sur mobile (écran de moins de 760 px), quand il diffère de celui de l'ordinateur.
window.CADRAGE_MOBILE = {
 "accueil/bandeau": {
  "dsc0860": [0.759, 0.755, 1],
  "dsc3370-panorama-modifier": [0.601, 0.139, 1],
  "dsc6230-modifier-modifier-modifier": [0.431, 0.812, 1],
  "c4": [0.283, 0.5, 1],
  "dsc0491-modifier": [0.438, 0, 1],
  "dsc0581-modifier-2": [0.607, 0, 1],
  "dsc0845": [0.699, 0.535, 1]
 },
 "suivante/nature": {
  "dsc6161-modifier": [0.5, 0.488, 1],
  "dsc6053-modifier": [0.5, 1, 1]
 },
 "accueil/series": {
  "dsc0862": [0, 1, 1],
  "dsc2289": [0.5, 0.594, 1],
  "dsc6161-modifier": [0.311, 1, 1],
  "dsc6053-modifier": [0.5, 0.64, 1],
  "dsc3370-panorama-modifier": [0.466, 0.559, 1]
 },
 "accueil/portrait": {
  "dsc4957": [1, 0.5, 1.084]
 },
 "couverture/corse": {
  "dsc0862": [0.384, 0.309, 1]
 },
 "couverture/alpes": {
  "dsc3370-panorama-modifier": [0.593, 0.139, 1]
 },
 "couverture/mers-de-nuages": {
  "dsc4957": [0.263, 0.572, 1]
 },
 "couverture/nature": {
  "dsc2289": [0.463, 0.541, 1],
  "dsc0860": [0.844, 0.755, 1]
 },
 "nature": {
  "dsc0797": [0.5, 0.486, 1],
  "dsc2289": [0.5, 0.51, 1],
  "dsc0798-modifier-modifier": [0.514, 0.5, 1],
  "dsc0664-panorama": [0.514, 0.5, 1]
 },
 "couverture/astronomie": {
  "dsc6161-modifier": [0.435, 0.687, 1]
 },
 "suivante/astronomie": {
  "dsc4957": [0.5, 0.375, 1]
 },
 "suivante/mers-de-nuages": {
  "dsc3370-panorama-modifier": [0.5, 0.14, 1]
 },
 "astronomie/astrophotographie": {
  "orion-final": [0.531, 0.442, 1.186, 270],
  "sadr": [0.5, 0.472, 1, 90]
 },
 "couverture/hiver": {
  "dsc6053-modifier": [0.479, 0.605, 1]
 }
};

// Photos mises en avant (★) dans les grilles automatiques.
window.FAVORIS = {

};
