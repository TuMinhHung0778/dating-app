import axios from "axios";
import api from "./api";
import type {
  User,
  UserWithStatus,
  Match,
  MatchDetail,
  TimeSlot,
  AuthResponse,
} from "@/types";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data: {
    email: string;
    password: string;
    name: string;
    age: number;
    gender: string;
    bio?: string;
    interests?: string[];
    location?: string;
  }) =>
    api
      .post<{
        success: boolean;
        message: string;
        data: AuthResponse;
      }>("/auth/register", data)
      .then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api
      .post<{
        success: boolean;
        message: string;
        data: AuthResponse;
      }>("/auth/login", data)
      .then((r) => r.data),

  getMe: () =>
    api
      .get<{ success: boolean; data: { user: User } }>("/auth/me")
      .then((r) => r.data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userService = {
  getUsers: () =>
    api
      .get<{ success: boolean; data: { users: UserWithStatus[] } }>("/users")
      .then((r) => r.data),

  updateProfile: (
    data: Partial<{
      name: string;
      age: number;
      gender: string;
      bio: string;
      interests: string[];
      location: string;
    }>,
  ) =>
    api
      .put<{
        success: boolean;
        message: string;
        data: { user: User };
      }>("/users/profile", data)
      .then((r) => r.data),
};

// ── Likes ─────────────────────────────────────────────────────────────────────
export const likeService = {
  likeUser: (userId: string) =>
    api
      .post<{
        success: boolean;
        message: string;
        data: { isMatch: boolean; matchId: string | null };
      }>(`/likes/${userId}`)
      .then((r) => r.data),

  unlikeUser: (userId: string) =>
    api.delete(`/likes/${userId}`).then((r) => r.data),

  getMatches: () =>
    api
      .get<{
        success: boolean;
        data: { matches: Match[] };
      }>("/likes/matches/list")
      .then((r) => r.data),
};

// ── Matches ───────────────────────────────────────────────────────────────────
export const matchService = {
  getMatchDetail: (matchId: string) =>
    api
      .get<{
        success: boolean;
        data: { match: MatchDetail };
      }>(`/matches/${matchId}`)
      .then((r) => r.data),

  submitAvailability: (matchId: string, slots: TimeSlot[]) =>
    api
      .post<{
        success: boolean;
        message: string;
        data: {
          status: string;
          scheduledDate: {
            date: string | null;
            startTime: string | null;
            endTime: string | null;
          };
          bothSubmitted: boolean;
        };
      }>(`/matches/${matchId}/availability`, { slots })
      .then((r) => r.data),
};

// ── Helper: extract error message ─────────────────────────────────────────────
export const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message || "Có lỗi xảy ra";
  }
  return "Có lỗi xảy ra";
};
