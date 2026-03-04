import api from "./api";

export interface UserDto {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt?: string;
  provider?: string;
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
  getMe: (token?: string) =>
    api.get<{ content: UserDto }>("/auth/me", token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  updateProfile: (payload: { name?: string; avatarUrl?: string }) =>
    api.patch<{ content: UserDto }>("/auth/me", payload),
  login: (email: string, password: string) => {
    return api.post("/auth/login", { email, password });
  },
  loginWithGoogle: (idToken: string) => {
    return api.post("/auth/google", { idToken });
  },
  loginWithGitHub: (code: string) => {
    return api.post("/auth/github", { code });
  },
  register: (email: string, password: string) => {
    return api.post("/auth/register", { email, password });
  },
  verifyEmail: (token: string) => {
    return api.post("/auth/verify-email", { token });
  },
  resendVerificationEmail: (email: string) => {
    return api.post("/auth/resend-verification", { email });
  },
  forgotPassword: (email: string) => {
    return api.post("/auth/forgot-password", { email });
  },
  resetPassword: (token: string, newPassword: string) => {
    return api.post("/auth/reset-password", { token, newPassword });
  },
  changePassword: (oldPassword: string | null, newPassword: string) => {
    const body: { OldPassword?: string; NewPassword: string } = {
      NewPassword: newPassword,
    };
    if (oldPassword != null && oldPassword !== "")
      body.OldPassword = oldPassword;
    return api.post("/auth/change-password", body);
  },
  refreshToken: (refreshToken: string) => {
    return api.post("/auth/refresh-token", { refreshToken });
  },
};

export async function getMyOrganizations(userId: string) {
  const res = await api.get<{ content: UserOrganizationDto[] }>(
    `/api/OrganizationMember/user/${userId}`,
  );
  const content = res.data?.content;
  const raw = Array.isArray(content)
    ? content
    : ((content as unknown as { TotalItems?: UserOrganizationDto[] })
        ?.TotalItems ?? []);
  return (Array.isArray(raw) ? raw : []).map((o: Record<string, unknown>) => ({
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
