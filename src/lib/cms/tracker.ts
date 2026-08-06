import { supabase } from "../supabaseClient";

export async function trackPageView(path: string) {
  if (!supabase) return;

  try {
    let visitorId = localStorage.getItem("visitor_id");

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("visitor_id", visitorId);
    }

    const device =
      /Mobi/i.test(navigator.userAgent)
        ? "Mobile"
        : /Tablet/i.test(navigator.userAgent)
        ? "Tablet"
        : "Desktop";

    await supabase.from("page_views").insert({
      visitor_id: visitorId,
      session_id: crypto.randomUUID(),
      path,
      title: document.title,
      country: "",
      city: "",
      device,
      browser: navigator.userAgent,
      os: navigator.platform,
      referrer: document.referrer,
      ip_hash: "",
    });
  } catch (err) {
    console.error("[Analytics]", err);
  }
}