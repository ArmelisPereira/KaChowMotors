import express from "express";
import { register, login, me, createStaffUser } from "../controllers/authControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware(), me);
// criar staff (apenas admin_oficina)
router.post("/staff", authMiddleware(["admin_oficina"]), createStaffUser);

export default router;
