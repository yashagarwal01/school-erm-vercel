export type Role = "admin" | "teacher" | "student";

export const ROLE_PERMISSIONS: Record<string, Role[]> = {
  "/dashboard": ["admin", "teacher", "student"],
  "/students": ["admin", "teacher"],
  "/employee": ["admin"],
  "/attendance": ["admin", "teacher","student"],
  "/classes": ["admin"],
  "/holidays": ["admin", "teacher", "student"],
  "/exams": ["admin"],
  "/subjects": ["admin"],
  "/marks": [ "teacher","student"],
  "/fees": ["admin","student"],
};

export const canAccessRoute = (pathname: string, role?: Role | null) => {
  if (!role) return false;

  const matchedRoute = Object.keys(ROLE_PERMISSIONS).find((route) =>
    pathname.startsWith(route)
  );

  if (!matchedRoute) return true; // public route

  return ROLE_PERMISSIONS[matchedRoute].includes(role);
};

export const getAllowedMenu = <T extends { href: string }>(
  menu: T[],
  role?: Role | null | undefined
) => {
  if (!role) return [];

  return menu.filter((item) =>
    canAccessRoute(item.href, role)
  );
};