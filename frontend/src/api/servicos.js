import api from "./api";

export const getServicosByOficina = (oficinaId) =>
  api.get(`/servicos/oficina/${oficinaId}`);

export const createServico = (data) =>
  api.post("/servicos", data);