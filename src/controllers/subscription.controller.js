import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { SubscriptionSchema } from "../models/subscription.model.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId =req.user?._id;
    if (!channelId) throw new ApiError(200, "The channel id is required");

    const existingSubscriber = await SubscriptionSchema.findOne({
        channel : new mongoose.Types.ObjectId(channelId),
        subscriber : new mongoose.Types.ObjectId(userId),
    });

    if(existingSubscriber){
        await SubscriptionSchema.findOneAndDelete(userId);
    
    return res
      .status(200)
      .json(new ApiResponse(200, "User Unsubscribed Successfully"));
    } else {
        const newSubscriber = await SubscriptionSchema.create({
            subscriber: new mongoose.Types.ObjectId(userId),
            channel: new mongoose.Types.ObjectId(channelId),
            subscribedAt : new Date(),
        });
        await newSubscriber.save();

        if(!newSubscriber)
            throw new ApiError(500,"Not able to subscribe the channel");
        return res.status(200)
        .json(new ApiResponse(200,newSubscriber,"User subscriberd successfully"));
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    if(!channelId){
        throw new ApiError(400,"the channel id is required");
        
    }

    const subscribers = await User.aggregate(
    [
        {
            $match:{
                _id : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup : {
                from:"subscriberschema",
                localField:"_id",
                foreignField:"channel",
                as:"tsubscribers"
            }
        },
        {
            $project:{
                tsubscribers:1
            }
        },
    ]
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscribers,"all subscriber fetched")
);



});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const channels = User.aggregate([
        {
            $match:{ 
                _id : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from : "subscriptionschema",
                localField:"_id",
                foreignField:"subscriber",
                as: "totalchannelsubscriberd",
            }
        },
        {
            $project:{
                totalchannelsubscriberd : 1,
            }
        }
    ]);

    return res
    .status(200)
    .json(new ApiResponse(200, channels, "All channels fetched successfully"));
});




export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}