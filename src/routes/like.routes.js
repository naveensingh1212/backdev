import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"

import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideosByUser,
} from "../controllers/like.controller.js"

const router = Router();

router.route("/video/:videoId").post(verifyJWT, toggleVideoLike);
router.route("/comment/:commentId").post(verifyJWT, toggleCommentLike);
router.route("/tweet/:tweetId").get(verifyJWT, toggleTweetLike);
router.route("/likedvideos").get(verifyJWT, getLikedVideosByUser);

export default router;

