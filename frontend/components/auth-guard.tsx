"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isHydrated) return;

    if (requireAuth && !isAuthenticated) {
      router.push("/login");
    } else if (!requireAuth && isAuthenticated) {
      router.push("/dashboard/contracts");
    }
  }, [isAuthenticated, isHydrated, requireAuth, router]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-white" />
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
