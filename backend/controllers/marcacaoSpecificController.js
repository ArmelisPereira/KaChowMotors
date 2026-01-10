import Marcacao from "../models/Marcacao.js";

export const listarMarcacaoPorId = async (req, res) => {
  try {
    const { marcacaoId } = req.params;

    const marcacao = await Marcacao.findById(marcacaoId)
      .populate("cliente", "name email")
      .populate("servico", "nome tipo preco duracaoMin")
      .populate("veiculo", "marca modelo matricula")
      .populate("turno", "data horaInicio horaFim")
      .populate("mecanico", "name email");

    if (!marcacao) {
      return res.status(404).json({ msg: "Marcação não encontrada" });
    }

    res.json(marcacao);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao carregar marcação", error: e.message });
  }
};

export const alterarEstadoMarcacao = async (req, res) => {
  try {
    const { marcacaoId } = req.params;
    const { estado } = req.body;

    const allowedStates = ["AGENDADA", "EM_CURSO", "CONCLUÍDA", "CANCELADA"];

    if (!allowedStates.includes(estado)) {
      return res.status(400).json({ msg: "Estado inválido" });
    }

    const marcacao = await Marcacao.findById(marcacaoId);
    if (!marcacao) {
      return res.status(404).json({ msg: "Marcação não encontrada" });
    }

    // Verifique se o mecânico tem permissão para alterar o estado da marcação
    if (req.user.role === "mecanico" && marcacao.mecanico && String(marcacao.mecanico) !== String(req.user._id)) {
      return res.status(403).json({ msg: "Não tem permissão para alterar esta marcação" });
    }

    marcacao.estado = estado;

    await marcacao.save();

    res.json(marcacao);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao alterar estado da marcação", error: e.message });
  }
};
