import express from "express";
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

export default router;
