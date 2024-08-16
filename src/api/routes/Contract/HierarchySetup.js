import express from "express";
const router = express.Router();

// Importe o controller hierarchySetupController
import * as hierarchySetupController from "../../controllers/Contract/HierarchySetup.js";
import validateToken from "../../middlewares/ValidateToken.js";

// Definição das Rotas
router.post("/:contractId", validateToken, hierarchySetupController.createHierarchySetup);
router.get("/:contractId", validateToken, hierarchySetupController.getHierarchySetups);
router.put("/:contractId/:id", validateToken, hierarchySetupController.updateHierarchySetup);
router.delete("/:contractId/:id", validateToken, hierarchySetupController.deleteHierarchySetup);

export default router;
