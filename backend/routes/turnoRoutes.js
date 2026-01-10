import express from "express";
import { listarMarcacaoPorId } from "../controllers/marcacaoControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  criarTurno,
  listarTurnosPorOficina,
  apagarTurno
} from "../controllers/turnoControllers.js";

const router = express.Router();

router.get("/oficina/:oficinaId", listarTurnosPorOficina);
router.post("/", authMiddleware(["admin_oficina"]), criarTurno);
router.delete("/:id", authMiddleware(["admin_oficina"]), apagarTurno);
router.get("/:marcacaoId", listarMarcacaoPorId);

export default router;
