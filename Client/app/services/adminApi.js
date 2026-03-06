import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const fetchDashboardStats = async () => {
  const { data } = await http.get("/admin/dashboard/stats");
  return data;
};

export const fetchDashboardActivities = async () => {
  const { data } = await http.get("/admin/dashboard/activities", { params: { limit: 8 } });
  return data;
};

export const fetchPosts = async (params) => {
  const { data } = await http.get("/admin/posts", { params });
  return data;
};

export const createPost = async (payload) => {
  const { data } = await http.post("/admin/posts", payload);
  return data;
};

export const updatePost = async (postId, payload) => {
  const { data } = await http.put(`/admin/posts/${postId}`, payload);
  return data;
};

export const deletePost = async (postId) => {
  const { data } = await http.delete(`/admin/posts/${postId}`);
  return data;
};

export const fetchPendingModeration = async (params) => {
  const { data } = await http.get("/admin/moderation/pending", { params });
  return data;
};

export const approvePost = async (postId, reviewer_name) => {
  const { data } = await http.post(`/admin/moderation/${postId}/approve`, { reviewer_name });
  return data;
};

export const rejectPost = async (postId, payload) => {
  const { data } = await http.post(`/admin/moderation/${postId}/reject`, payload);
  return data;
};

export const fetchAccounts = async (params) => {
  const { data } = await http.get("/admin/accounts", { params });
  return data;
};

export const updateAccountRole = async (accountId, role) => {
  const { data } = await http.patch(`/admin/accounts/${accountId}/role`, { role });
  return data;
};

export const updateAccountLock = async (accountId, is_locked) => {
  const { data } = await http.patch(`/admin/accounts/${accountId}/lock`, { is_locked });
  return data;
};
