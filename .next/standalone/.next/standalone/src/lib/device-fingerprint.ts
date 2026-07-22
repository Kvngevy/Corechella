const FINGERPRINT_KEY = "corechella:device-fp";

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `fp-${Math.abs(hash).toString(36)}`;
}

export function getDeviceFingerprint() {
  if (typeof window === "undefined") return "";

  try {
    const cached = localStorage.getItem(FINGERPRINT_KEY);
    if (cached) return cached;

    const parts = [
      navigator.userAgent,
      navigator.language,
      String(screen.width),
      String(screen.height),
      String(window.devicePixelRatio),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    ];

    const fingerprint = hashString(parts.join("|"));
    localStorage.setItem(FINGERPRINT_KEY, fingerprint);
    return fingerprint;
  } catch {
    return hashString(navigator.userAgent);
  }
}
