import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  criarMarcacao,
  listarMinhasMarcacoes,
  cancelarMarcacao,
  listarMarcacoesOficina,
  atualizarEstadoMarcacao
} from "../controllers/marcacaoControllers.js";

const router = express.Router();

router.post("/", authMiddleware(["cliente"]), criarMarcacao);
router.get("/me", authMiddleware(["cliente"]), listarMinhasMarcacoes);
router.patch("/:id/cancelar", authMiddleware(["cliente"]), cancelarMarcacao);

router.get("/oficina/:oficinaId", authMiddleware(["admin_oficina", "mecanico"]), listarMarcacoesOficina);
router.patch("/:id/estado", authMiddleware(["admin_oficina", "mecanico"]), atualizarEstadoMarcacao);

export default router;
