import { Router } from "express";
import authToken from "../middlewares/auth.middleware.js";
import {
  getAllMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = Router();

router.route("/:chatId").get(authToken, getAllMessages);
router.route("/send-message").post(authToken, sendMessage);

export default router;
