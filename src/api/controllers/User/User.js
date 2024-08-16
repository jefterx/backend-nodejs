import bcript from "bcryptjs";
import Joi from "joi";
import { Op } from "sequelize";

import User from "../../models/User/User.js";

import { createAccount, setAccountDefaultInUser } from "../../helpers/User/Account.js";

// Função para criar um novo usuário
export const createUser = async (req, res) => {
  try {
    // Definir o esquema de validação
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
      role: Joi.string().valid("admin", "staff", "user").required(),
    });

    // Validar os parâmetros de consulta
    const { error, value } = schema.validate(req.body);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (error) {
      return res
        .status(400)
        .json({ message: "Dados de entrada inválidos", error: error.details });
    }

    // Verificar se o e-mail já está cadastrado
    const userExistence = await User.findOne({
      where: { email: value.email },
      paranoid: false, // Verificar usuários deletados
    });
    if (userExistence) {
      return res.status(400).json({ message: "E-mail já cadastrado" });
    }

    // Criptografar a senha
    const password = await bcript.hash("123", 10);

    // Criar um novo usuário
    const user = await User.create({
      name: value.name,
      email: value.email,
      password,
    });

    // Criar uma nova conta para o usuário
    const account = await createAccount(user.id, value.role);

    // Se a conta não for criada, enviar uma resposta com erro
    if (!account) return res.status(500).json({ message: "Erro ao criar conta" });

    // Definir a conta como padrão para o usuário
    await setAccountDefaultInUser(user.id, account.id);

    // Remover dados sensíveis do usuário
    user.password = undefined;
    user.searchable = undefined;
    user.account_default = undefined;
    user.deletedAt = undefined;

    // Enviar o usuário criado como resposta
    return res
      .status(201)
      .json({ message: "Usuário criado com sucesso", user });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para listar todos os usuários
export const getUsers = async (req, res) => {
  try {
    // Definir o esquema de validação
    const schema = Joi.object({
      page: Joi.number().min(1).required(),
      limit: Joi.number().min(1).max(100).required(),
      sortBy: Joi.string().pattern(new RegExp('^-?(name|email|createdAt|updatedAt|deletedAt)$')),
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

    // Query para listar todos os usuários, exceto o usuário atual
    let query = {
      id: {
        [Op.ne]: tokenData.userId, // Excluir o usuário com o ID atual
      },
    };

    // Verificar se existe filtro
    if (value.filter) {
      // Adicionar filtro de pesquisa
      query = {
        ...query,
        searchable: {
          [Op.iLike]: `%${value.filter}%`, // Pesquisar por nome, e-mail ou função
        },
      };
    }

    // Contar o número total de usuários e calcular o número total de páginas
    const totalUsers = await User.count({
      where: query,
      paranoid: false, // Contar usuários deletados
    });

    // Determine order direction and field from sortBy
    const orderDirection = value.sortBy.startsWith('-') ? 'DESC' : 'ASC';
    const orderBy = value.sortBy.startsWith('-') ? value.sortBy.substring(1) : value.sortBy;

    // Listar todos os usuários com paginação e limite, delimitar os campos retornados
    const users = await User.findAll({
      where: query,
      attributes: ["id", "name", "email", "createdAt", "updatedAt", "deletedAt"],
      limit: pageSize,
      offset: offset,
      order: [
        [
          orderBy || "createdAt", // Ordenar por campo
          orderDirection, // Direção da ordem
        ],
      ],
      paranoid: false, // Listar usuários deletados
    });

    // Enviar a lista de usuários como resposta
    return res.status(200).json({ totalResults: totalUsers, data: users });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para obter um usuário
export const getUser = async (req, res) => {
  try {
    // Obter o ID do usuário
    const { id } = req.params;

    // Definir o esquema de validação para id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res
        .status(400)
        .json({ message: "Id do Usuário inválido", error: idError.details });
    }

    // Obter o usuário pelo ID, delimitar os campos retornados
    const user = await User.findByPk(id, {
      attributes: ["id", "name", "email", "createdAt", "updatedAt", "deletedAt"],
      paranoid: false, // Obter usuário deletado
    });

    // Se o usuário não for encontrado, enviar uma resposta com erro
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Enviar o usuário como resposta
    return res.status(200).json(user);
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para atualizar um usuário
export const updateUser = async (req, res) => {
  try {
    // Obter o ID do usuário
    const { id } = req.params;

    // Definir o esquema de validação para id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res
        .status(400)
        .json({ message: "Id do Usuário inválido", error: idError.details });
    }

    // Definir o esquema de validação
    const schema = Joi.object({
      name: Joi.string().min(3),
      email: Joi.string().email(),
      role: Joi.string().valid("admin", "staff", "user"),
    });

    // Validar os parâmetros de consulta
    const { error, value } = schema.validate(req.body);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (error) {
      return res
        .status(400)
        .json({ message: "Dados de entrada inválidos", error: error.details });
    }

    // Obter o usuário pelo ID
    const user = await User.findByPk(id);

    // Se o usuário não for encontrado, enviar uma resposta com erro
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verificar se o e-mail já está cadastrado retirando o próprio usuário
    const userExistence = await User.findOne({
      where: {
        email: value.email,
        id: { [Op.ne]: id },
      },
      paranoid: false, // Verificar usuários deletados
    });
    if (userExistence) {
      return res.status(400).json({ message: "E-mail já cadastrado" });
    }

    // Atualizar o usuário
    await user.update(value);

    // Remove Password from user
    user.password = undefined;

    // Remove searchable from user
    user.searchable = undefined;

    // Enviar o usuário atualizado como resposta
    return res
      .status(200)
      .json({ message: "Usuário atualizado com sucesso!" });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para desativar um usuário
export const deleteUser = async (req, res) => {
  try {
    // Obter o ID do usuário
    const { id } = req.params;

    // Definir o esquema de validação para id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res
        .status(400)
        .json({ message: "Id do Usuário inválido", error: idError.details });
    }

    // Obter o usuário pelo ID
    const user = await User.findByPk(id);

    // Se o usuário não for encontrado, enviar uma resposta com erro
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Excluir o usuário
    await user.destroy();

    // Enviar uma resposta de sucesso
    return res.status(200).json({ message: "Usuário desativado com sucesso!" });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};

// Função para restaurar um usuário
export const undeleteUser = async (req, res) => {
  try {
    // Obter o ID do usuário
    const { id } = req.params;

    // Definir o esquema de validação para id
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o id
    const { error: idError } = idSchema.validate(id);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res
        .status(400)
        .json({ message: "Id do Usuário inválido", error: idError.details });
    }

    // Obter o usuário pelo ID
    const user = await User.findOne({
      where: {
        id: id,
        deletedAt: {
          [Op.ne]: null, // Verificar se deletedAt não é nulo
        },
      },
      paranoid: false, // Incluir usuários deletados
    });

    // Se o usuário não for encontrado, enviar uma resposta com erro
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado"});
    }

    // Restaurar o usuário
    await user.restore();

    // Enviar uma resposta de sucesso
    return res.status(200).json({ message: "Usuário restaurado com sucesso!" });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};