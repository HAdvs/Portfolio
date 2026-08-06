import { supabase } from "../supabaseClient";

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
        visitsByDay: [],
        visitsByCountry: [],
        deviceBreakdown: [],
      };
    }

    const { data: pageViews } = await supabase
      .from("page_views")
      .select("*");

    const rows = pageViews ?? [];

    const totalVisitors = new Set(
      rows.map((r) => r.visitor_id)
    ).size;

    const pageViewsCount = rows.length;

    const topPages = Object.entries(
      rows.reduce((acc: Record<string, number>, row: any) => {
        acc[row.path] = (acc[row.path] ?? 0) + 1;
        return acc;
      }, {})
    )
      .map(([page, views]) => ({
        page,
        views,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const visitsByCountry = Object.entries(
      rows.reduce((acc: Record<string, number>, row: any) => {
        const country = row.country || "Unknown";
        acc[country] = (acc[country] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([country, visits]) => ({
      country,
      visits,
      flag: "🌍",
    }));

    const deviceBreakdown = Object.entries(
      rows.reduce((acc: Record<string, number>, row: any) => {
        const device = row.device || "Desktop";
        acc[device] = (acc[device] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([device, value]) => ({
      device,
      pct: Math.round((value / Math.max(rows.length, 1)) * 100),
    }));

    const visitsByDay = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));

      const key = date.toISOString().slice(0, 10);

      const visits = rows.filter(
        (r: any) => r.created_at?.slice(0, 10) === key
      ).length;

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
      bounceRate: 0,
      avgSession: "0:00",
      topPages,
      visitsByDay,
      visitsByCountry,
      deviceBreakdown,
    };
  },
};