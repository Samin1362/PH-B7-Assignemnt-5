"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const TOAST_ID = "network-status";

/**
 * The API layer already turns an unreachable server into "Cannot reach the
 * server", but that only surfaces when something is requested. This says so
 * the moment the connection drops, and clears itself when it comes back.
 */
export function NetworkStatus() {
  useEffect(() => {
    const goOffline = () =>
      toast.error("You are offline", {
        id: TOAST_ID,
        description: "GearUp needs a connection. We will reconnect for you.",
        duration: Infinity,
      });

    const goOnline = () => {
      toast.dismiss(TOAST_ID);
      toast.success("Back online");
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  return null;
}
