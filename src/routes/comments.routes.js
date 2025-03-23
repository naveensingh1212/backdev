import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/add/:videoId").post(verifyJWT, addComment);

router.route("/updateComment/:commentId").patch(updateComment);

router.route("/deleteComment/:commentId").delete(deleteComment);
router.route("/get/:videoId").get(getVideoComments);

export default router;
