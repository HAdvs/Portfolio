import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, type ReactNode } from "react";
import { isSupabaseConfigured, supabase } from "../supabase";
import { fetchAll } from "./db";
import { useAdminStore } from "../../admin/store/useAdminStore";

/* ════════════════════════════════════════════════════════════════════
   CmsProvider — React Query cache + Supabase hydration + realtime sync.

   • Initial load: one parallel fetch of every collection → store.
   • Realtime: postgres_changes on the public schema pushes remote
     mutations into the store instantly → every device/tab in sync.
   • The store remains the optimistic write-through cache used by both
     the public site and the admin pages.
   ════════════════════════════════════════════════════════════════════ */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 2, refetchOnWindowFocus: false },
  },
});

function CmsSync() {
  const hydrate = useAdminStore((s) => s.hydrate);
  const applyRemote = useAdminStore((s) => s.applyRemote);
  const setDbStatus = useAdminStore((s) => s.setDbStatus);
  const lastSyncRef = useRef<string | null>(null);

  const query = useQuery({
    queryKey: ["cms", "all"],
    queryFn: fetchAll,
    enabled: isSupabaseConfigured,
  });

  /* Hydrate the store whenever fresh data arrives */
  useEffect(() => {
    if (query.data) {
      hydrate(query.data);
      lastSyncRef.current = new Date().toISOString();
    }
  }, [query.data, hydrate]);

  /* Surface status + errors */
  useEffect(() => {
    if (!isSupabaseConfigured) setDbStatus("unconfigured");
    else if (query.isError) setDbStatus("error");
    else if (query.isFetching) setDbStatus("syncing");
    else if (query.data) setDbStatus("online");
  }, [query.isError, query.isFetching, query.data, setDbStatus]);

  /* Live cross-device sync via Supabase Realtime */
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel("cms-realtime")
      .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
        const { table, eventType, new: row, old } = payload;
        applyRemote(
          table,
          eventType as "INSERT" | "UPDATE" | "DELETE",
          ((eventType === "DELETE" ? old : row) as Record<string, unknown>) ?? {},
        );
        void queryClient.invalidateQueries({ queryKey: ["cms"] });
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [applyRemote]);

  return null;
}

export function CmsProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CmsSync />
      {children}
    </QueryClientProvider>
  );
}
