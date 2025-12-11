import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin_oficina", "mecanico", "cliente"], default: "cliente" },
    oficina: { type: mongoose.Schema.Types.ObjectId, ref: "Oficina", default: null }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
