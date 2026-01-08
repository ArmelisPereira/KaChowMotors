import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  criarServico,
  listarServicosPorOficina,
  atualizarServico,
  apagarServico,
  obterServico
} from "../controllers/servicoControllers.js";

const router = express.Router();

router.get("/oficina/:oficinaId", listarServicosPorOficina);
router.post("/", authMiddleware(["admin_oficina"]), criarServico);
router.put("/:id", authMiddleware(["admin_oficina"]), atualizarServico);
router.delete("/:id", authMiddleware(["admin_oficina"]), apagarServico);
router.get("/:id", obterServico);

export default router;
