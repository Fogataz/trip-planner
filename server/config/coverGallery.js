// Curated cover gallery.
//
// The client owns how each entry LOOKS (client/src/covers.ts holds the gradient
// values and image paths, so a cover paints with no extra request). The server
// owns which keys are VALID, plus the focal point and alt text it stores on the
// trip. Both sides key off the same slugs — keep them in step.

const GALLERY = {
  'gradient-dusk': { focalY: 50, dominantColor: '#6366f1', alt: 'Indigo to violet gradient' },
  'gradient-sunrise': { focalY: 50, dominantColor: '#f0914d', alt: 'Amber to rose gradient' },
  'gradient-sea': { focalY: 50, dominantColor: '#2f8fa8', alt: 'Teal to deep blue gradient' },
  'gradient-forest': { focalY: 50, dominantColor: '#3f8a5f', alt: 'Green to pine gradient' },
  'gradient-ember': { focalY: 50, dominantColor: '#b5485c', alt: 'Crimson to plum gradient' },
  'gradient-slate': { focalY: 50, dominantColor: '#4b5368', alt: 'Slate grey gradient' },
  'gradient-berry': { focalY: 50, dominantColor: '#8e4bb0', alt: 'Magenta to purple gradient' },
  'gradient-mint': { focalY: 50, dominantColor: '#49a98b', alt: 'Mint to sea green gradient' },
  'art-pod-gathering': {
    focalY: 50,
    dominantColor: '#5b3a6b',
    alt: 'Pixel-art banner of a group standing in front of a city skyline at sunset',
  },
};

const isGalleryKey = (key) => Object.prototype.hasOwnProperty.call(GALLERY, key);

// Uploaded cover assets are keyed by 32 random hex characters (see routes/trips.js)
const isCoverAssetId = (id) => typeof id === 'string' && /^[0-9a-f]{32}$/.test(id);

module.exports = { GALLERY, isGalleryKey, isCoverAssetId };
