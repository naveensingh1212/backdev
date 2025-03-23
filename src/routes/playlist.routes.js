import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createPlayList,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.route("/create").post(verifyJWT,createPlayList);

router.route("/user/:userId").get(verifyJWT,getUserPlaylists);

router.route("/:playlistId").get(verifyJWT,getPlaylistById);


router.route("/add/:playlistId/:videoId").patch(verifyJWT,addVideoToPlaylist);

router.route("/remove/:playlistId/:videoId").patch(verifyJWT,removeVideoFromPlaylist);

router.route("/play/:playlistId").delete(verifyJWT,deletePlaylist);

router.route("/:playlistId").patch(verifyJWT,updatePlaylist);



export default router;