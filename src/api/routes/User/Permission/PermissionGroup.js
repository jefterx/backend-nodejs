import express from "express";
const router = express.Router();

// Importe o controller permissionGroupController
import * as permissionGroupController from "../../../controllers/User/Permission/PermissionGroup.js";
import validateToken from "../../../middlewares/ValidateToken.js";

import permissionRouter from "./Permission.js";

router.post("/", validateToken, permissionGroupController.createPermissionGroup);
router.get("/", validateToken, permissionGroupController.getPermissionGroups);

//Routes Permission
router.use("/permission", permissionRouter);

router.get("/:id", validateToken, permissionGroupController.getPermissionGroup);
router.put("/:id", validateToken, permissionGroupController.updatePermissionGroup);
router.delete("/:id", validateToken, permissionGroupController.deletePermissionGroup);

export default router;
