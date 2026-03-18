import api from "./api";

/** Get error message from backend (message/Message). Fallback by status if missing. */
const STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid data. Please check and try again.",
  401: "Incorrect email or password.",
  403: "You do not have permission to perform this action.",
  404: "Not found.",
  500: "Server error. Please try again later.",
};

export function getAuthErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string; Message?: string }; status?: number }; message?: string };
  const data = e?.response?.data;
  const msg = data?.message ?? data?.Message;
  if (msg && typeof msg === "string") return msg;
  const status = e?.response?.status;
  if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  return e?.message ?? "Something went wrong. Please try again.";
}

export interface UserDto {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt?: string;
  provider?: string;
  gitHubId?: string | null;
}

export interface UserOrganizationDto {
  organizationId: string;
  organizationName: string;
  organizationPlan?: string;
  role: string;
  joinedAt?: string;
}

const authService = {
  /** Pass token (e.g. after OAuth) to send it explicitly so the request is authenticated. */
  getMe: (token?: string) => {
    return api.get<{ content: UserDto }>(
      "/api/auth/me",
      token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    );
  },
  updateProfile: (payload: { name?: string; avatarUrl?: string }) => {
    return api.patch<{ content: UserDto }>("/api/auth/me", payload);
  },
  login: (email: string, password: string) => {
    return api.post("/api/auth/login", { email, password });
  },
  loginWithGoogle: (idToken: string) => {
    return api.post("/api/auth/google", { idToken });
  },
  loginWithGitHub: (code: string) => {
    return api.post("/api/auth/github", { code });
  },
  register: (email: string, password: string) => {
    return api.post("/api/auth/register", { email, password });
  },
  verifyEmail: (token: string) => {
    return api.post("/api/auth/verify-email", { token });
  },
  resendVerificationEmail: (email: string) => {
    return api.post("/api/auth/resend-verification", { email });
  },
  forgotPassword: (email: string) => {
    return api.post("/api/auth/forgot-password", { email });
  },
  resetPassword: (token: string, newPassword: string) => {
    return api.post("/api/auth/reset-password", { token, newPassword });
  },
  changePassword: (oldPassword: string | null, newPassword: string) => {
    const body: { OldPassword?: string; NewPassword: string } = {
      NewPassword: newPassword,
    };
    if (oldPassword != null && oldPassword !== "")
      body.OldPassword = oldPassword;
    return api.post("/api/auth/change-password", body);
  },
  refreshToken: (refreshToken: string) => {
    return api.post("/api/auth/refresh-token", { refreshToken });
  },
  disconnectGitHub: () => {
    return api.delete("/api/auth/github");
  },
  linkGitHub: (code: string) => {
    return api.post<{ content: UserDto }>("/api/auth/github/link", { code });
  },
};

export async function getMyOrganizations(userId: string) {
  const res = await api.get<{ content: UserOrganizationDto[] }>(
    `/api/organization-members/by-user/${userId}`,
  );
  const content = res.data?.content;
  const raw = Array.isArray(content)
    ? content
    : ((content as unknown as { TotalItems?: UserOrganizationDto[] })
      ?.TotalItems ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (Array.isArray(raw) ? raw : []).map((o: any) => ({
    organizationId: String(o.organizationId ?? o.OrganizationId ?? ""),
    organizationName: String(o.organizationName ?? o.OrganizationName ?? ""),
    organizationPlan:
      o.organizationPlan != null
        ? String(o.organizationPlan)
        : o.OrganizationPlan != null
          ? String(o.OrganizationPlan)
          : undefined,
    role: String(o.role ?? o.Role ?? ""),
    joinedAt:
      o.joinedAt != null
        ? String(o.joinedAt)
        : o.JoinedAt != null
          ? String(o.JoinedAt)
          : undefined,
  }));
}

export default authService;
