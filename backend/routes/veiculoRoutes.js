import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  listarMeusVeiculos,
  criarVeiculo,
  atualizarVeiculo,
  apagarVeiculo
} from "../controllers/veiculoControllers.js";

const router = express.Router();

router.get("/me", authMiddleware(["cliente"]), listarMeusVeiculos);
router.post("/", authMiddleware(["cliente"]), criarVeiculo);
router.put("/:id", authMiddleware(["cliente"]), atualizarVeiculo);
router.delete("/:id", authMiddleware(["cliente"]), apagarVeiculo);

export default router;
