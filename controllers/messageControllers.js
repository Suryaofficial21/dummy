// controllers/messageController.js

import Message from "../models/message.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import io from "socket.io-client";

// Create a socket connection to the server (replace 'http://localhost:4000' with your server URL)
const socket = io("http://localhost:4000");

// Send a message
export const sendMessage = catchAsyncErrors(async (req, res) => {
  const { content } = req.body;
  const receiver = req.params.id;

  // Find or create a message thread between the sender and receiver
  let messageThread = await Message.findOne({
    participants: { $all: [req.user._id, receiver] },
  });

  if (!messageThread) {
    messageThread = new Message({
      participants: [req.user._id, receiver],
    });
  }

  // Add the new message to the thread
  messageThread.messages.push({
    sender: req.user._id,
    content,
  });
  // Generate a unique event name for this chat
  const chatEventName = `${req.user._id}_${req.params.id}`;

  // Emit the message to the server using the unique event name
  socket.emit(chatEventName, messageThread);


  // Save the message thread to the database
  await messageThread.save();

  // Broadcast the message to the participants using Socket.IO


  res.status(200).json({
    success: true,
    message: "Message sent successfully",
  });
});

// Get all messages between two users
export const getMessages = catchAsyncErrors(async (req, res) => {
  const  user2  = req.params.id;
  const user1 = req.user._id;

  // Fetch all messages between user1 and user2
  let messageThread = await Message.findOne({
    participants: { $all: [user1, user2] },
  });

  if (!messageThread) {
    return res.status(200).json({
      success: true,
      messages: [],
    });
  }

  res.status(200).json({
    success: true,
    messages: messageThread.messages,
  });
});

// Function to send a message to multiple users using Socket.IO
const sendToUsers = (userIds, messageThread) => {
  userIds.forEach((userId) => {
    socket.to(userId).emit("message", messageThread);
  });
};

// Handle connection to the Socket.IO server
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
});

// Handle disconnection from the Socket.IO server
socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO server");
});
