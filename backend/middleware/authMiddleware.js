import jwt from "jsonwebtoken";

export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: "JWT_SECRET não configurado" });
    }

    const auth = req.headers.authorization;

    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Token não fornecido" });
    }

    const token = auth.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "Token não fornecido" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ msg: "Permissão negada" });
      }

      next();
    } catch (error) {
      res.status(401).json({ msg: "Token inválido" });
    }
  };
};
