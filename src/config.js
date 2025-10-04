const ogbversions = {
    backend:"v1.3",
    frontend:"2.0.0",
    premapi:"0.0.1"
}
const DEV_CONFIG = {
 
  // Fallback Launch Date (falls API nicht erreichbar)
  FALLBACK_LAUNCH_DATE: new Date('2025-12-01T00:00:00Z'),
  
  // Dev-Modus (für lokale Entwicklung)
  IS_DEV_MODE: process.env.NODE_ENV === 'development' || 
               process.env.REACT_APP_DEV_MODE === 'true' ||
               window.location.hostname === 'localhost'
};
const premiumLaunchDate = new Date('2025-12-01T00:00:00Z'); 
const PREMIUM_RELEASE_DATE = new Date("2025-12-01T00:00:00Z");

export {
  ogbversions,
  DEV_CONFIG,
  premiumLaunchDate,
  PREMIUM_RELEASE_DATE,
};
