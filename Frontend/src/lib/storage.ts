import CryptoJS from "crypto-js";

const SECRET =
  process.env.NEXT_PUBLIC_STORAGE_KEY || "school-erp-default-storage-key";

const STORAGE_KEY = "erp_session";

export interface AuthSession {
  userId: string;
  name: string;
  loginType: "admin" | "teacher" | "student"; // role: admin | teacher | student
  accessToken: string;
  refreshToken: string;
}

function encrypt(plainText: string): string {
  return CryptoJS.AES.encrypt(plainText, SECRET).toString();
}

function decrypt(cipherText: string): string {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/** Save the full auth session to localStorage (encrypted). */
export function setSession(session: AuthSession): void {
  const encrypted = encrypt(JSON.stringify(session));
  localStorage.setItem(STORAGE_KEY, encrypted);
}

/** Read and decrypt the auth session. Returns null if missing or tampered. */
export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const decrypted = decrypt(raw);
    if (!decrypted) return null;
    return JSON.parse(decrypted) as AuthSession;
  } catch {
    return null;
  }
}

/** Patch specific fields in the stored session (e.g. after token refresh). */
export function updateSession(partial: Partial<AuthSession>): void {
  const session = getSession();
  if (!session) return;
  setSession({ ...session, ...partial });
}

/** Remove the session from localStorage (logout). */
export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Convenience getters ────────────────────────────────────────────────────

export function getloginType(): "admin" | "teacher" | "student" {
  return getSession()?.loginType ?? "student";
}
export function getUserId(): string {
  return getSession()?.userId ?? "na";
}

export function getAccessToken(): string | null {
  return getSession()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getSession()?.refreshToken ?? null;
}
