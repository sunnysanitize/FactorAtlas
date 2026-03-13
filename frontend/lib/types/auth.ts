export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}
