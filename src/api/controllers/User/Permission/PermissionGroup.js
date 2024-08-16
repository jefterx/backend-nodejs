import Joi from "joi";
import { Op } from "sequelize";

import PermissionGroup from "../../../models/User/Permission/PermissionGroup.js";

export const createPermissionGroup = async (req, res) => {
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

    // Obter o usuário autenticado do corpo da solicitação
    const tokenData = req.tokenData;

    // Criar um novo grupo de permissões
    const permissionGroup = await PermissionGroup.create({
      ...value,
      userId: tokenData.userId,
    });

    return res.status(201).json({
      message: "Grupo de permissões criado com sucesso!",
      permissionGroup,
    });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const getPermissionGroups = async (req, res) => {
  try {
    // Definir o esquema de validação
    const schema = Joi.object({
      page: Joi.number().min(1).required(),
      limit: Joi.number().min(1).max(100).required(),
      sortBy: Joi.string().pattern(
        new RegExp("^-?(name|description|createdAt|updatedAt)$")
      ),
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

    // Obter o usuário autenticado do corpo da solicitação
    const tokenData = req.tokenData;

    console.log(tokenData);

    // Query para listar todos os grupos de permissões do usuário autenticado
    let query = {
      userId: {
        [Op.eq]: tokenData.userId,
      },
    };

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

    // Obter a quantidade de grupos de permissões do usuário autenticado
    const totalPermissionGroups = await PermissionGroup.count({
      where: query,
    });

    // Determine order direction and field from sortBy
    const orderDirection = value.sortBy.startsWith("-") ? "DESC" : "ASC";
    const orderBy = value.sortBy.startsWith("-")
      ? value.sortBy.substring(1)
      : value.sortBy;

    // Listar todos os grupos de permissão com paginação e limite, delimitar os campos retornados
    const permissionGroups = await PermissionGroup.findAll({
      where: query,
      limit: pageSize,
      offset: offset,
      order: [
        [
          orderBy || "createdAt", // Ordenar por campo
          orderDirection, // Direção da ordem
        ],
      ],
      attributes: ["id", "name", "description", "createdAt", "updatedAt"],
    });

    return res
      .status(200)
      .json({ totalResults: totalPermissionGroups, data: permissionGroups });
  } catch (error) {
    console.log(error);
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const getPermissionGroup = async (req, res) => {
  try {
    // Obter o ID do grupo de permissões da solicitação
    const { id } = req.params;

    // Definir o esquema de validação para id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res.status(400).json({
        message: "Id do Grupo de Permissão inválido",
        error: idError.details,
      });
    }

    // Obter o usuário autenticado do corpo da solicitação
    const tokenData = req.tokenData;

    // Obter o grupo de permissões pelo ID
    const permissionGroup = await PermissionGroup.findOne({
      where: {
        id: id,
        userId: tokenData.userId,
      },
      attributes: ["id", "name", "description", "createdAt", "updatedAt"],
    });

    // Se o grupo de permissões não existir, enviar uma resposta com o erro
    if (!permissionGroup) {
      return res
        .status(404)
        .json({ message: "Grupo de permissões não encontrado" });
    }

    return res.status(200).json(permissionGroup);
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const updatePermissionGroup = async (req, res) => {
  try {
    // Obter o ID do grupo de permissões da solicitação
    const { id } = req.params;

    // Definir o esquema de validação para id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res.status(400).json({
        message: "Id do Grupo de Permissão inválido",
        error: idError.details,
      });
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

    // Obter o usuário autenticado do corpo da solicitação
    const tokenData = req.tokenData;

    // Atualizar o grupo de permissões
    const permissionGroup = await PermissionGroup.update(
      { ...value },
      {
        where: {
          id: id,
          userId: tokenData.userId,
        },
      }
    );

    // Se o grupo de permissões não for encontrado, enviar uma resposta com o erro
    if (!permissionGroup) {
      return res
        .status(404)
        .json({ message: "Grupo de permissões não encontrado" });
    }

    return res
      .status(200)
      .json({ message: "Grupo de permissões atualizado com sucesso!" });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

export const deletePermissionGroup = async (req, res) => {
  try {
    // Obter o ID do grupo de permissões da solicitação
    const { id } = req.params;

    // Definir o esquema de validação para id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res.status(400).json({
        message: "Id do Grupo de Permissão inválido",
        error: idError.details,
      });
    }

    // Obter o usuário autenticado do corpo da solicitação
    const tokenData = req.tokenData;

    // Excluir o grupo de permissões
    const permissionGroup = await PermissionGroup.destroy({
      where: {
        id: id,
        userId: tokenData.userId,
      },
    });

    // Se o grupo de permissões não for encontrado, enviar uma resposta com o erro
    if (!permissionGroup) {
      return res
        .status(404)
        .json({ message: "Grupo de permissões não encontrado" });
    }

    return res
      .status(200)
      .json({ message: "Grupo de permissões excluído com sucesso!" });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};
