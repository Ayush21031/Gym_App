import { api } from "./api";

export type AppUser = {
  user_id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  height_cm?: number;
  weight_kg?: number;
  created_at?: string;
};

export type ApiLoginResponse = {
  success: boolean;
  message: string;
  user?: AppUser;
};

export type VideoUploadFile = {
  uri: string;
  name: string;
  type: string;
};

export type UserSignupPayload = {
  gym_id: string;
  username: string;
  email: string;
  password: string;
  height_cm: number | string;
  face_video: VideoUploadFile;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  weight_kg?: number | string;
};

export type GymOwnerJoinExistingPayload = {
  email: string;
  full_name: string;
  password: string;
  gym_id: string;
};

export type GymOwnerCreateGymPayload = {
  email: string;
  full_name: string;
  password: string;
  gym_name: string;
  location_data: {
    address: string;
    city: string;
  };
};

export type GymOwnerSignupPayload =
  | GymOwnerJoinExistingPayload
  | GymOwnerCreateGymPayload;

export type OwnerGym = {
  gym_id: string;
  gym_name: string;
  location_data?: Record<string, unknown> | null;
};

export type GymOwner = {
  owner_id: string;
  email?: string;
  full_name?: string;
  gyms: OwnerGym[];
};

export type GymOwnerLoginResponse = {
  success: boolean;
  message: string;
  owner?: GymOwner;
};

export type PendingSignupRequest = {
  request_id: string;
  status?: string;
  created_at?: string;
  gym_id?: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  height_cm?: number;
  weight_kg?: number;
  face_video_url?: string;
};

export type PendingSignupDecisionPayload =
  | { action: "APPROVE" }
  | { action: "REJECT"; rejection_reason: string };

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as AnyRecord)
    : null;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }
  return undefined;
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return undefined;
}

function appendOptionalFormField(form: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return;
  const normalized = String(value).trim();
  if (!normalized) return;
  form.append(key, normalized);
}

function normalizeOwnerGym(rawGym: unknown): OwnerGym | null {
  const gym = asRecord(rawGym);
  if (!gym) return null;

  const gym_id = pickString(gym.gym_id, gym.gymId, gym.id, gym.uuid);
  if (!gym_id) return null;

  const gym_name = pickString(gym.gym_name, gym.gymName, gym.name) ?? "Gym";
  const location_data =
    asRecord(gym.location_data) ?? asRecord(gym.locationData) ?? null;

  return { gym_id, gym_name, location_data };
}

function normalizeGymOwnerLoginResponse(raw: unknown): GymOwnerLoginResponse {
  const envelope = asRecord(raw) ?? {};
  const payload = asRecord(envelope.data) ?? envelope;
  const ownerPayload = asRecord(payload.owner) ?? payload;

  const owner_id = pickString(
    ownerPayload.owner_id,
    ownerPayload.ownerId,
    ownerPayload.id
  );

  const gymsSource = Array.isArray(ownerPayload.gyms)
    ? ownerPayload.gyms
    : Array.isArray(payload.gyms)
      ? payload.gyms
      : [];

  const gyms = gymsSource
    .map(normalizeOwnerGym)
    .filter((gym): gym is OwnerGym => Boolean(gym));

  const successFlag =
    typeof envelope.success === "boolean" ? envelope.success : undefined;

  const success = successFlag ?? Boolean(owner_id);
  const message =
    pickString(envelope.message, envelope.detail, payload.message, payload.detail) ??
    (success ? "Login successful." : "Unable to login.");

  if (!success || !owner_id) {
    return { success: false, message };
  }

  return {
    success: true,
    message,
    owner: {
      owner_id,
      email: pickString(ownerPayload.email, payload.email),
      full_name: pickString(
        ownerPayload.full_name,
        ownerPayload.fullName,
        ownerPayload.name,
        payload.full_name,
        payload.fullName
      ),
      gyms,
    },
  };
}

function normalizePendingSignup(raw: unknown): PendingSignupRequest | null {
  const source = asRecord(raw);
  if (!source) return null;

  const profile = asRecord(source.member_data) ?? asRecord(source.member) ?? source;

  const request_id = pickString(source.request_id, source.requestId, source.id);
  if (!request_id) return null;

  return {
    request_id,
    status: pickString(source.status),
    created_at: pickString(source.created_at, source.createdAt),
    gym_id: pickString(source.gym_id, source.gymId, profile.gym_id),
    username: pickString(profile.username),
    email: pickString(profile.email),
    first_name: pickString(profile.first_name, profile.firstName),
    last_name: pickString(profile.last_name, profile.lastName),
    phone: pickString(profile.phone),
    gender: pickString(profile.gender),
    date_of_birth: pickString(profile.date_of_birth, profile.dateOfBirth),
    height_cm: pickNumber(profile.height_cm, profile.heightCm),
    weight_kg: pickNumber(profile.weight_kg, profile.weightKg),
    face_video_url: pickString(
      source.face_video_url,
      source.faceVideoUrl,
      profile.face_video_url
    ),
  };
}

function normalizePendingSignupList(raw: unknown): PendingSignupRequest[] {
  if (Array.isArray(raw)) {
    return raw
      .map(normalizePendingSignup)
      .filter((request): request is PendingSignupRequest => Boolean(request));
  }

  const record = asRecord(raw);
  if (!record) return [];

  const nested =
    (Array.isArray(record.results) && record.results) ||
    (Array.isArray(record.data) && record.data) ||
    (Array.isArray(record.requests) && record.requests) ||
    (Array.isArray(record.pending_signups) && record.pending_signups) ||
    [];

  return nested
    .map(normalizePendingSignup)
    .filter((request): request is PendingSignupRequest => Boolean(request));
}

export async function login(email: string, password: string) {
  const response = await api.post<ApiLoginResponse>("/api/login/", { email, password });
  return response.data;
}

export async function signupUser(payload: UserSignupPayload) {
  const form = new FormData();

  form.append("gym_id", payload.gym_id.trim());
  form.append("username", payload.username.trim());
  form.append("email", payload.email.trim());
  form.append("password", payload.password);
  form.append("height_cm", String(payload.height_cm));
  form.append("face_video", payload.face_video as any);

  appendOptionalFormField(form, "weight_kg", payload.weight_kg);
  appendOptionalFormField(form, "first_name", payload.first_name);
  appendOptionalFormField(form, "last_name", payload.last_name);
  appendOptionalFormField(form, "phone", payload.phone);
  appendOptionalFormField(form, "gender", payload.gender);
  appendOptionalFormField(form, "date_of_birth", payload.date_of_birth);

  const response = await api.post("/api/signup/user/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

export async function signupGymOwner(payload: GymOwnerSignupPayload) {
  const response = await api.post("/api/signup/gym-owner/", payload);
  return response.data;
}

export async function loginGymOwner(email: string, password: string) {
  const response = await api.post("/api/gym-owner/login/", { email, password });
  return normalizeGymOwnerLoginResponse(response.data);
}

export async function getGymOwnerPendingSignups(owner_id: string, gym_id: string) {
  const response = await api.get(
    `/api/gym-owner/${encodeURIComponent(owner_id)}/pending-signups/`,
    { params: { gym_id } }
  );
  return normalizePendingSignupList(response.data);
}

export async function decidePendingSignup(
  owner_id: string,
  request_id: string,
  payload: PendingSignupDecisionPayload
) {
  const response = await api.post(
    `/api/gym-owner/${encodeURIComponent(owner_id)}/pending-signups/${encodeURIComponent(request_id)}/decision/`,
    payload
  );
  return response.data;
}
