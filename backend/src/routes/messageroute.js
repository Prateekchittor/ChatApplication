import express from 'express'
import { protectRoute } from '../middleware/protectroute.js';

import {getUsersforSidebar,getMessages,sendMessages,schedulemsg,deletemsg} from '../controllers/messagecontroller.js'

const router = express.Router();

router.get("/users",protectRoute,getUsersforSidebar);


router.get("/:id",protectRoute,getMessages);


router.post("/send/:id",protectRoute,sendMessages);


router.post("/schedulemsg/:id",protectRoute,schedulemsg);

router.delete("/deletemsg/:id",protectRoute,deletemsg);






export default router;