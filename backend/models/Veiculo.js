import mongoose from "mongoose";

const veiculoSchema = new mongoose.Schema(
  {
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    matricula: { type: String, required: true, uppercase: true, trim: true },
    ano: { type: Number, required: true, min: 1950, max: 2100 },
  },
  { timestamps: true }
);

veiculoSchema.index({ cliente: 1, matricula: 1 }, { unique: true });

export default mongoose.model("Veiculo", veiculoSchema);
