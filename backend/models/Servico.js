import mongoose from "mongoose";

const servicoSchema = new mongoose.Schema(
  {
    oficina: { type: mongoose.Schema.Types.ObjectId, ref: "Oficina", required: true },
    nome: { type: String, required: true },
    tipo: { type: String, required: true },
    preco: { type: Number, required: true, min: 0 },
    duracaoMin: { type: Number, required: true, min: 5 },
    descricaoPublica: { type: String, default: "" },
    descricaoPrivada: { type: String, default: "" },
    vagasPorTurno: { type: Number, required: true, min: 1, default: 1 },
    antecedenciaMinHoras: { type: Number, default: 0 },
    mecanicosAutorizados: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export default mongoose.model("Servico", servicoSchema);
