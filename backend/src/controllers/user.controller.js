import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Couldn't generate access token and refresh token."
    );
  }
};

const options = {
  httOnly: true,
  secured: true,
};

// register

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim === "")) {
    throw new apiError(400, "All fields are required.");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new apiError(400, "User with this email already exists.");
  }

  const avatarLocalPath = req.file?.path;

  let user;

  if (avatarLocalPath) {
    const avatar = await uploadToCloudinary(avatarLocalPath);

    if (!avatar) {
      throw new apiError(500, "Couldn't upload avatar to cloudinary.");
    }

    user = await User.create({
      username,
      email,
      password,
      avatar: avatar.url,
    });
  } else {
    user = await User.create({
      username,
      email,
      password,
    });
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "Couldn't create user.");
  }

  await generateAccessAndRefreshToken(user._id);

  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User registerd successfully."));
});

// login

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field?.trim === "")) {
    throw new apiError(400, "All fields are required.");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new apiError(400, "User with this email doesn't exist.");
  }

  if (!(await user.isPasswordCorrect(password))) {
    throw new apiError(400, "Invalid password.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          username: user.username,
          email: user.email,
          accessToken,
          refreshToken,
        },
        "User logged in successfully."
      )
    );
});

// logout

const logoutUser = asyncHandler(async (req, res) => {
  const _id = req.user._id;

  await User.findByIdAndUpdate(_id, {
    $set: {
      refreshToken: undefined,
    },
  });

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out successfully."));
});

// get current user

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        req.user,
        "Current user details fetched successfully."
      )
    );
});

// refresh accress token

const refreshAccessToken = asyncHandler(async (req, res) => {
  const receivedRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!receivedRefreshToken) {
    throw new apiError(401, "No refresh token provided.");
  }

  try {
    const decodedToken = jwt.verify(
      receivedRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new apiError(401, "User not found. Invalid refresh token.");
    }

    if (user.refreshToken !== receivedRefreshToken) {
      throw new apiError(
        401,
        "Refresh tokens don't match. Invalid refresh token."
      );
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully."
        )
      );
  } catch (error) {
    throw new apiError(
      401,
      "Couldn't refresh access token. Invalid refresh token."
    );
  }
});

// get all users

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({
    _id: { $ne: req.user._id },
  });

  if (!users) {
    throw new apiError(404, "No users found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, users, "All users fetched successfully."));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  getAllUsers,
};
