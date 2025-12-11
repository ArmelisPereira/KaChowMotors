import express from "express";
import { criarOficina, listarOficinas } from "../controllers/oficinaControllers.js";

const router = express.Router();

// POST /api/oficinas
router.post("/", criarOficina);

// GET /api/oficinas
router.get("/", listarOficinas);

export default router;
