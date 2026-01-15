"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/students",
  "/teachers",
  "/fees",
];

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isProtected = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (!isProtected) {
      setChecking(false);
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
    } else {
      setChecking(false);
    }
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
