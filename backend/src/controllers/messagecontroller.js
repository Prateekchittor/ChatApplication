import { getDB } from '../lib/db.js';

import { ObjectId } from 'mongodb';


// Get all users except the logged-in one
export const getUsersforSidebar = async (req, res) => {
    const db = getDB();

    try {
        const loggedinUserId = req.user._id;

        const filteredUsers = await db.collection('authentication')
            .find({ _id: { $ne: loggedinUserId } }, { projection: { Password: 0 } })
            .toArray();

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Sidebar fetch error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



export const getMessages = async (req, res) => {
    const db = getDB();

    try {
        const { id: userToChatId } = req.params;
        const myId = req.user?._id;

        // Basic validation
        if (!ObjectId.isValid(userToChatId) || !ObjectId.isValid(myId)) {
            return res.status(400).json({ message: "Invalid user ID(s)" });
        }

        const myObjectId = new ObjectId(myId);
        const userToChatObjectId = new ObjectId(userToChatId);

        const messages = await db.collection("messages")
            .find({
                $or: [
                    { SenderId: myObjectId, ReceiverId: userToChatObjectId },
                    { SenderId: userToChatObjectId, ReceiverId: myObjectId }
                ]
            })
            .sort({ Timestamp: 1 })
            .toArray();

        return res.status(200).json(messages);

    } catch (error) {
        console.error("Get messages error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Send a new message
export const sendMessages = async (req, res) => {
    const db = getDB();

    try {
        const { id: usertochatId } = req.params;
        const myId = req.user._id;
        const { text } = req.body;

        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "Message text cannot be empty" });
        }

        const newMessage = {
            SenderId: new ObjectId(myId),
            ReceiverId: new ObjectId(usertochatId),
            Text: text,
            Schedule:false,
            Timestamp: new Date()
        };

        const result = await db.collection('messages').insertOne(newMessage);





     





        if (result.insertedId) {
            res.status(201).json({ message: "Message sent", messageId: result.insertedId });
        } else {
            res.status(500).json({ message: "Failed to send message" });
        }

    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};




/// schedule a message

export const schedulemsg = async (req, res) => {
    const db = getDB();

    try {
        const { id: usertochatId } = req.params;
        const { myId, text, Timestamp } = req.body;  // Expecting `Timestamp`

        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "Message text cannot be empty" });
        }

        if (!Timestamp || isNaN(new Date(Timestamp).getTime())) {
            return res.status(400).json({ message: "Invalid schedule time" });
        }

        if (!ObjectId.isValid(myId) || !ObjectId.isValid(usertochatId)) {
            return res.status(400).json({ message: "Invalid user ID(s)" });
        }

        const newMessage = {
            SenderId: new ObjectId(myId),
            ReceiverId: new ObjectId(usertochatId),
            Text: text,
            Schedule: true,
            Timestamp: new Date(Timestamp)  // Store as Date object
        };

        const result = await db.collection("messages").insertOne(newMessage);

        if (result.insertedId) {
            res.status(201).json({ message: "Message scheduled", messageId: result.insertedId });
        } else {
            res.status(500).json({ message: "Failed to store scheduled message" });
        }
    } catch (error) {
        console.error("Schedule message error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// delete a message


export const deletemsg = async (req, res) => {
    const db = getDB();
  
    try {
      const { id: usertochatId } = req.params;
      const { myId, _Id } = req.body;
  
      if (!ObjectId.isValid(myId) || !ObjectId.isValid(usertochatId) || !_Id || !ObjectId.isValid(_Id)) {
        return res.status(400).json({ message: "Invalid ID(s)" });
      }
  
      const result = await db.collection("messages").deleteOne({
        $or: [
          { _id: new ObjectId(_Id), SenderId: new ObjectId(myId), ReceiverId: new ObjectId(usertochatId) },
          { _id: new ObjectId(_Id), SenderId: new ObjectId(usertochatId), ReceiverId: new ObjectId(myId) }
        ]
      });
      
  
      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Message deleted successfully" });
      } else {
        res.status(404).json({ message: "Message not found or not authorized to delete" });
      }
    } catch (error) {
      console.error("Delete message error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };