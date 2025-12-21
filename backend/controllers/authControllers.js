import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const toSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  oficina: user.oficina,
  createdAt: user.createdAt,
});

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body; // <-- não aceitar role aqui!

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "name, email e password são obrigatórios" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email já registado" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "cliente", // tenta forçar cliente
      oficina: null
    });

    res.status(201).json({ msg: "Utilizador registado", user: toSafeUser(user) });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ msg: "Email já registado" });
    }
    res.status(500).json({ msg: "Erro no registo", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: "JWT_SECRET não configurado" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Credenciais inválidas" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ msg: "Credenciais inválidas" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: toSafeUser(user) });
  } catch (error) {
    res.status(500).json({ msg: "Erro no login", error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    // req.user vem do authMiddleware
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ msg: "Utilizador não encontrado" });

    res.json({ user: toSafeUser(user) });
  } catch (error) {
    res.status(500).json({ msg: "Erro ao obter utilizador", error: error.message });
  }
};

// Endpoint pra criar contas de staff/admin porque o register público agora é só cliente
export const createStaffUser = async (req, res) => {
  try {
    const { name, email, password, role, oficina } = req.body;

    if (!["admin_oficina", "mecanico"].includes(role)) {
      return res.status(400).json({ msg: "Role inválida para staff" });
    }

    if (!oficina) {
      return res.status(400).json({ msg: "Staff precisa de oficina associada" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email já registado" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      oficina
    });

    res.status(201).json({ msg: "Utilizador staff criado", user: toSafeUser(user) });
  } catch (error) {
    res.status(500).json({ msg: "Erro ao criar staff", error: error.message });
  }
};
