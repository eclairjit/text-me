import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";

// get all messages of a chat

const getAllMessages = asyncHandler(async (req, res) => {
  const chatId = req.params.chatId;

  if (!chatId) {
    throw new apiError(400, "Chat ID is required");
  }

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "username email avatar")
    .populate("chat");

  if (!messages) {
    throw new apiError(404, "No messages found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, messages, "Messages fetched successfully."));
});

// send message

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;

  if (!chatId || !content) {
    throw new apiError(400, "Chat ID and content is required");
  }

  const newMessage = await Message.create({
    sender: req.user._id,
    chat: chatId,
    content,
  });

  if (!newMessage) {
    throw new apiError(500, "Failed to create message");
  }

  await Chat.findByIdAndUpdate(chatId, {
    $set: {
      latestMessage: newMessage._id,
    },
  });

  return res
    .status(201)
    .json(new apiResponse(200, newMessage, "Message created successfully."));
});

export { getAllMessages, sendMessage };
