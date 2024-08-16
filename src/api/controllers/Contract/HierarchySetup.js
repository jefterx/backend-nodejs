import Joi from "joi";
import { Op } from "sequelize";

import Contract from "../../models/Contract/Contract.js";
import HierarchySetup from "../../models/Contract/HierarchySetup.js";

// Função para criar uma nova configuração de hierarquia
export const createHierarchySetup = async (req, res) => {
  try {
    // Obter o ID do contrato
    const { contractId } = req.params;

    // Definir o esquema de validação para contractId
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o contractId
    const { error: idError } = idSchema.validate(contractId);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res
        .status(400)
        .json({ message: "Id do Contrato inválido", error: idError.details });
    }

    // Definir o esquema de validação
    const schema = Joi.object({
      level: Joi.number().min(0).required(),
      name: Joi.string().min(3).required(),
      description: Joi.string().min(3).required(),
    });

    // Validar os parâmetros de consulta
    const { error, value } = schema.validate(req.body);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (error) {
      return res
        .status(400)
        .json({ message: "Dados de entrada inválidos", error: error.details });
    }

    // Obter o contrato pelo contractId, delimitar os campos retornados
    const contract = await Contract.findByPk(contractId, {
      attributes: ["id"],
      paranoid: false,
    });

    // Se o contrato não for encontrado, enviar uma resposta com erro
    if (!contract) {
      return res.status(404).json({ message: "Contrato não encontrado" });
    }

    // Validar level para garantir que não exista um nó com o mesmo level
    const levelExists = await HierarchySetup.findOne({
      where: { contractId, level: value.level },
    });

    // Se o nó com o mesmo level já existir, enviar uma resposta com erro
    if (levelExists) {
      return res
        .status(400)
        .json({ message: "Nó com o mesmo nível já existe" });
    }

    // Validar name da hierarquia para garantir que não exista um nó com o mesmo name
    const nameExists = await HierarchySetup.findOne({
      where: { contractId, name: value.name },
    });

    // Se o nó com o mesmo name já existir, enviar uma resposta com erro
    if (nameExists) {
      return res.status(400).json({ message: "Nó com o mesmo nome já existe" });
    }

    // Criar uma nova configuração de hierarquia
    const hierarchySetup = await HierarchySetup.create({
      ...value,
      contractId,
    });

    // Tranformar level em float
    hierarchySetup.level = parseFloat(hierarchySetup.level);

    return res.status(201).json({
      message: "Configuração de Hierarquia definida com sucesso",
      hierarchySetup,
    });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para obter todas as configurações de hierarquia
export const getHierarchySetups = async (req, res) => {
  try {
    // Obter o ID do contrato
    const { contractId } = req.params;

    // Definir o esquema de validação para contractId
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o contractId
    const { error: idError } = idSchema.validate(contractId);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res
        .status(400)
        .json({ message: "Id do Contrato inválido", error: idError.details });
    }

    // Obter o contrato pelo contractId, delimitar os campos retornados
    const contract = await Contract.findByPk(contractId, {
      attributes: ["id"],
      paranoid: false,
    });

    // Se o contrato não for encontrado, enviar uma resposta com erro
    if (!contract) {
      return res.status(404).json({ message: "Contrato não encontrado" });
    }

    // Obter quantidade de configurações de hierarquia
    const hierarchySetupsCount = await HierarchySetup.count({
      where: { contractId },
    });

    // Obter todas as configurações de hierarquia pelo contractId
    const hierarchySetups = await HierarchySetup.findAll({
      attributes: { exclude: ["contractId"] },
      where: { contractId },
      order: [["level", "ASC"]],
    });

    // Converter o valor de 'level' para float em cada hierarquia
    const hierarchySetupsWithFloatLevel = hierarchySetups.map(
      (hierarchySetup) => ({
        ...hierarchySetup.get(),
        level: parseFloat(hierarchySetup.level),
      })
    );

    return res.status(200).json({
      totalResults: hierarchySetupsCount,
      data: hierarchySetupsWithFloatLevel,
    });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para atualizar uma configuração de hierarquia
export const updateHierarchySetup = async (req, res) => {
  try {
    // Obter o ID do contrato e o ID da configuração de hierarquia
    const { contractId, id } = req.params;

    // Definir o esquema de validação para contractId e id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o contractId
    const { error: contractIdError } = idSchema.validate(contractId);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (contractIdError) {
      return res.status(400).json({
        message: "Id do Contrato inválido",
        error: contractIdError.details,
      });
    }

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res.status(400).json({
        message: "Id da Configuração de Hierarquia inválido",
        error: idError.details,
      });
    }

    // Definir o esquema de validação
    const schema = Joi.object({
      level: Joi.number().min(0),
      name: Joi.string().min(3),
      description: Joi.string(),
    });

    // Validar os parâmetros de consulta
    const { error, value } = schema.validate(req.body);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (error) {
      return res
        .status(400)
        .json({ message: "Dados de entrada inválidos", error: error.details });
    }

    // Obter a configuração de hierarquia pelo id e contractId, delimitar os campos retornados
    const hierarchySetup = await HierarchySetup.findOne({
      where: { id, contractId },
      attributes: ["id", "level", "name", "description"],
    });

    // Se a configuração de hierarquia não for encontrada, enviar uma resposta com erro
    if (!hierarchySetup) {
      return res
        .status(404)
        .json({ message: "Configuração de Hierarquia não encontrada" });
    }

    // Verificar se o level foi alterado
    if (value.level) {
      // Validar level para garantir que não exista um nó com o mesmo level
      const levelExists = await HierarchySetup.findOne({
        where: { contractId, level: value.level, id: { [Op.ne]: id } },
      });

      // Se o nó com o mesmo level já existir, enviar uma resposta com erro
      if (levelExists) {
        return res
          .status(400)
          .json({ message: "Nó com o mesmo nível já existe" });
      }
    }

    // Verificar se o name foi alterado
    if (value.name) {
      // Validar name da hierarquia para garantir que não exista um nó com o mesmo name
      const nameExists = await HierarchySetup.findOne({
        where: { contractId, name: value.name, id: { [Op.ne]: id } },
      });

      // Se o nó com o mesmo name já existir, enviar uma resposta com erro
      if (nameExists) {
        return res
          .status(400)
          .json({ message: "Nó com o mesmo nome já existe" });
      }
    }

    // Atualizar a configuração de hierarquia
    await hierarchySetup.update(value);

    // Tranformar level em float
    hierarchySetup.level = parseFloat(hierarchySetup.level);

    return res.status(200).json({
      message: "Configuração de Hierarquia atualizada com sucesso",
    });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para deletar uma configuração de hierarquia
export const deleteHierarchySetup = async (req, res) => {
  try {
    // Obter o ID do contrato e o ID da configuração de hierarquia
    const { contractId, id } = req.params;

    // Definir o esquema de validação para contractId e id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o contractId
    const { error: contractIdError } = idSchema.validate(contractId);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (contractIdError) {
      return res.status(400).json({
        message: "Id do Contrato inválido",
        error: contractIdError.details,
      });
    }

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res.status(400).json({
        message: "Id da Configuração de Hierarquia inválido",
        error: idError.details,
      });
    }

    // Obter a configuração de hierarquia pelo id e contractId, delimitar os campos retornados
    const hierarchySetup = await HierarchySetup.findOne({
      where: { id, contractId },
      attributes: ["id"],
    });

    // Se a configuração de hierarquia não for encontrada, enviar uma resposta com erro
    if (!hierarchySetup) {
      return res
        .status(404)
        .json({ message: "Configuração de Hierarquia não encontrada" });
    }

    // Deletar a configuração de hierarquia
    await hierarchySetup.destroy({ force: true });

    return res.status(200).json({
      message: "Configuração de Hierarquia deletada com sucesso",
    });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};
