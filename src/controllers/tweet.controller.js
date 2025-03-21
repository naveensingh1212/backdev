import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {tweetId} = req.params;
    if(!tweetId) throw new ApiError(400," tweet id is required");

    const newTweet = await Tweet.create(
        {
            content : content,
            owner : req.user?._id,
        }
    )
    if(!newTweet)
        throw new ApiError(400, "Not able to tweet");
    return res
    .status(200)
    .json(
       new ApiResponse(200 , newTweet , "Tweeted Successfully")
         ) 

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.param;

    if(!userId )
        throw new ApiError(400,"Give correct user id");

    const user = await User.aggregate([
        {
            $match  : {
                _id : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup :{
                from: "tweets",
                localField:"_id",
                foreignField:"owner",
                as:"allTweets",
            },
        },
        {
            $project:{
                allTweets:1,
            }
        }
    ]);

    if(!user || user.length === 0)
        throw new ApiError(500,"Not able to find all the user Tweets");

     return res
           .status(200)
           .json(
                  new ApiResponse(200,user[0],"These are the Tweets")
                );

     

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;
    if(!tweetId )
        throw new ApiError(400,"Give correct tweet id");

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
               content:content,
            }
        }
    )

    if(!updatedTweet)
        throw new ApiError(500 , "Problem updating the Tweet");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if(!tweetId )
        throw new ApiError(400,"TweetId  is required");

     await Tweet.findByIdAndDelete(
       tweetId
     )

     return res
      .status(200)
      .json(
        new ApiResponse(200,"Tweet Deleted Successfully")
      )  
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}