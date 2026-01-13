import Marcacao from "../models/Marcacao.js";
import Turno from "../models/Turno.js";
import Servico from "../models/Servico.js";
import Veiculo from "../models/Veiculo.js";

const parseDateTime = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}:00`);

const timeToMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const addMinutes = (dateObj, minutes) => new Date(dateObj.getTime() + minutes * 60 * 1000);

const getCancelMinHours = () => {
  const v = Number(process.env.CANCEL_MIN_HOURS);
  return Number.isFinite(v) ? v : 3;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

/**
 * Verifica se um mecânico tem conflito de horários (sobreposição) com outra marcação
 * (AGENDADA ou EM_CURSO) no mesmo dia.
 */
const hasMechanicConflict = async ({ mecanicoId, data, newStart, newEnd, ignoreMarcacaoId = null }) => {
  const q = {
    mecanico: mecanicoId,
    data,
    estado: { $in: ["AGENDADA", "EM_CURSO"] },
  };

  if (ignoreMarcacaoId) q._id = { $ne: ignoreMarcacaoId };

  const existing = await Marcacao.find(q).populate("servico", "duracaoMin").lean();

  for (const m of existing) {
    const sMin = m?.servico?.duracaoMin || 0;
    const exStart = parseDateTime(m.data, m.hora);
    const exEnd = addMinutes(exStart, sMin);

    if (overlaps(newStart, newEnd, exStart, exEnd)) return true;
  }
  return false;
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

    if (Number.isNaN(inicio.getTime())) return res.status(400).json({ msg: "Data/hora inválidas" });
    if (inicio.getTime() <= now.getTime()) return res.status(400).json({ msg: "Não é possível marcar no passado" });

    // Hora dentro do turno
    const horaMin = timeToMinutes(hora);
    const iniMin = timeToMinutes(t.horaInicio);
    const fimMin = timeToMinutes(t.horaFim);
    if (horaMin < iniMin || horaMin >= fimMin) {
      return res.status(400).json({ msg: "Hora fora do intervalo do turno" });
    }

    // Antecedência mínima do serviço
    const minHoras = s.antecedenciaMinHoras || 0;
    const diffHoras = (inicio.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHoras < minHoras) {
      return res.status(400).json({ msg: `Tens de marcar com pelo menos ${minHoras}h de antecedência` });
    }

    // Vagas: conta marcações ativas para aquele turno+serviço
    const marcacoesAtivas = await Marcacao.countDocuments({
      turno,
      servico,
      estado: { $ne: "CANCELADA" },
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
    if (Number.isNaN(inicio.getTime())) return res.status(400).json({ msg: "Data/hora inválidas" });

    const cancelMinHours = getCancelMinHours();
    const diffHoras = (inicio.getTime() - Date.now()) / (1000 * 60 * 60);

    if (diffHoras < cancelMinHours) {
      return res.status(400).json({ msg: `Só podes cancelar até ${cancelMinHours}h antes do início` });
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
    const { data, estado } = req.query;

    const q = { oficina: oficinaId };
    if (data) q.data = data;
    if (estado) q.estado = estado;

    // mecânico vê só as dele
    if (req.user.role === "mecanico") q.mecanico = req.user.userId;

    const ms = await Marcacao.find(q)
      .populate("cliente", "name email")
      .populate("servico", "nome tipo duracaoMin")
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
    if (!allowed.includes(estado)) return res.status(400).json({ msg: "Estado inválido" });

    const m = await Marcacao.findById(req.params.id).populate("servico", "duracaoMin");
    if (!m) return res.status(404).json({ msg: "Marcação não encontrada" });

    // Se for mecânico: auto-atribui-se e valida conflito
    if (req.user.role === "mecanico") {
      if (m.mecanico && String(m.mecanico) !== String(req.user.userId)) {
        return res.status(403).json({ msg: "Não tens permissão para alterar esta marcação" });
      }

      if (!m.mecanico) {
        // antes de assumir, verifica conflito
        const dur = m?.servico?.duracaoMin || 0;
        const start = parseDateTime(m.data, m.hora);
        const end = addMinutes(start, dur);

        const conflict = await hasMechanicConflict({
          mecanicoId: req.user.userId,
          data: m.data,
          newStart: start,
          newEnd: end,
          ignoreMarcacaoId: m._id,
        });

        if (conflict) {
          return res.status(400).json({ msg: "Conflito: já tens outra marcação sobreposta nesse horário" });
        }

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

/**
 * Reagendar (cliente) — muda turno/data/hora, mantendo o serviço e veículo.
 */
export const reagendarMarcacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { turno, data, hora } = req.body;

    if (!turno || !data || !hora) {
      return res.status(400).json({ msg: "Campos obrigatórios em falta (turno, data, hora)" });
    }

    const m = await Marcacao.findOne({ _id: id, cliente: req.user.userId }).populate("servico", "duracaoMin antecedenciaMinHoras vagasPorTurno oficina");
    if (!m) return res.status(404).json({ msg: "Marcação não encontrada" });
    if (m.estado !== "AGENDADA") return res.status(400).json({ msg: "Só podes reagendar uma marcação AGENDADA" });

    const cancelMinHours = getCancelMinHours();
    const inicioAtual = parseDateTime(m.data, m.hora);
    const diffHorasAtual = (inicioAtual.getTime() - Date.now()) / (1000 * 60 * 60);
    if (diffHorasAtual < cancelMinHours) {
      return res.status(400).json({ msg: `Só podes reagendar até ${cancelMinHours}h antes do início` });
    }

    const t = await Turno.findById(turno);
    if (!t) return res.status(404).json({ msg: "Turno não encontrado" });

    // valida serviço x turno
    if (t.servico && String(t.servico) !== String(m.servico._id)) {
      return res.status(400).json({ msg: "Este turno não é compatível com o serviço" });
    }

    if (t.data !== data) return res.status(400).json({ msg: "Data inválida para o turno selecionado" });
    if (String(t.oficina) !== String(m.servico.oficina)) {
      return res.status(400).json({ msg: "Turno não pertence à oficina do serviço" });
    }

    // hora dentro do turno
    const horaMin = timeToMinutes(hora);
    const iniMin = timeToMinutes(t.horaInicio);
    const fimMin = timeToMinutes(t.horaFim);
    if (horaMin < iniMin || horaMin >= fimMin) {
      return res.status(400).json({ msg: "Hora fora do intervalo do turno" });
    }

    // antecedência
    const now = new Date();
    const inicioNovo = parseDateTime(data, hora);
    if (Number.isNaN(inicioNovo.getTime())) return res.status(400).json({ msg: "Data/hora inválidas" });
    if (inicioNovo.getTime() <= now.getTime()) return res.status(400).json({ msg: "Não é possível reagendar para o passado" });

    const minHoras = m.servico.antecedenciaMinHoras || 0;
    const diffHorasNovo = (inicioNovo.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHorasNovo < minHoras) {
      return res.status(400).json({ msg: `Tens de reagendar com pelo menos ${minHoras}h de antecedência` });
    }

    // vagas (excluindo esta marcação)
    const marcacoesAtivas = await Marcacao.countDocuments({
      _id: { $ne: m._id },
      turno,
      servico: m.servico._id,
      estado: { $ne: "CANCELADA" },
    });

    const limite = Math.min(m.servico.vagasPorTurno, t.vagasTotal);
    if (marcacoesAtivas >= limite) {
      return res.status(400).json({ msg: "Sem vagas disponíveis para este turno" });
    }

    // conflito do mecânico (se já houver mecânico atribuído)
    if (m.mecanico) {
      const dur = m.servico.duracaoMin || 0;
      const endNovo = addMinutes(inicioNovo, dur);

      const conflict = await hasMechanicConflict({
        mecanicoId: m.mecanico,
        data,
        newStart: inicioNovo,
        newEnd: endNovo,
        ignoreMarcacaoId: m._id,
      });

      if (conflict) {
        return res.status(400).json({ msg: "Conflito: o mecânico atribuído já tem outra marcação sobreposta nesse horário" });
      }
    }

   
    m.turno = turno;
    m.data = data;
    m.hora = hora;
    await m.save();

    res.json({ msg: "Marcação reagendada", marcacao: m });
  } catch (e) {
    res.status(500).json({ msg: "Erro ao reagendar", error: e.message });
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

    if (!marcacao) return res.status(404).json({ msg: "Marcação não encontrada" });

    res.json(marcacao);
  } catch (e) {
    res.status(500).json({ msg: "Erro ao carregar marcação", error: e.message });
  }
};
