import { asyncHandler } from "../utils/asyncHandler.js";
import  {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessandRefreshTokens = async(userId)  => {
    try {
        const user = await User.findById(userId)
        const  accessToken = user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken , refreshToken}
        
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating acess and refresh token ")
    }
}

const registerUser = asyncHandler( async (req, res) => {

    //get user detail from frontend
    //validation = not null
    //check if user already exist ,: username ,email
    //check for images ,check for avatar
    // upload them to cloudaniry, avatar
    //create user object , create entry in db 
    // remove password and refresh tokken from resposnse
    //check for user creation
    //return res


    const {fullName,email,username,password}=req.body
   // console.log("email:", email);

    if([fullName,email,username,password].some((field) =>
         field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }
    
    const existedUser = await User.findOne({
        $or: [{ username },{ email } ]
    })
    
    
    if(existedUser){
        throw new ApiError(409,"user with email or username already exists")     
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    //const coverImageLocalPath =req.files?.coverImage[0]?.path 

    let  coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if(!avatarLocalPath){
        throw new ApiError(400,"avatar image is needed")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    
    if(!avatar){
        throw new ApiError(400,"avatar image is needed")
    }
    
    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    }
    )

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, " something went wrong while registering")
    }

return res.status(201).json(
    new ApiResponse(200, createdUser,"user register succefully")
)



} )

////////////////LOGIN ////////////////////////


const loginUser = asyncHandler(async (req , res) => {

// request body  - > data 
// email, username
//find the  user 
//password check 
//access and refresh token 
// send cookie 


const {email , username , password} = req.body
 
if(!(email || username)) {
    throw new ApiError(400, "email and username is required ");
    
}

const user =  await User.findOne({
    $or : [{username},{email}]
})

if(!user){
    throw new ApiError(404,"User does not exist ")
}

const isPasswordvalid = await  user.isPasswordCorrect(password)

if(!isPasswordvalid){
    throw new ApiError(404," user does not exist ")
}


const {accessToken,refreshToken }=await generateAccessandRefreshTokens(user._id)

const loggedinUser = await User.findById(user.id)
    .select('-password -refreshToken');        //excluded from the result

const options ={
       httpOnly: true,     //only server can change cookie
       secure : true
    }

return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
    new ApiResponse(
        200,
        {
            user: loggedinUser,accessToken,refreshToken
        },
        "User logged In Successfully"
    )
)




} )

///////////////LOGOUT/////////////////////

const loggedOut = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new : true
        }
    )


    const options ={
        httpOnly: true,     //only server can change cookie
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logout successfully"))
})   


const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorize request");
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"invalid  refresh token");
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"invalid  refresh token  or expired");
    }

    const options = {
        httpOnly:true,
        secure: true
    }   

    const {accessToken,newRefreshToken} = await generateAccessandRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken", newRefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,newRefreshToken},
            "acccesss token refreshed successfully"
    )
    )
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body 
    
    const user =  await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
     if(!isPasswordCorrect){
        throw new ApiError(400,"invalid old password")
     }

     user.password = newPassword
     await  user.save({validateBeforeSave : false})


     return res
     .status(200)
     .json(
         new ApiResponse(
             200,
             {},
             "user newPassword save successfully"
     )
     )
})

const currentUser = asyncHandler(async (req,res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,req.user,"current user fetched successfully "
        )
    )
})


const updateAccountDetail = asyncHandler(async (req,res) => {
    const {fullName,email} = req.body
    if (!(fullName || email)) {
        throw new ApiError(400,"all field are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {$set:{
            fullName : fullName,
            email: email
        }},
        {new : true}
    ).select("-password")


    return res
    .status(200)
    .json(
        new ApiResponse(
            200, user,"account detail update successfully "
        )
    )
})


const updateUserAvatar = asyncHandler(async (req,res) => {
    const avatarLocalPath = req.file?.path
    
    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"error while uploading")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {$set:{
            avatar : avatar.url
        }},
        {new : true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,user,"avatar update successfully "
        )
    )
    
})

const updateUserCoverImage = asyncHandler(async (req,res) => {
    const coverImageLocalPath = req.file?.path
    
    if (!coverImageLocalPath) {
        throw new ApiError(400,"coverImage  file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"error while uploading")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {$set:{
            coverImage : coverImage.url
        }},
        {new : true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,user,"coverImage update successfully "
        )
    )
})

export {
    registerUser,
    loginUser,
    loggedOut,refreshAccessToken,
    changeCurrentPassword,
    currentUser ,updateAccountDetail,
    updateUserAvatar,
    updateUserCoverImage
}