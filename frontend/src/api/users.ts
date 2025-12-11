import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // NestJS backend
});

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
}

export async function fetchUsers(): Promise<User[]> {
  const res = await api.get<User[]>('/users');
  return res.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const res = await api.post<User>('/users', payload);
  return res.data;
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  const res = await api.put<User>(`/users/${id}`, payload);
  return res.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}
