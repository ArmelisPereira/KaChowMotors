import express from "express";
import { criarOficina, listarOficinas } from "../controllers/oficinaControllers.js";

const router = express.Router();


router.post("/", criarOficina);


router.get("/", listarOficinas);

export default router;
