"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { clientFetchData } from "@/lib/client-api";
import type { User } from "@/types/api";

export const sessionKey = ["session"] as const;

export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: () => clientFetchData<User>("/auth/me"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });
}
