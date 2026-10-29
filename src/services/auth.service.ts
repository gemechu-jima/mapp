import { api } from "./api";
import type {AuthResponse, RegisterRequest } from "@/types/auth"

export async function loginUser(phoneNumber: string) {
const response=await api.post<AuthResponse>('/users/login', phoneNumber);
  return response.data;
}

export async function registerUser(data:RegisterRequest){
     const response=await api.post<AuthResponse>('/users/register', data);
     return response.data
}