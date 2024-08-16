import express from "express";
const router = express.Router();

// Importe o controller userController
import * as userController from "../../controllers/User/User.js";
import validateToken from "../../middlewares/ValidateToken.js";

import PermissionGroupRouter from "./Permission/PermissionGroup.js";

// Definição das Rotas
router.post("/", validateToken, userController.createUser);
router.get("/", validateToken, userController.getUsers);

// Routes PermissionGroup
router.use("/permission-group", PermissionGroupRouter);

router.get("/:id", validateToken, userController.getUser);
router.put("/:id", validateToken, userController.updateUser);
router.delete("/:id", validateToken, userController.deleteUser);
router.post("/undelete/:id", validateToken, userController.undeleteUser);

export default router;
