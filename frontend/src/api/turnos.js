import api from "./api";

export const getTurnosByOficina = (oficinaId, params = {}) =>
  api.get(`/turnos/oficina/${oficinaId}`, { params });
