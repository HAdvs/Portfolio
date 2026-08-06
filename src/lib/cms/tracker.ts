import { supabase } from "../supabaseClient";

const SESSION_STORAGE_KEY = "analytics_session";
const SESSION_IDLE_MS = 30 * 60 * 1000;

const parseBrowser = (ua: string) => {
  const userAgent = ua.toLowerCase();
  if (/edg\//.test(userAgent)) return "Edge";
  if (/opr\//.test(userAgent) || /opera/.test(userAgent)) return "Opera";
  if (/chrome\//.test(userAgent) && !/edg\//.test(userAgent) && !/opr\//.test(userAgent)) return "Chrome";
  if (/firefox\//.test(userAgent)) return "Firefox";
  if (/safari\//.test(userAgent) && !/chrome\//.test(userAgent)) return "Safari";
  return "Other";
};

const parseDevice = (ua: string) =>
  /Mobi/i.test(ua)
    ? "Mobile"
    : /Tablet/i.test(ua)
      ? "Tablet"
      : "Desktop";

const fetchLocation = async () => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) return { country: "", city: "" };
    const data = await response.json();
    return {
      country: data.country_name ?? data.country ?? "",
      city: data.city ?? "",
    };
  } catch {
    return { country: "", city: "" };
  }
};

const getSessionId = () => {
  if (typeof window === "undefined") return crypto.randomUUID();

  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const session = JSON.parse(stored) as { id: string; lastSeen: number };
      if (session?.id && typeof session.lastSeen === "number") {
        const now = Date.now();
        if (now - session.lastSeen <= SESSION_IDLE_MS) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...session, lastSeen: now }));
          return session.id;
        }
      }
    }
  } catch {
    // ignore localStorage failures
  }

  const id = crypto.randomUUID();
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id, lastSeen: Date.now() }));
  } catch {
    // ignore localStorage failures
  }

  return id;
};

export async function trackPageView(path: string) {
  if (!supabase) return;

  try {
    let visitorId = "";
    try {
      visitorId = localStorage.getItem("visitor_id") ?? "";
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("visitor_id", visitorId);
      }
    } catch {
      visitorId = crypto.randomUUID();
    }

    const sessionId = getSessionId();
    const device = parseDevice(navigator.userAgent);
    const browser = parseBrowser(navigator.userAgent);
    const os = navigator.platform || "";
    const referrer = document.referrer?.trim() || "Direct";
    const { country, city } = await fetchLocation();

    await supabase.from("page_views").insert({
      visitor_id: visitorId,
      session_id: sessionId,
      path,
      title: document.title,
      country,
      city,
      device,
      browser,
      os,
      referrer,
      ip_hash: "",
    });
  } catch (err) {
    console.error("[Analytics]", err);
  }
}
