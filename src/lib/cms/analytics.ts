import { supabase } from "../supabaseClient";

const formatDuration = (seconds: number) => {
  const rounded = Math.max(0, Math.round(seconds));
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const toTopList = (rows: any[], key: string, formatter: (value: string) => string) =>
  Object.entries(
    rows.reduce((acc: Record<string, number>, row: any) => {
      const value = formatter(row[key] ?? "") || "Unknown";
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([value, visits]) => ({ value, visits }))
    .sort((a, b) => b.visits - a.visits);

export const dbAnalytics = {
  async getDashboardStats() {
    if (!supabase) {
      return {
        totalVisitors: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        bounceRate: 0,
        avgSession: "0:00",
        topPages: [],
        topBrowsers: [],
        topReferrers: [],
        topCities: [],
        visitsByDay: [],
        visitsByCountry: [],
        deviceBreakdown: [],
      };
    }

    const { data: pageViews, error } = await supabase
      .from("page_views")
      .select("visitor_id,session_id,path,title,country,city,device,browser,os,referrer,created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[Analytics] failed to load page views", error);
      return {
        totalVisitors: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        bounceRate: 0,
        avgSession: "0:00",
        topPages: [],
        topBrowsers: [],
        topReferrers: [],
        topCities: [],
        visitsByDay: [],
        visitsByCountry: [],
        deviceBreakdown: [],
      };
    }

    const rows = pageViews ?? [];
    const totalVisitors = new Set(rows.map((r: any) => r.visitor_id)).size;
    const pageViewsCount = rows.length;

    const topPages = Object.entries(
      rows.reduce((acc: Record<string, number>, row: any) => {
        const page = row.path || "Unknown";
        acc[page] = (acc[page] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const topBrowsers = toTopList(rows, "browser", (value) => value?.trim() || "Unknown")
      .map(({ value, visits }) => ({ browser: value, visits, pct: Math.round((visits / Math.max(rows.length, 1)) * 100) }))
      .slice(0, 5);

    const topReferrers = toTopList(rows, "referrer", (value) => {
      const ref = value?.trim();
      if (!ref) return "Direct";
      try {
        return new URL(ref).hostname.replace(/^www\./, "");
      } catch {
        return ref;
      }
    })
      .slice(0, 5)
      .map(({ value, visits }) => ({ referrer: value || "Direct", visits }));

    const topCities = toTopList(rows, "city", (value) => value?.trim() || "Unknown")
      .slice(0, 5)
      .map(({ value, visits }) => ({ city: value, visits }));

    const visitsByCountry = Object.entries(
      rows.reduce((acc: Record<string, number>, row: any) => {
        const country = row.country?.trim() || "Unknown";
        acc[country] = (acc[country] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([country, visits]) => ({ country, visits, flag: "🌍" }));

    const deviceBreakdown = Object.entries(
      rows.reduce((acc: Record<string, number>, row: any) => {
        const device = row.device?.trim() || "Desktop";
        acc[device] = (acc[device] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([device, value]) => ({ device, pct: Math.round((value / Math.max(rows.length, 1)) * 100) }));

    const sessions = rows.reduce((acc: Record<string, any[]>, row: any) => {
      const sessionId = row.session_id || `session-${row.visitor_id}-${row.created_at}`;
      acc[sessionId] = acc[sessionId] ?? [];
      acc[sessionId].push(row);
      return acc;
    }, {});

    const sessionEntries = Object.values(sessions);
    const sessionCount = sessionEntries.length;
    const bounceRate = sessionCount === 0
      ? 0
      : Math.round((sessionEntries.filter((session) => session.length === 1).length / sessionCount) * 100);

    const avgSession = sessionCount === 0
      ? "0:00"
      : formatDuration(
          sessionEntries.reduce((sum, session) => {
            const times = session
              .map((row: any) => new Date(row.created_at).getTime())
              .filter((ts: number) => !Number.isNaN(ts))
              .sort((a: number, b: number) => a - b);
            return sum + (times.length > 1 ? times[times.length - 1] - times[0] : 0);
          }, 0) / 1000 / sessionCount,
        );

    const visitsByDay = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      const key = date.toISOString().slice(0, 10);
      const visits = rows.filter((r: any) => r.created_at?.slice(0, 10) === key).length;
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        visits,
      };
    });

    return {
      totalVisitors,
      uniqueVisitors: totalVisitors,
      pageViews: pageViewsCount,
      bounceRate,
      avgSession,
      topPages,
      topBrowsers,
      topReferrers,
      topCities,
      visitsByDay,
      visitsByCountry,
      deviceBreakdown,
    };
  },
};
