import Oficina from "../models/Oficina.js";

export const criarOficina = async (req, res) => {
  try {
    const { nome, localizacao, contacto, descricao } = req.body;

    const oficina = await Oficina.create({
      nome,
      localizacao,
      contacto,
      descricao,
    });

    res.status(201).json(oficina);
  } catch (error) {
    console.error("Erro ao criar oficina:", error);
    res.status(500).json({ msg: "Erro ao criar oficina", error: error.message });
  }
};

export const listarOficinas = async (req, res) => {
  try {
    const oficinas = await Oficina.find();
    res.json(oficinas);
  } catch (error) {
    console.error("Erro ao listar oficinas:", error);
    res.status(500).json({ msg: "Erro ao listar oficinas", error: error.message });
  }
};
