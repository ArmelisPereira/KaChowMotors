import api from "./api";

export const criarMarcacao = (data) => api.post("/marcacoes", data);
