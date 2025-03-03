import {Router} from "express"
import { registerUser } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"

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


export default router



/**
 * Summary:
 * - Creates an Express router for user registration.
 * - Uses `multer` middleware to handle file uploads for `avatar` and `coverImage`.
 * - Calls `registerUser` controller after processing the uploaded files.
 */
