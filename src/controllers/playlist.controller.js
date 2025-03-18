import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if(!name) throw new ApiError(400,"name is required");
    if(!description) throw new ApiError(400,"description is required");

    const newPlaylist = await Playlist.create({
        name : name,
        description:description,
        owner : req.user._id,
        } )


    if(!newPlaylist)
        throw new ApiError(400,"Not able to create the playlist");

    return res
    .status(200)
    .json( new ApiResponse( 200, newPlaylist,"playlist created successfully"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId)
        throw new ApiError(400,"user Id is required");

    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup :{
                from: "playlists",
                localField: "_id",
                foreignField: "owner",
                as:"nplaylist"
            }
        },
        {
            $project:{
                nplaylist:1
            }
        }
    ]);

    if(!user || user.length === 0)
        throw new ApiError(404,"not able to find  all user playlist")

    return res.status(200)
    .json(new ApiResponse(200,user[0],"userplaylist fetched successfully"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if(!playlistId)
        throw new ApiError(400,"PlayList Id is required");

    const playList = await Playlist.findById(playlistId);

    if(!playList)
        throw new ApiError(400,"Give Correct PlayList Id");

    return res
     .status(200)
     .json(
        new ApiResponse(200,playList,"Playlist Fetched SuccessFully")
     )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!(playlistId))
        throw new ApiError(400,"playlistid is  required")
    if(!(videoId))
        throw new ApiError(400,"videoid is  required")

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if(!video)
        throw new ApiError(400,"Video doesnot exists");
    if(!playlist)
        throw new ApiError(400,"PlayList doesnot exists");

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{
                videos : videoId
            }
        },
        {
            new : true,
        }
    )

    if(!updatePlaylist)
        throw new ApiError(500,"problem uploading the video");

    return res
    .status(200)
    .json(new ApiResponse(200,updatePlaylist,"video addedto playlist successfully"))
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId || !videoId)
        throw new ApiError(400,"Both playlist and video id are required");

    const video = await Video.findById(videoId);
    const playlist = await Playlist.findById(playlistId) ;

    if(!video)
        throw new ApiError(400,"Video doesnot exists");
    if(!playlist)
        throw new ApiError(400,"PlayList doesnot exists");

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:videoId,
            }
        },
        {
            new :true,
        }
    )
    if(!updatedPlaylist) 
        throw new ApiError(500 , "Problem deleting the video");
 
    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video deleted from playlist successfully"));
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId)
        throw new ApiError(400,"PlayList Id is required");

     await Playlist.findByIdAndDelete(
        playlistId
     )

     return res
      .status(200)
      .json(
        new ApiResponse(200,"PlayList Deleted Successfully")
      )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId)
        throw new ApiError(400,"PlayList Id is required");

    if(!name)
        throw new ApiError(400,"Name of playlist is required");
     if(!description)
        throw new ApiError(400,"Description of playlist is required");

     const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name : name,
                description : description,
            }  
        },
        {
            new :true,
        }
     )

     if(!updatedPlaylist) 
        throw new ApiError(500 , "Problem updating the details");
 
    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "playlist updated successfully"));

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}