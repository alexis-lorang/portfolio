// Gabarits de mise en page fixes, par grille (« serie » ou « serie/groupe »).
// Par photo : [identifiant, colonne, ligne, largeur, hauteur] sur une grille de 48 unités de large.
// Mers de nuages — module : 1 colonne = 16 unités ; petite case 16×11, grande 32×22, verticale 16×22, demi-largeur 24×16.
// Seules les photos listées sont affichées : une photo absente du gabarit n'apparaît pas sur le site
// (ajoutez-la ici pour la montrer).
window.GABARITS = {
 "mers-de-nuages": [
  ["dsc0612", 0, 0, 32, 22],
  ["dsc7148", 32, 0, 16, 11],
  ["dsc4992", 32, 11, 16, 22],
  ["dsc5095", 0, 22, 16, 11],
  ["dsc3778", 16, 22, 16, 11],

  ["dsc3756-modifier", 0, 33, 16, 22],
  ["dsc3712-modifier-modifier", 16, 33, 32, 22],

  ["dsc00026", 0, 55, 16, 22],
  ["dsc4076", 16, 55, 16, 11],
  ["dsc00033", 16, 66, 16, 11],
  ["dsc0602-modifier", 32, 55, 16, 22],

  ["dsc4938-modifier", 0, 77, 32, 22],
  ["dsc3974", 32, 77, 16, 11],
  ["dsc00045", 32, 88, 16, 11],

  ["dsc00063-modifier", 0, 99, 16, 11],
  ["dsc4245", 0, 110, 16, 11],
  ["dsc4238-modifier", 16, 99, 32, 22],

  ["dsc1442", 0, 121, 24, 16],
  ["dsc0503-modifier-modifier", 24, 121, 24, 16]
 ],

 "alpes/suisse": [
  ["dsc0235-modifier", 0, 0, 30, 22],
  ["dsc0716", 30, 0, 18, 22],

  ["dsc0397-panorama", 0, 22, 16, 21],
  ["dsc0581-modifier-2", 16, 22, 32, 21],

  ["dsc0326", 0, 43, 24, 16],
  ["dsc0817", 24, 43, 12, 16],
  ["dsc0299", 36, 43, 12, 16]
 ],

 "alpes/val-thorens": [
  ["dsc0917", 0, 0, 13, 14],
  ["dsc0921", 13, 0, 22, 14],
  ["dsc1112", 35, 0, 13, 14],

  ["dsc1176", 0, 14, 32, 22],
  ["dsc1223", 32, 14, 16, 22],

  ["dsc1292", 0, 36, 12, 16],
  ["dsc1348", 12, 36, 12, 16],
  ["dsc1262", 24, 36, 24, 16]
 ],

 "alpes/aiguilles-rouges": [
  ["dsc2959", 0, 0, 24, 27],
  ["dsc2603", 24, 0, 24, 14],
  ["dsc3034", 24, 14, 24, 13],

  ["dsc3176", 0, 27, 17, 21],
  ["dsc3076", 17, 27, 31, 21],

  ["dsc2669", 0, 48, 26, 18],
  ["dsc2758", 26, 48, 22, 18],

  ["dsc2650-panorama-modifier", 0, 66, 32, 23],
  ["dsc3469-modifier", 32, 66, 16, 23]
 ],

 "nature": [
  ["dsc0798-modifier-modifier", 0, 0, 30, 38],
  ["dsc0403", 30, 0, 18, 23],
  ["dsc2289", 30, 23, 18, 15],

  ["dsc9908", 0, 38, 16, 23],
  ["dsc0664-panorama", 16, 38, 16, 23],
  ["dsc0797", 32, 38, 16, 23]
 ],

 "corse": [
  ["dsc0845", 0, 0, 34, 21],
  ["dsc0423", 34, 0, 14, 21],

  ["dsc0673", 0, 21, 16, 11],
  ["dsc0676", 0, 32, 16, 11],
  ["dsc0672-2", 16, 21, 32, 22],

  ["dsc0683", 0, 43, 28, 19],
  ["dsc0351", 0, 62, 28, 19],
  ["dsc0700", 28, 43, 20, 25],
  ["dsc0438", 28, 68, 20, 13],

  ["dsc0399-modifier", 0, 81, 16, 21],
  ["dsc0626", 16, 81, 32, 21]
 ],

 "astronomie/astrophotographie": [
  ["dsc4219-panorama-modifier", 0, 0, 26, 39],
  ["pleiades-final", 26, 0, 22, 20],
  ["north-america", 26, 20, 22, 19],

  ["cygnus-loop", 0, 39, 21, 18],
  ["orion-final", 21, 39, 27, 18],

  ["sadr", 0, 57, 26, 22],
  ["heart-nebula", 26, 57, 22, 22]
 ],
 "astronomie/aurores-boreales": [
  ["dsc6230-modifier-modifier-modifier", 0, 0, 48, 32],
  ["dsc6151-modifier", 0, 32, 15, 22],
  ["dsc6161-modifier", 15, 32, 33, 22]
 ]
};
