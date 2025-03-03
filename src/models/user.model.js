import mongoose, { Schema } from "mongoose"; // Import mongoose and Schema
import jwt from "jsonwebtoken"; // Import JSON Web Token for authentication
import bcrypt from "bcrypt"; // Import bcrypt for password hashing

// Define the User schema
const userSchema = new Schema(
    {
        username: { 
            type: String, 
            required: true, 
            unique: true, 
            lowercase: true, 
            trim: true, 
            index: true // Makes username searchable
        },
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            lowercase: true, 
            trim: true 
        },
        fullName: { 
            type: String, 
            required: true, 
            trim: true, 
            index: true // Makes fullName searchable
        },
        avatar: { 
            type: String, // URL for profile picture
            required: true 
        },
        coverImage: { 
            type: String // URL for cover image
        },
        watchHistory: [ 
            { 
                type: Schema.Types.ObjectId, // References Video model
                ref: "Video" 
            } 
        ],
        password: { 
            type: String, 
            required: [true, 'Password is required'] 
        },
        refreshToken: { 
            type: String // Stores user's refresh token
        }
    },
    {
        timestamps: true // Auto-add createdAt and updatedAt
    }
);

// Pre-save hook for hashing the password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Skip if password is unchanged
    this.password = await bcrypt.hash(this.password, 10); // Hash password with salt rounds
    next();
});

// Method to verify the password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // Compare input password with hashed password
};

// Method to generate access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key for access token
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Token expiry duration
        }
    );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET, // Secret key for refresh token
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Token expiry duration
        }
    );
};

// Export the User model
export const User = mongoose.model("User", userSchema);



/**
 * Summary:
 * - Defines the `User` schema for MongoDB using Mongoose.
 * - Includes fields like `username`, `email`, `fullName`, `avatar`, `coverImage`, `watchHistory`, `password`, and `refreshToken`.
 * - Uses a pre-save hook to hash passwords before saving.
 * - Provides methods for password verification and generating JWT access/refresh tokens.
 * - Ensures unique and indexed fields for efficient querying.
 */

