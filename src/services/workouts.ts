import { api } from "./api";

export type WorkoutHistoryResponse = {
  success: boolean;
  date: string;
  user?: {
    user_id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    sessions?: Session[];
  };
  message?: string;
};

export type Session = {
  session_id: string;
  start_time: string;
  end_time: string;
  gym_name: string;
  total_calories: number;
  sets: SessionSet[];
};

export type SessionSet = {
  exercise_name: string;
  set_number: number;
  session_set_number: number;
  reps_completed: number;
  avg_form_score: number;
  reps: Rep[];
};

export type Rep = {
  rep_number: number;
  duration_seconds: number;
  is_valid: boolean;
  telemetry_data?: {
    velocity?: number;
    start_angle?: number;
    end_angle?: number;
    error_margin?: number;
  };
};

export async function fetchWorkoutHistoryByDate(userId: string, dateYYYYMMDD: string) {
  const res = await api.get<WorkoutHistoryResponse>(`/api/user/${userId}/history/${dateYYYYMMDD}/`);
  return res.data;
}


export type UserHistoryAllResponse = {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  height_cm?: number;
  weight_kg?: number;
  sessions: Session[]; // reuse your existing Session type
};

export async function fetchUserHistoryAll(userId: string): Promise<UserHistoryAllResponse> {
  const res = await api.get(`/api/user/${userId}/history/`);
  return res.data;
}
