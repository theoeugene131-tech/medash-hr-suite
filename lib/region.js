const REGIONS = {
  NG: { countryCode: "NG", label: "Nigeria", currency: "NGN", locale: "en-NG", timezone: "Africa/Lagos" },
  GB: { countryCode: "GB", label: "United Kingdom", currency: "GBP", locale: "en-GB", timezone: "Europe/London" },
  US: { countryCode: "US", label: "United States", currency: "USD", locale: "en-US", timezone: "America/New_York" },
};

export function regionForCountry(code) {
  return REGIONS[code] || REGIONS.NG;
}

export function getSavedRegion() {
  if (typeof window === "undefined") return REGIONS.NG;
  try {
    const raw = window.localStorage.getItem("medash_state_v1");
    const saved = raw ? JSON.parse(raw) : null;
    const base = regionForCountry(saved?.countryCode);
    return {
      ...base,
      currency: typeof saved?.currency === "string" ? saved.currency : base.currency,
      locale: typeof saved?.locale === "string" ? saved.locale : base.locale,
      timezone: typeof saved?.timezone === "string" ? saved.timezone : base.timezone,
    };
  } catch {
    return REGIONS.NG;
  }
}

export function formatMoney(value, currency) {
  const region = getSavedRegion();
  const code = currency || region.currency;
  try {
    return new Intl.NumberFormat(region.locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(Number.isFinite(Number(value)) ? Number(value) : 0);
  } catch {
    return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(Number(value) || 0) + " " + code;
  }
}

export function formatDate(value, options) {
  const region = getSavedRegion();
  // Date-only values represent a calendar date, not midnight UTC. Use noon UTC
  // so a US time-zone conversion does not incorrectly display the previous day.
  const date = value instanceof Date
    ? value
    : (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T12:00:00Z`)
      : new Date(value));
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(region.locale, { timeZone: region.timezone, ...options }).format(date);
}

export function getCurrencySymbol(currency) {
  const region = getSavedRegion();
  const code = currency || region.currency;
  try {
    return new Intl.NumberFormat(region.locale, { style: "currency", currency: code })
      .formatToParts(0)
      .filter((part) => part.type === "currency")
      .map((part) => part.value)
      .join("");
  } catch {
    return code;
  }
}

export const SUPPORTED_COUNTRIES = Object.freeze(Object.keys(REGIONS));
