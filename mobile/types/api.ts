export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}
