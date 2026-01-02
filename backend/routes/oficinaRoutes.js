import express from "express";
import { criarOficina, listarOficinas } from "../controllers/oficinaControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listarOficinas);
router.post("/", authMiddleware(["admin_oficina"]), criarOficina);

export default router;
