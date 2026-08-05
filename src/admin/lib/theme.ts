import { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";

/**
 * Resolves the admin theme preference ("light" | "dark" | "system")
 * into a concrete theme, live-tracking the OS preference when "system".
 */
export function useResolvedAdminTheme(): "light" | "dark" {
  const adminTheme = useAdminStore((s) => s.adminTheme);
  const [systemDark, setSystemDark] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      !!window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  if (adminTheme === "system") return systemDark ? "dark" : "light";
  return adminTheme === "dark" ? "dark" : "light";
}
