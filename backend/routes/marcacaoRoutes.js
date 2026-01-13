import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  criarMarcacao,
  listarMinhasMarcacoes,
  cancelarMarcacao,
  listarMarcacoesOficina,
  atualizarEstadoMarcacao,
  reagendarMarcacao,
  listarMarcacaoPorId
} from "../controllers/marcacaoControllers.js";

const router = express.Router();

// cliente
router.post("/", authMiddleware(["cliente"]), criarMarcacao);
router.get("/me", authMiddleware(["cliente"]), listarMinhasMarcacoes);
router.patch("/:id/cancelar", authMiddleware(["cliente"]), cancelarMarcacao);
router.patch("/:id/reagendar", authMiddleware(["cliente"]), reagendarMarcacao);

// admin/mecanico
router.get("/oficina/:oficinaId", authMiddleware(["admin_oficina", "mecanico"]), listarMarcacoesOficina);
router.patch("/:id/estado", authMiddleware(["admin_oficina", "mecanico"]), atualizarEstadoMarcacao);
router.get("/:marcacaoId", authMiddleware(["admin_oficina", "mecanico"]), listarMarcacaoPorId);

export default router;
