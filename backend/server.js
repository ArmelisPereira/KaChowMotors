import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import oficinaRoutes from "./routes/oficinaRoutes.js";
import servicoRoutes from "./routes/servicoRoutes.js";
import veiculoRoutes from "./routes/veiculoRoutes.js";
import turnoRoutes from "./routes/turnoRoutes.js";
import marcacaoRoutes from "./routes/marcacaoRoutes.js";


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/oficinas", oficinaRoutes);
app.use("/api/servicos", servicoRoutes);
app.use("/api/veiculos", veiculoRoutes);
app.use("/api/turnos", turnoRoutes);
app.use("/api/marcacoes", marcacaoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
