import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";

// create or get one-one chat

const accessChat = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  if (!receiverId) {
    throw new apiError(400, "Receiver ID is required");
  }

  let existingChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: senderId } } },
      { users: { $elemMatch: { $eq: receiverId } } },
    ],
  });

  existingChat = await User.populate(existingChat, {
    path: "latestMessage.sender",
    select: "username email avatar",
  });

  if (existingChat.length > 0) {
    return res
      .status(200)
      .json(new apiResponse(200, existingChat, "Chat found successfully."));
  }

  const newChat = await Chat.create({
    chatName: "one-to-one chat",
    isGroupChat: false,
    users: [senderId, receiverId],
  });

  if (!newChat) {
    throw new apiError(500, "Error in creating new chat.");
  }

  const createdChat = await Chat.findById(newChat._id).populate(
    "users",
    "-password -refreshToken"
  );

  if (!createdChat) {
    throw new apiError(
      500,
      "Error in getting user details in newly created chat."
    );
  }

  return res
    .status(201)
    .json(new apiResponse(201, createdChat, "Chat created successfully."));
});

// fetch all chats of an user

const getAllChats = asyncHandler(async (req, res) => {
  let chats = await Chat.find({
    users: {
      $elemMatch: {
        $eq: req.user._id,
      },
    },
  })
    .populate("users", "-password -refreshToken")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  if (!chats) {
    throw new apiError(500, "Error in fetching chats.");
  }

  chats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "username email avatar",
  });

  if (!chats) {
    throw new apiError(
      500,
      "Error in fetching latest mesasfe sender details in chats."
    );
  }

  return res
    .status(200)
    .json(new apiResponse(200, chats, "Chats fetched successfully."));
});

// group chat

const createGroup = asyncHandler(async (req, res) => {
  const { chatName, users } = req.body;

  if (!chatName || !users) {
    throw new apiError(400, "Chat name and users are required.");
  }

  // usersList = JSON.parse(users);
  users.push(req.user._id);

  if (users.length < 3) {
    throw new apiError(400, "Group chat should have at least 3 users.");
  }

  const newGroupChat = await Chat.create({
    chatName,
    isGroupChat: true,
    users,
    groupAdmin: req.user._id,
  });

  if (!newGroupChat) {
    throw new apiError(500, "Error in creating new group chat.");
  }

  const createdGroupChat = await Chat.findById(newGroupChat._id)
    .populate("users", "-password -refreshToken")
    .populate("groupAdmin", "-password -refreshToken");

  if (!createdGroupChat) {
    throw new apiError(
      500,
      "Error in getting user details in newly created group chat."
    );
  }

  return res
    .status(201)
    .json(
      new apiResponse(201, createdGroupChat, "Group chat created successfully.")
    );
});

// rename group

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    throw new apiError(400, "Chat ID and chat name are required.");
  }

  const updatedGroupChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName },
    { new: true }
  )
    .populate("users", "-password -refreshToken")
    .populate("groupAdmin", "-password -refreshToken");

  if (!updatedGroupChat) {
    throw new apiError(500, "Error in renaming group chat.");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedGroupChat, "Group renamed successfully.")
    );
});

// add user to group

const addUserToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    throw new apiError(400, "Chat ID and user ID are required.");
  }

  const chatDetails = await Chat.findById(chatId).select(
    "-chatName -latestMessage -isGroupChat"
  );

  if (!chatDetails) {
    throw new apiError(404, "Chat with the given ID not found.");
  }

  if (JSON.stringify(chatDetails.groupAdmin) !== JSON.stringify(req.user._id)) {
    throw new apiError(
      403,
      "You are not authorized to add users to this group."
    );
  }

  if (
    chatDetails.users.some(
      (id) => JSON.stringify(id) === JSON.stringify(userId)
    )
  ) {
    throw new apiError(400, "User already exists in the group.");
  }

  chatDetails.users.push(userId);

  const updatedGroupChat = await chatDetails.save();

  if (!updatedGroupChat) {
    throw new apiError(500, "Error in adding user to group chat.");
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedGroupChat,
        "User added to group successfully."
      )
    );
});

// remove user from group

const removerFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    throw new apiError(400, "Chat ID and user ID are required.");
  }

  const chatDetails = await Chat.findById(chatId).select(
    "-chatName -latestMessage -isGroupChat"
  );

  if (!chatDetails) {
    throw new apiError(404, "Chat with the given ID not found.");
  }

  if (JSON.stringify(chatDetails.groupAdmin) !== JSON.stringify(req.user._id)) {
    throw new apiError(
      403,
      "You are not authorized to remove users from this group."
    );
  }

  if (
    !chatDetails.users.some(
      (id) => JSON.stringify(id) === JSON.stringify(userId)
    )
  ) {
    throw new apiError(400, "User does not exist in the group.");
  }

  chatDetails.users = chatDetails.users.filter(
    (id) => JSON.stringify(id) !== JSON.stringify(userId)
  );

  const updatedGroupChat = await chatDetails.save();

  if (!updatedGroupChat) {
    throw new apiError(500, "Error in removing user from group chat.");
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedGroupChat,
        "User removed from group successfully."
      )
    );
});

export {
  accessChat,
  getAllChats,
  createGroup,
  renameGroup,
  addUserToGroup,
  removerFromGroup,
};
