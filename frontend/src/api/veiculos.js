import api from "./api";

export const getMyVeiculos = () => api.get("/veiculos/me");
