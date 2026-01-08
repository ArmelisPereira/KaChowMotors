import Turno from "../models/Turno.js";

export const listarTurnosPorOficina = async (req, res) => {
  try {
    const { oficinaId } = req.params;
    const { data, servicoId } = req.query;

    const query = { oficina: oficinaId };
    if (data) query.data = data;

    if (servicoId) {
      query.$or = [{ servico: servicoId }, { servico: null }];
    }

    const turnos = await Turno.find(query).sort({ data: 1, horaInicio: 1 });
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ msg: "Erro ao listar turnos", error: error.message });
  }
};


export const criarTurno = async (req, res) => {
  try {
    const { oficina, servico, data, horaInicio, horaFim, vagasTotal } = req.body;

    if (!oficina || !data || !horaInicio || !horaFim || !vagasTotal) {
      return res.status(400).json({ msg: "Campos obrigatórios em falta" });
    }

    const turno = await Turno.create({
      oficina,
      servico: servico || null,
      data,
      horaInicio,
      horaFim,
      vagasTotal
    });

    res.status(201).json(turno);
  } catch (error) {
    res.status(500).json({ msg: "Erro ao criar turno", error: error.message });
  }
};

export const apagarTurno = async (req, res) => {
  try {
    const turno = await Turno.findByIdAndDelete(req.params.id);
    if (!turno) return res.status(404).json({ msg: "Turno não encontrado" });
    res.json({ msg: "Turno apagado" });
  } catch (error) {
    res.status(500).json({ msg: "Erro ao apagar turno", error: error.message });
  }
};
