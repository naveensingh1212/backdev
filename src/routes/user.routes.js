import {Router} from "express"
import {verifyJWT } from "../middlewares/auth.middleware.js"
import { registerUser, loginUser, loggedOut  } from "../controllers/user.controller.js"
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

router.route("/logout").post( verifyJWT, loggedOut)


router.route("/refresh-token").post(refreshAccessToken)

export default router



/**
 * Summary:
 * - Creates an Express router for user registration.
 * - Uses `multer` middleware to handle file uploads for `avatar` and `coverImage`.
 * - Calls `registerUser` controller after processing the uploaded files.
 */
