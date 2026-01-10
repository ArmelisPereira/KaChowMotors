import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  criarMarcacao,
  listarMinhasMarcacoes,
  cancelarMarcacao,
  listarMarcacoesOficina,
  atualizarEstadoMarcacao,
  listarMarcacaoPorId, // Nova função para buscar marcação específica
} from "../controllers/marcacaoControllers.js";

const router = express.Router();

// Rota para criar marcação (apenas cliente)
router.post("/", authMiddleware(["cliente"]), criarMarcacao);

// Rota para listar as marcações do cliente
router.get("/me", authMiddleware(["cliente"]), listarMinhasMarcacoes);

// Rota para cancelar marcação (apenas cliente)
router.patch("/:id/cancelar", authMiddleware(["cliente"]), cancelarMarcacao);

// Rota para listar marcações da oficina (admin_oficina ou mecânico)
router.get("/oficina/:oficinaId", authMiddleware(["admin_oficina", "mecanico"]), listarMarcacoesOficina);

// Rota para listar uma marcação específica pelo ID
router.get("/:marcacaoId", authMiddleware(["admin_oficina", "mecanico", "cliente"]), listarMarcacaoPorId);

// Rota para atualizar o estado da marcação (admin_oficina ou mecânico)
router.patch("/:id/estado", authMiddleware(["admin_oficina", "mecanico"]), atualizarEstadoMarcacao);

export default router;
