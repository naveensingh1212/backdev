import {Router} from "express"
import {verifyJWT } from "../middlewares/auth.middleware.js"
import { registerUser, 
    loginUser, 
    logoutUser,
    changeCurrentPassword,
    updateAccountDetails,
    getCurrentUser,
    updateUserAvatar, 
    updateUserCoverImage,
    getUserChannelProfile, 
    getWatchHistory, 
    getUploadedVideos,
    } 
    from "../controllers/user.controller.js"
    
import {upload} from "../middlewares/multer.middleware.js"
import { refreshAccessToken } from "../controllers/user.controller.js"
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )


router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post( verifyJWT, logoutUser)


router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)
router .route("/getUploadedVideo").get(verifyJWT,getUploadedVideos)



export default router



/**
 * Summary:
 * - Creates an Express router for user registration.
 * - Uses `multer` middleware to handle file uploads for `avatar` and `coverImage`.
 * - Calls `registerUser` controller after processing the uploaded files.
 */
