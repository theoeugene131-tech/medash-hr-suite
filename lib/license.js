// Simple SaaS license helper for Selar
// In production, replace verifiedKeys Set with DB / Selar API check
export const LICENSE_KEY_STORE = "medash_license_key";
export const LICENSE_STATUS_STORE = "medash_license_status";

export function normalizeKey(k){ return (k||'').trim().toUpperCase().replace(/\s+/g,''); }
export function isValidFormat(key){
  const k=normalizeKey(key);
  // MEDASH-XXXX-XXXX-XXXX or MEDASH-XXXX-XXXX-...
  return /^MEDASH-[A-Z0-9]{4,}-[A-Z0-9-]{4,}$/.test(k) && k.length >= 14;
}
export async function verifyLicense(key){
  const normalized = normalizeKey(key);
  if(!isValidFormat(normalized)) return {valid:false, reason:'Invalid format. Expected MEDASH-XXXX-XXXX-...'};
  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({key: normalized})
    });
    const result = await response.json();
    return response.ok ? result : {valid:false, reason:result.reason || 'Licence is not active.'};
  } catch {
    return {valid:false, reason:'Licence verification is unavailable while offline.'};
  }
}
export function saveLicense(key, meta){
  if(typeof window==='undefined') return;
  localStorage.setItem(LICENSE_KEY_STORE, normalizeKey(key));
  localStorage.setItem(LICENSE_STATUS_STORE, JSON.stringify({valid:true, ...meta, verifiedAt:new Date().toISOString()}));
}
export function clearLicense(){
  if(typeof window==='undefined') return;
  localStorage.removeItem(LICENSE_KEY_STORE);
  localStorage.removeItem(LICENSE_STATUS_STORE);
}
export function getStoredKey(){
  if(typeof window==='undefined') return null;
  return localStorage.getItem(LICENSE_KEY_STORE);
}
