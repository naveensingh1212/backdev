import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getChannelData, fetchSelectedCategoryData, fetchRelatedVideos, fetchVideoDetails } from "../utils/externalAPI.js";

// Get All Videos
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;
  
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const externalVideos = await getChannelData("home");

  let filter = { isPublished: true };
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (userId) filter.owner = userId;

  const userVideos = await Video.find(filter)
    .populate("owner")
    .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(limitNumber);

  const totalUserVideos = await Video.countDocuments(filter);
  const allVideos = [...userVideos, ...externalVideos];

  res.status(200).json(
    new ApiResponse(200, {
      videos: allVideos,
      totalUserVideos,
      totalPages: Math.ceil(totalUserVideos / limitNumber),
      currentPage: pageNumber,
    }, "All Videos Fetched Successfully")
  );
});

// Publish a Video
const publishVideo = asyncHandler(async (req, res) => {
  const { title, description, category, type } = req.body;
  if (!title || !description || !category || !type) throw new ApiError(400, "All fields are required");

  const videoLocalPath = req.files?.videoFile?.[0]?.buffer;
  if (!videoLocalPath) throw new ApiError(400, "Video is required to upload");

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  if (!videoFile) throw new ApiError(400, "Failed to upload video");

  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.buffer;
  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) throw new ApiError(400, "Failed to upload thumbnail");

  const newVideo = await Video.create({
    videoFile: videoFile.url,
    title,
    description,
    category,
    type,
    thumbnail: thumbnail.url,
    owner: req.user?._id,
  });

  if (!newVideo) throw new ApiError(500, "Failed to upload the video");

  return res.status(200).json(new ApiResponse(200, newVideo, "Video Uploaded Successfully"));
});

// Get Video by ID
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId).populate("owner");

  if (!video) throw new ApiError(400, "Invalid videoId");

  return res.status(200).json(new ApiResponse(200, video, "Video Fetched Successfully"));
});

// Update Video Details
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Invalid videoId");

  const { title, description, category, type } = req.body;

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (category) updateFields.category = category;
  if (type) updateFields.type = type;

  const thumbnailLocalPath = req.file?.path;
  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) throw new ApiError(400, "Failed to upload thumbnail");
    updateFields.thumbnail = thumbnail.url;
  }

  const updatedVideo = await Video.findByIdAndUpdate(videoId, { $set: updateFields }, { new: true });
  if (!updatedVideo) throw new ApiError(400, "Failed to update video");

  return res.status(200).json(new ApiResponse(200, updatedVideo, "Details updated successfully"));
});

// Delete Video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Invalid videoId");

  await Video.findByIdAndDelete(videoId);
  return res.status(200).json(new ApiResponse(200, "Video Deleted Successfully"));
});

// Toggle Publish Status
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "VideoId is required");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(400, "Invalid videoId");

  video.isPublished = !video.isPublished;
  await video.save();

  return res.status(200).json(new ApiResponse(200, video, "Publish status toggled successfully"));
});

// Get Videos by Category
const getVideosByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  if (!category) return res.status(400).json({ error: "Category is required" });

  const dbVideos = await Video.find({ category }).populate("owner");
  const externalVideos = await fetchSelectedCategoryData(category);
  const combinedVideos = [...dbVideos, ...externalVideos];

  if (combinedVideos.length === 0) return res.status(404).json({ message: "No videos found in this category" });

  res.status(200).json(combinedVideos);
});

// Get Related Videos
const getAllRelatedVideos = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) return res.status(400).json({ error: "VideoId is required" });

  const video = await fetchRelatedVideos(videoId);
  if (!video || video.length === 0) return res.status(404).json({ message: "No related videos found" });

  res.status(200).json(video);
});

// Get Video Details
const getVideoDetail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  if (!videoId) return res.status(400).json({ error: "VideoId is required" });

  const video = await fetchVideoDetails(videoId);
  const liked = await Like.findOne({ likedBy: new mongoose.Types.ObjectId(userId), videoId });
  res.status(200).json({ video, isLiked: !!liked });
});

// Watch History
const addVideoToWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.watchHistory = [req.params.videoId, ...user.watchHistory.filter(id => id !== req.params.videoId)];
  await user.save();

  return res.status(200).json(new ApiResponse(200, "Video added to watch history"));
});

// Remove Video from Watch History
const removeVideoFromWatchHistory = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Give correct VideoId");

  const user = await User.findById(req.user._id);
  let idx = await user.watchHistory.indexOf(videoId);

  if (idx !== -1) {
    user.watchHistory.splice(idx, 1);
    try {
      await user.save();
    } catch (error) {
      if (error.name === "VersionError") {
        // Handle the version conflict, e.g., re-fetch the user and try again
        const freshUser = await User.findById(req.user._id);
        freshUser.watchHistory.splice(
          freshUser.watchHistory.indexOf(videoId),
          1
        );
        await freshUser.save();
      } else {
        throw error; // Other types of errors should be thrown as is
      }
    }
  } else throw new ApiError(400, "Video to be deleted does not exists");

  res.status(200).json(new ApiResponse(200, "Video removed Successfully"));
});

// Clear All Watch History
const clearAllWatchHistory = asynchandler(async (req, res) => {
  const userid = req.user?._id;
  const user = await User.findById(userid);

  if (!user) throw new ApiError(400, "User Not found");

  user.watchHistory = [];
  await user.save();

  res.status(200).json(new ApiResponse(200, "All Videos removed Successfully"));
});

export {
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
};
