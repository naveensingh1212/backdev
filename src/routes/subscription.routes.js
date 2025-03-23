import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    getUserChannelSubscribers,
    getSubscribedChannels,
    toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router.route("/u/:channelId").get(verifyJWT,getUserChannelSubscribers);

router.route("/c/:subscriberId").get(verifyJWT,getSubscribedChannels);

router.route("/toggle/:channelId").post(verifyJWT, toggleSubscription);


export default router;