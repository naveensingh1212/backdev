import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fetchVideoDetails } from "../utils/fetchDataFromAPI.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) throw new ApiError(400, "Video ID is required");

    let comments;
    if (mongoose.Types.ObjectId.isValid(videoId)) {
        comments = await Comment.find({ video: videoId })
            .populate({ path: "owner" })
            .populate({ path: "video" });
    } else {
        comments = await Comment.find({ externalVideoId: videoId }).populate({
            path: "owner",
        });
    }

    if (comments.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No comments found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments retrieved successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!videoId) throw new ApiError(400, "Video ID is required");
    if (!content) throw new ApiError(400, "Content is required");

    let newComment;
    if (mongoose.Types.ObjectId.isValid(videoId)) {
        newComment = await Comment.create({
            content,
            video: videoId,
            owner: req.user?._id,
        });

        newComment = await Comment.findById(newComment._id).populate({
            path: "owner",
        });
    } else {
        const videoDetails = await fetchVideoDetails(videoId);
        newComment = await Comment.create({
            content,
            owner: req.user?._id,
            externalVideoId: videoId,
        });

        newComment = await Comment.findById(newComment._id).populate({
            path: "owner",
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, newComment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) throw new ApiError(400, "Comment ID is required");
    if (!content) throw new ApiError(400, "Content is required");

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content } },
        { new: true }
    );

    if (!updatedComment) throw new ApiError(404, "Comment not found");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) throw new ApiError(400, "Comment ID is required");

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) throw new ApiError(404, "Comment not found");

    return res
        .status(200)
        .json(new ApiResponse(200, [], "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
