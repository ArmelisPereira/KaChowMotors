import Marcacao from "../models/Marcacao.js";
import Turno from "../models/Turno.js";
import Servico from "../models/Servico.js";
import Veiculo from "../models/Veiculo.js";

const parseDateTime = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}:00`);

const timeToMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const criarMarcacao = async (req, res) => {
  try {
    const { veiculo, servico, turno, data, hora } = req.body;

    if (!veiculo || !servico || !turno || !data || !hora) {
      return res.status(400).json({ msg: "Campos obrigatórios em falta" });
    }

    const v = await Veiculo.findOne({ _id: veiculo, cliente: req.user.userId });
    if (!v) return res.status(403).json({ msg: "Veículo inválido" });

    const s = await Servico.findById(servico);
    if (!s) return res.status(404).json({ msg: "Serviço não encontrado" });

    const t = await Turno.findById(turno);
    if (!t) return res.status(404).json({ msg: "Turno não encontrado" });

    if (t.servico && String(t.servico) !== String(servico)) {
      return res.status(400).json({ msg: "Este turno não é compatível com o serviço selecionado" });
    }

    if (t.data !== data) {
      return res.status(400).json({ msg: "Data inválida para o turno selecionado" });
    }

    if (String(s.oficina) !== String(t.oficina)) {
      return res.status(400).json({ msg: "Inconsistência entre oficina do serviço e do turno" });
    }

    const now = new Date();
    const inicio = parseDateTime(data, hora);

    if (Number.isNaN(inicio.getTime())) {
      return res.status(400).json({ msg: "Data/hora inválidas" });
    }

    if (inicio.getTime() <= now.getTime()) {
      return res.status(400).json({ msg: "Não é possível marcar no passado" });
    }

    const horaMin = timeToMinutes(hora);
    const iniMin = timeToMinutes(t.horaInicio);
    const fimMin = timeToMinutes(t.horaFim);

    if (horaMin < iniMin || horaMin >= fimMin) {
      return res.status(400).json({ msg: "Hora fora do intervalo do turno" });
    }

    const minHoras = s.antecedenciaMinHoras || 0;
    const diffHoras = (inicio.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHoras < minHoras) {
      return res.status(400).json({ msg: `Tens de marcar com pelo menos ${minHoras}h de antecedência` });
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
      oficina: s.oficina,
      cliente: req.user.userId,
      veiculo,
      servico,
      turno,
      data,
      hora,
      estado: "AGENDADA"
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
      .populate("turno", "data horaInicio horaFim vagasTotal")
      .populate("mecanico", "name email")
      .sort({ createdAt: -1 });

    res.json(ms);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao listar marcações", error: e.message });
  }
};

export const cancelarMarcacao = async (req, res) => {
  try {
    const m = await Marcacao.findOne({ _id: req.params.id, cliente: req.user.userId });
    if (!m) return res.status(404).json({ msg: "Marcação não encontrada" });
    if (m.estado !== "AGENDADA") return res.status(400).json({ msg: "Não é possível cancelar neste estado" });

    const inicio = parseDateTime(m.data, m.hora);
    if (!Number.isNaN(inicio.getTime()) && inicio.getTime() <= Date.now()) {
      return res.status(400).json({ msg: "Não é possível cancelar uma marcação já iniciada/passada" });
    }

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

    if (req.user.role === "mecanico") q.mecanico = req.user.userId;

    const ms = await Marcacao.find(q)
      .populate("cliente", "name email")
      .populate("servico", "nome tipo")
      .populate("veiculo", "marca modelo matricula")
      .populate("turno", "data horaInicio horaFim")
      .populate("mecanico", "name email")
      .sort({ data: 1, hora: 1 });

    res.json(ms);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao listar marcações da oficina", error: e.message });
  }
};

export const atualizarEstadoMarcacao = async (req, res) => {
  try {
    const { estado } = req.body;

    const allowed = ["AGENDADA", "EM_CURSO", "CONCLUIDA", "CANCELADA"];
    if (!allowed.includes(estado)) {
      return res.status(400).json({ msg: "Estado inválido" });
    }

    const m = await Marcacao.findById(req.params.id);
    if (!m) return res.status(404).json({ msg: "Marcação não encontrada" });

    if (req.user.role === "mecanico") {
      if (m.mecanico && String(m.mecanico) !== String(req.user.userId)) {
        return res.status(403).json({ msg: "Não tens permissão para alterar esta marcação" });
      }
      if (!m.mecanico) {
        m.mecanico = req.user.userId;
      }
    }

    m.estado = estado;
    await m.save();

    res.json(m);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao atualizar estado", error: e.message });
  }
};


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
