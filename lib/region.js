const REGIONS = {
  NG: { countryCode: "NG", label: "Nigeria", currency: "NGN", locale: "en-NG", timezone: "Africa/Lagos" },
  GB: { countryCode: "GB", label: "Europe/UK", currency: "GBP", locale: "en-GB", timezone: "Europe/London" },
  US: { countryCode: "US", label: "United States", currency: "USD", locale: "en-US", timezone: "America/New_York" },
};

const COUNTRY_CODES = ("AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW").split(" ");

const CURRENCY_CODES = ("NGN GBP USD EUR CAD AUD GHS KES ZAR INR JPY CNY AED SAR NZD CHF SGD HKD SEK NOK DKK PLN CZK HUF RON BGN TRY BRL MXN ARS CLP COP PEN PKR BDT LKR NPR IDR MYR THB VND PHP KRW TWD ILS EGP MAD TND DZD XOF XAF XCD XPF ETB UGX TZS RWF ZMW BWP NAD MUR SCR GMD SLL LRD GNF SOS SDG SSP AOA MZN MWK ZWL KWD BHD OMR QAR JOD LBP IQD IRR AFN AMD AZN GEL KZT UZS KGS TJS MNT RUB UAH BYN MDL RSD BAM MKD ALL ISK UYU PYG BOB DOP GTQ HNL NIO CRC PAB JMD TTD BBD BSD BZD XCG BND FJD PGK SBD VUV WST TOP XDR XAU XAG").split(" ");

const COUNTRY_DEFAULTS = {
  NG: ["NGN", "en-NG", "Africa/Lagos"],
  GB: ["GBP", "en-GB", "Europe/London"],
  US: ["USD", "en-US", "America/New_York"],
  CA: ["CAD", "en-CA", "America/Toronto"],
  AU: ["AUD", "en-AU", "Australia/Sydney"],
  NZ: ["NZD", "en-NZ", "Pacific/Auckland"],
  IE: ["EUR", "en-IE", "Europe/Dublin"],
  DE: ["EUR", "de-DE", "Europe/Berlin"],
  FR: ["EUR", "fr-FR", "Europe/Paris"],
  ES: ["EUR", "es-ES", "Europe/Madrid"],
  IT: ["EUR", "it-IT", "Europe/Rome"],
  NL: ["EUR", "nl-NL", "Europe/Amsterdam"],
  BE: ["EUR", "nl-BE", "Europe/Brussels"],
  PT: ["EUR", "pt-PT", "Europe/Lisbon"],
  GH: ["GHS", "en-GH", "Africa/Accra"],
  KE: ["KES", "en-KE", "Africa/Nairobi"],
  ZA: ["ZAR", "en-ZA", "Africa/Johannesburg"],
  IN: ["INR", "en-IN", "Asia/Kolkata"],
  JP: ["JPY", "ja-JP", "Asia/Tokyo"],
  CN: ["CNY", "zh-CN", "Asia/Shanghai"],
  AE: ["AED", "ar-AE", "Asia/Dubai"],
  SG: ["SGD", "en-SG", "Asia/Singapore"],
};

export function regionForCountry(code) {
  const countryCode = typeof code === "string" && COUNTRY_CODES.includes(code.toUpperCase()) ? code.toUpperCase() : "NG";
  const known = REGIONS[countryCode];
  if (known) return known;
  const [currency, locale, timezone] = COUNTRY_DEFAULTS[countryCode] || ["USD", "en", "UTC"];
  let label = countryCode;
  try { label = new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) || countryCode; } catch {}
  return { countryCode, label, currency, locale, timezone };
}

export function getCountryOptions() {
  return COUNTRY_CODES.map((code) => regionForCountry(code))
    .sort((a, b) => a.label.localeCompare(b.label, "en"));
}

export function getCurrencyOptions() {
  let codes = CURRENCY_CODES;
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      codes = Array.from(new Set([...CURRENCY_CODES, ...Intl.supportedValuesOf("currency")]));
    }
  } catch {}
  const priority = ["NGN", "GBP", "USD", "EUR", "CAD", "AUD", "GHS", "KES", "ZAR"];
  return Array.from(new Set([...priority, ...codes])).map((code) => {
    let name = code;
    try {
      name = new Intl.DisplayNames(["en"], { type: "currency" }).of(code) || code;
    } catch {}
    return { code, label: code + " — " + name };
  }).sort((a, b) => {
    const ai = priority.indexOf(a.code), bi = priority.indexOf(b.code);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return a.code.localeCompare(b.code);
  });
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
  const date = value instanceof Date
    ? value
    : (typeof value === "string" && /^\\d{4}-\\d{2}-\\d{2}$/.test(value)
      ? new Date(`${value}T12:00:00Z`)
      : new Date(value));
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat(region.locale, { timeZone: region.timezone, ...options }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en", { timeZone: "UTC", ...options }).format(date);
  }
}

export function getCurrencySymbol(currency) {
  const region = getSavedRegion();
  const code = currency || region.currency;
  try {
    return new Intl.NumberFormat(region.locale, { style: "currency", currency: code })
      .formatToParts(0).filter((part) => part.type === "currency").map((part) => part.value).join("");
  } catch {
    return code;
  }
}

export const SUPPORTED_COUNTRIES = Object.freeze(COUNTRY_CODES.slice());
