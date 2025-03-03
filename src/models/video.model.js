import mongoose, { Schema } from "mongoose"; // Import mongoose and Schema
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // Import pagination plugin

const videoSchema = new Schema(
    {
        videoFile: { 
            type: String, // URL for the video file
            required: true 
        },
        thumbnail: { 
            type: String, // URL for the thumbnail
            required: true 
        },
        title: { 
            type: String, // Title of the video
            required: true 
        },
        description: { 
            type: String, // Description of the video
            required: true 
        },
        duration: { 
            type: Number, // Video duration in seconds
            required: true 
        },
        views: { 
            type: Number, // Number of views
            default: 0 
        },
        isPublished: { 
            type: Boolean, // Publish status
            default: true 
        },
        owner: { 
            type: Schema.Types.ObjectId, // Reference to the owner
            ref: "User" 
        }
    }, 
    {
        timestamps: true // Adds createdAt and updatedAt
    }
);

videoSchema.plugin(mongooseAggregatePaginate); // Add pagination plugin

export const Video = mongoose.model("Video", videoSchema); // Export the Video model




/**
 * Summary:
 * - Defines the `Video` schema for MongoDB using Mongoose.
 * - Stores video-related details like `videoFile`, `thumbnail`, `title`, `description`, `duration`, `views`, and `isPublished`.
 * - References the `User` model for ownership.
 * - Uses `mongooseAggregatePaginate` for efficient pagination.
 * - Includes timestamps for tracking creation and updates.
 */
