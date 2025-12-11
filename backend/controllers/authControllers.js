import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Email já registado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role
    });

    console.log("Novo utilizador criado:", user.email);

    res.status(201).json({ msg: "Utilizador registado", user });
  } catch (error) {
    console.error("Erro no registo:", error);


    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ msg: "Email já registado" });
    }

    res.status(500).json({ msg: "Erro no registo", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Credenciais inválidas" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ msg: "Credenciais inválidas" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro no login", error: error.message });
  }
};
