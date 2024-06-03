import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import authToken from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  getAllUsers,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(authToken, logoutUser);
router.route("/me").get(authToken, getCurrentUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/all-users").get(authToken, getAllUsers);

export default router;
