import {Router} from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

import {
    publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getAllVideos,
  getVideosByCategory,
  getAllRelatedVideos,
  getVideoDetail,
  addVideoToWatchHistory,
  removeVideoFromWatchHistory,
  clearAllWatchHistory,
} from '../controllers/video.controller.js';

const router = Router();
router.route("/publishVideo").post(
    verifyJWT,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "videoFile", maxCount: 1 },
    ]),
    publishVideo
);

router.route("/c/:videoId").get(verifyJWT, getVideoById);

router.route("/c/:videoId")
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/c/:videoId")
.delete(verifyJWT, deleteVideo);

router.route("/all").get(verifyJWT, getAllVideos);
router.route("/category/:category").get(verifyJWT, getVideosByCategory);
router.route("/related/:videoId").get(verifyJWT, getAllRelatedVideos);
router.route("/info/:videoId").get(verifyJWT, getVideoDetail);


router.route("/addVideo/:videoId").post(verifyJWT, addVideoToWatchHistory);

router
.route("/deleteVideoFromHistory/:videoId")
.delete(verifyJWT, removeVideoFromWatchHistory);

router.route("/deleteHistory").delete(verifyJWT, clearAllWatchHistory);

router.route("/togglePublishStatus/:videoId").patch(verifyJWT, togglePublishStatus);
