import bcript from "bcryptjs";
import Joi from "joi";

import { generateToken, verifyToken } from "../../services/Token.js";
import User from "../models/User/User.js";

// Função para fazer login
export const loginUser = async (req, res) => {
  try {
    // Definir o esquema de validação
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    });

    // Validar os parâmetros de consulta
    const { error, value } = schema.validate(req.body);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (error) {
      return res
        .status(400)
        .json({ message: "Dados de entrada inválidos", error: error.details });
    }

    const { email, password } = value;

    // Verificar se o usuário existe através do e-mail e senha
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Verificar se a senha está correta
    const passwordMatch = await bcript.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const mode = "production";
    const use = "system";

    // Verificar se já existe um token válido para o usuário
    const token = await verifyToken(user.id, mode, use);
    if (!token) {
      // Gerar um token
      const { token, expiresAt } = await generateToken(user, mode, use);

      // Enviar o token e a data de expiração como resposta
      return res.status(200).json({ token, expiresAt, mode });
    }

    // Token válido encontrado
    return res
      .status(200)
      .json({ token: token.token, expiresAt: token.expiresAt, mode });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};
