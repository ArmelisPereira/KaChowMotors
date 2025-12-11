import mongoose from "mongoose";

const oficinaSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    localizacao: { type: String, required: true },
    contacto: { type: String, required: true },
    descricao: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Oficina", oficinaSchema);
