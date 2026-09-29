import { Router } from "express";
import addressController from "../controllers/address.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../validations/address.validation.js";

const router = Router();

// All address routes require authentication
router.use(requireAuth);

router.get("/", addressController.getAddresses);
router.post("/", validate(createAddressSchema), addressController.createAddress);
router.get("/:id", addressController.getAddressById);
router.put("/:id", validate(updateAddressSchema), addressController.updateAddress);
router.patch("/:id", validate(updateAddressSchema), addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);
router.patch("/:id/default", addressController.setDefaultAddress);
router.put("/:id/default", addressController.setDefaultAddress);

export default router;
