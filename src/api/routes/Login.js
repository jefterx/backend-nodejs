import express from "express";
const router = express.Router();

// Importe o controller loginController
import * as loginController from "../controllers/Login.js";

// Definição das Rotas
router.post("/login/authenticate", loginController.loginUser);

export default router;
