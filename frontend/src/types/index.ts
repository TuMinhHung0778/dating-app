export type Gender = "male" | "female" | "other";

export interface User {
  _id: string;
  email: string;
  name: string;
  age: number;
  gender: Gender;
  bio: string;
  avatar: string;
  avatarUrl: string;
  interests: string[];
  location: string;
  createdAt: string;
}

export interface UserWithStatus extends User {
  isLikedByMe: boolean;
  likedMe: boolean;
  isMatch: boolean;
}

export interface TimeSlot {
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export interface ScheduledDate {
  date: string | null;
  startTime: string | null;
  endTime: string | null;
}

export interface Match {
  _id: string;
  matchedUser: User;
  status: "matched" | "availability_pending" | "scheduled" | "no_slot";
  scheduledDate: ScheduledDate;
  myAvailabilitySubmitted: boolean;
  theirAvailabilitySubmitted: boolean;
  createdAt: string;
}

export interface MatchDetail extends Match {
  myAvailability: { slots: TimeSlot[]; submittedAt: string } | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}
