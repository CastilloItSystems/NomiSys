import apiClient from "./apiClient";

export const getNomiSys = async (id: string) => {
  const response = await apiClient.get(`/autoSys/${id}`);
  return response.data;
};

export const getNomiSyss = async () => {
  const response = await apiClient.get("/autoSys");
  return response.data;
};

export const createNomiSys = async (data: any) => {
  const response = await apiClient.post("/autoSys", data);
  return response.data;
};

export const updateNomiSys = async (id: string, data: any) => {
  const response = await apiClient.put(`/autoSys/${id}`, data);
  return response.data;
};

export const deleteNomiSys = async (id: string) => {
  const response = await apiClient.delete(`/autoSys/${id}`);
  return response.data;
};
