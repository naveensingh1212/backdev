import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  createTweet,
  updateTweet,
  deleteTweet,
  getUserTweets,
} from "../controllers/tweet.controller.js";

const router = Router();

router.route("/create").post(verifyJWT, createTweet);

router.route("/update/:tweetId").patch(verifyJWT, updateTweet);

router.route("/delete/:tweetId").delete(verifyJWT, deleteTweet);

router.route("/get/:userId").get(verifyJWT, getUserTweets);
export default router;
