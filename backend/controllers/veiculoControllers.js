import Veiculo from "../models/Veiculo.js";

export const listarMeusVeiculos = async (req, res) => {
  try {
    const veiculos = await Veiculo.find({ cliente: req.user.userId }).sort({ createdAt: -1 });
    res.json(veiculos);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao listar veículos", error: e.message });
  }
};

export const criarVeiculo = async (req, res) => {
  try {
    const { marca, modelo, matricula, ano } = req.body;
    const veiculo = await Veiculo.create({
      cliente: req.user.userId,
      marca, modelo, matricula, ano
    });
    res.status(201).json(veiculo);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao criar veículo", error: e.message });
  }
};

export const atualizarVeiculo = async (req, res) => {
  try {
    const v = await Veiculo.findOneAndUpdate(
      { _id: req.params.id, cliente: req.user.userId },
      req.body,
      { new: true }
    );
    res.json(v);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao atualizar veículo", error: e.message });
  }
};

export const apagarVeiculo = async (req, res) => {
  try {
    await Veiculo.findOneAndDelete({ _id: req.params.id, cliente: req.user.userId });
    res.json({ msg: "Veículo apagado" });
  } catch (e) {
    res.status(500).json({ msg: "Erro ao apagar veículo", error: e.message });
  }
};
