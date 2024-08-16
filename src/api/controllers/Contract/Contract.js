import Joi from 'joi';
import { Op } from 'sequelize';

import Contract from '../../models/Contract/Contract.js';

// Função para criar um novo contrato
export const createContract = async (req, res) => {
  try {
    // Definir o esquema de validação
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
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

    // Criar um novo contrato
    const contract = await Contract.create({
      name: value.name,
      description: value.description,
    });

    // Remove searchable from contract
    contract.searchable = undefined;

    return res
      .status(201)
      .json({ message: "Contrato criado com sucesso", contract });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para listar todos os contratos
export const getContracts = async (req, res) => {
  try {
    // Definir o esquema de validação
    const schema = Joi.object({
      page: Joi.number().min(1).required(),
      limit: Joi.number().min(1).max(100).required(),
      sortBy: Joi.string().pattern(new RegExp('^-?(name|description|createdAt|updatedAt|deletedAt)$')),
      filter: Joi.string(),
    });

    // Validar os parâmetros de consulta
    const { error, value } = schema.validate(req.query);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (error) {
      return res
        .status(400)
        .json({ message: "Dados de entrada inválidos", error: error.details });
    }

    // Definir o tamanho da página e o deslocamento
    const pageSize = value.limit;
    const offset = (value.page - 1) * pageSize;

    const tokenData = req.tokenData;

    // Query para listar todos os contratos
    let query = {};

    // Verificar se existe filtro
    if (value.filter) {
      // Adicionar filtro de pesquisa
      query = {
        ...query,
        searchable: {
          [Op.iLike]: `%${value.filter}%`, 
        },
      };
    }

    // Contar o número total de contratos e calcular o número total de páginas
    const totalContracts = await Contract.count({
      where: query,
      paranoid: false,
    });

    // Determine order direction and field from sortBy
    const orderDirection = value.sortBy.startsWith('-') ? 'DESC' : 'ASC';
    const orderBy = value.sortBy.startsWith('-') ? value.sortBy.substring(1) : value.sortBy;

    // Listar todos os contratos com paginação e limite, delimitar os campos retornados
    const contracts = await Contract.findAll({
      where: query,
      attributes: ["id", "name", "description", "createdAt", "updatedAt", "deletedAt"],
      limit: pageSize,
      offset: offset,
      order: [
        [
          orderBy || "createdAt", // Ordenar por campo
          orderDirection, // Direção da ordem
        ],
      ],
      paranoid: false, 
    });

    // Enviar a lista de contratos como resposta
    return res.status(200).json({ totalResults: totalContracts, data: contracts });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para obter um contrato por ID
export const getContract = async (req, res) => {
  try {
    // Obter o ID do contrato
    const { id } = req.params;

    // Definir o esquema de validação para id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res
        .status(400)
        .json({ message: "Id do Contrato inválido", error: idError.details });
    }

    // Obter o contrato pelo ID, delimitar os campos retornados
    const contract = await Contract.findByPk(id, {
      attributes: ["id", "name", "description", "createdAt", "updatedAt", "deletedAt"],
      paranoid: false, 
    });

    // Se o contrato não for encontrado, enviar uma resposta com erro
    if (!contract) {
      return res.status(404).json({ message: "Contrato não encontrado" });
    }

    // Enviar o contrato como resposta
    return res.status(200).json(contract);
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para atualizar um contrato
export const updateContract = async (req, res) => {
  try {
    // Obter o ID do contrato
    const { id } = req.params;

    // Definir o esquema de validação para id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res
        .status(400)
        .json({ message: "Id do Contrato inválido", error: idError.details });
    }

    // Definir o esquema de validação
    const schema = Joi.object({
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

    // Obter o contrato pelo ID
    const contract = await Contract.findByPk(id);

    // Se o contrato não for encontrado, enviar uma resposta com erro
    if (!contract) {
      return res.status(404).json({ message: "Contrato não encontrado" });
    }

    // Atualizar o contrato com os novos dados
    await contract.update(value);

    // Remove searchable from contract
    contract.searchable = undefined;

    // Enviar uma resposta de sucesso
    return res.status(200).json({ message: "Contrato atualizado com sucesso!" });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para desativar um contrato
export const deleteContract = async (req, res) => {
  try {
    // Obter o ID do contrato
    const { id } = req.params;

    // Definir o esquema de validação para id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res
        .status(400)
        .json({ message: "Id do Contrato inválido", error: idError.details });
    }

    // Obter o contrato pelo ID
    const contract = await Contract.findByPk(id);

    // Se o contrato não for encontrado, enviar uma resposta com erro
    if (!contract) {
      return res.status(404).json({ message: "Contrato não encontrado" });
    }

    // Desativar o contrato
    await contract.destroy();

    // Enviar uma resposta de sucesso
    return res.status(200).json({ message: "Contrato desativado com sucesso!" });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para reativar um contrato
export const undeleteContract = async (req, res) => {
  try {
    // Obter o ID do contrato
    const { id } = req.params;

    // Definir o esquema de validação para id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res
        .status(400)
        .json({ message: "Id do Contrato inválido", error: idError.details });
    }

    // Obter o contrato pelo ID
    const contract = await Contract.findByPk(id, { paranoid: false });

    // Se o contrato não for encontrado, enviar uma resposta com erro
    if (!contract) {
      return res.status(404).json({ message: "Contrato não encontrado" });
    }

    // Reativar o contrato
    await contract.restore();

    // Enviar uma resposta de sucesso
    return res.status(200).json({ message: "Contrato reativado com sucesso!" });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};