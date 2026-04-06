/**
 * Optimiert Cloudinary-URLs on-the-fly.
 * @param {string} url - Die Original-URL von Cloudinary
 * @param {number} width - Die gewünschte Breite des Bildes (Standard: 800px)
 * @returns {string} - Die optimierte URL
 */
export const getOptimizedImage = (url, width = 800) => {
  // Falls keine URL vorhanden ist oder es kein Cloudinary-Link ist, gib die Original-URL zurück
  if (!url || !url.includes('cloudinary.com')) return url;

  // Wir fügen Optimierungsparameter nach '/upload/' ein:
  // f_auto: Bestes Format (WebP) wählen
  // q_auto: Beste Kompression wählen
  // w_xxx: Breite anpassen
  // c_scale: Bild proportional skalieren
  const optimizationParams = `upload/f_auto,q_auto,w_${width},c_scale/`;
  
  return url.replace('upload/', optimizationParams);
};