import mongoose from "mongoose";

const turnoSchema = new mongoose.Schema(
  {
    oficina: { type: mongoose.Schema.Types.ObjectId, ref: "Oficina", required: true },
    servico: { type: mongoose.Schema.Types.ObjectId, ref: "Servico", default: null },

    data: { type: String, required: true },      // "YYYY-MM-DD"
    horaInicio: { type: String, required: true },// "HH:mm"
    horaFim: { type: String, required: true },   // "HH:mm"

    vagasTotal: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

turnoSchema.index({ oficina: 1, data: 1, horaInicio: 1, horaFim: 1 }, { unique: true });

export default mongoose.model("Turno", turnoSchema);
