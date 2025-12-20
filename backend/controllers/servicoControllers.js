import Servico from "../models/Servico.js";

export const listarServicosPorOficina = async (req, res) => {
  try {
    const { oficinaId } = req.params;
    const servicos = await Servico.find({ oficina: oficinaId }).sort({ createdAt: -1 });
    res.json(servicos);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao listar serviços", error: e.message });
  }
};

export const criarServico = async (req, res) => {
  try {
    const {
      oficina,
      nome,
      tipo,
      preco,
      duracaoMin,
      descricaoPublica,
      descricaoPrivada,
      vagasPorTurno,
      antecedenciaMinHoras,
      mecanicosAutorizados,
    } = req.body;

    const servico = await Servico.create({
      oficina,
      nome,
      tipo,
      preco,
      duracaoMin,
      descricaoPublica,
      descricaoPrivada,
      vagasPorTurno,
      antecedenciaMinHoras,
      mecanicosAutorizados: mecanicosAutorizados || [],
    });

    res.status(201).json(servico);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao criar serviço", error: e.message });
  }
};

export const atualizarServico = async (req, res) => {
  try {
    const servico = await Servico.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(servico);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao atualizar serviço", error: e.message });
  }
};

export const apagarServico = async (req, res) => {
  try {
    await Servico.findByIdAndDelete(req.params.id);
    res.json({ msg: "Serviço apagado" });
  } catch (e) {
    res.status(500).json({ msg: "Erro ao apagar serviço", error: e.message });
  }
};
