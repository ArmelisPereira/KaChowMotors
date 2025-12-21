import Marcacao from "../models/Marcacao.js";
import Turno from "../models/Turno.js";
import Servico from "../models/Servico.js";
import Veiculo from "../models/Veiculo.js";

const parseDateTime = (dateStr, timeStr) => {
  // formatação: "YYYY-MM-DD" timeStr "HH:mm"
  return new Date(`${dateStr}T${timeStr}:00`);
};

export const criarMarcacao = async (req, res) => {
  try {
    const { oficina, veiculo, servico, turno, data, hora } = req.body;

    const v = await Veiculo.findOne({ _id: veiculo, cliente: req.user.userId });
    if (!v) return res.status(403).json({ msg: "Veículo inválido" });

    const s = await Servico.findById(servico);
    if (!s) return res.status(404).json({ msg: "Serviço não encontrado" });

    const t = await Turno.findById(turno);
    if (!t) return res.status(404).json({ msg: "Turno não encontrado" });

    const now = new Date();
    const inicio = parseDateTime(data, hora);
    const diffHoras = (inicio.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHoras < (s.antecedenciaMinHoras || 0)) {
      return res.status(400).json({ msg: `Tens de marcar com pelo menos ${s.antecedenciaMinHoras}h de antecedência` });
    }

    const marcacoesAtivas = await Marcacao.countDocuments({
      turno,
      servico,
      estado: { $ne: "CANCELADA" }
    });

    const limite = Math.min(s.vagasPorTurno, t.vagasTotal);
    if (marcacoesAtivas >= limite) {
      return res.status(400).json({ msg: "Sem vagas disponíveis para este turno" });
    }

    const m = await Marcacao.create({
      oficina,
      cliente: req.user.userId,
      veiculo,
      servico,
      turno,
      data,
      hora,
      estado: "AGENDADA",
    });

    res.status(201).json(m);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao criar marcação", error: e.message });
  }
};

export const listarMinhasMarcacoes = async (req, res) => {
  try {
    const ms = await Marcacao.find({ cliente: req.user.userId })
      .populate("oficina", "nome localizacao")
      .populate("servico", "nome tipo preco duracaoMin")
      .populate("veiculo", "marca modelo matricula")
      .sort({ createdAt: -1 });

    res.json(ms);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao listar marcações", error: e.message });
  }
};

export const cancelarMarcacao = async (req, res) => {
  try {
    // verificar. só cancela se ainda estiver AGENDADA
    const m = await Marcacao.findOne({ _id: req.params.id, cliente: req.user.userId });
    if (!m) return res.status(404).json({ msg: "Marcação não encontrada" });
    if (m.estado !== "AGENDADA") return res.status(400).json({ msg: "Não é possível cancelar neste estado" });

    m.estado = "CANCELADA";
    await m.save();

    res.json({ msg: "Marcação cancelada", marcacao: m });
  } catch (e) {
    res.status(500).json({ msg: "Erro ao cancelar marcação", error: e.message });
  }
};

export const listarMarcacoesOficina = async (req, res) => {
  try {
    const { oficinaId } = req.params;
    const { data } = req.query;

    const q = { oficina: oficinaId };
    if (data) q.data = data;

    // para cada mecânico vê só as dele
    if (req.user.role === "mecanico") q.mecanico = req.user.userId;

    const ms = await Marcacao.find(q)
      .populate("cliente", "name email")
      .populate("servico", "nome tipo")
      .populate("veiculo", "marca modelo matricula")
      .sort({ data: 1, hora: 1 });

    res.json(ms);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao listar marcações da oficina", error: e.message });
  }
};

export const atualizarEstadoMarcacao = async (req, res) => {
  try {
    const { estado } = req.body; // em curso, concukuido
    const m = await Marcacao.findById(req.params.id);
    if (!m) return res.status(404).json({ msg: "Marcação não encontrada" });

    m.estado = estado;
    await m.save();

    res.json(m);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao atualizar estado", error: e.message });
  }
};
