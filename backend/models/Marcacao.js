import mongoose from "mongoose";

const marcacaoSchema = new mongoose.Schema(
  {
    oficina: { type: mongoose.Schema.Types.ObjectId, ref: "Oficina", required: true },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    veiculo: { type: mongoose.Schema.Types.ObjectId, ref: "Veiculo", required: true },
    servico: { type: mongoose.Schema.Types.ObjectId, ref: "Servico", required: true },
    turno: { type: mongoose.Schema.Types.ObjectId, ref: "Turno", required: true },

    mecanico: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    data: { type: String, required: true },
    hora: { type: String, required: true },

    estado: {
      type: String,
      enum: ["AGENDADA", "EM_CURSO", "CONCLUIDA", "CANCELADA"],
      default: "AGENDADA",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Marcacao", marcacaoSchema);
