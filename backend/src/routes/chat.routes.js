import { Router } from "express";
import authToken from "../middlewares/auth.middleware.js";
import {
  accessChat,
  getAllChats,
  createGroup,
  renameGroup,
  addUserToGroup,
  removerFromGroup,
} from "../controllers/chat.controller.js";

const router = Router();

router.route("/access").post(authToken, accessChat);
router.route("/all-chats").get(authToken, getAllChats);
router.route("/create-group").post(authToken, createGroup);
router.route("/rename-group").put(authToken, renameGroup);
router.route("/add-user").put(authToken, addUserToGroup);
router.route("/remove-user").put(authToken, removerFromGroup);

export default router;
