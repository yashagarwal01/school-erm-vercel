"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { label: "Collect Fees", href: "/fees/collect" },
  { label: "Fee Structure", href: "/fees/structure" },
  { label: "Discounts", href: "/fees/discounts" },
  { label: "Reports", href: "/fees/reports" },
];

export default function FeesNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 border-b mb-6">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-t-md",
              active
                ? "bg-white border border-b-0"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
