const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({

    username: {
        type: String,
        trim: true,
        required: "Username"
    },
    userEmail: {
        type: String,
        trim: true,
        required: "User Email Address"
    },
    islandName: {
        type: String,
        trim: true,
        required: "User Island Name"
    },
    islandHemisphere: {
        type: String,
        trim: true,
        required: "Northern or Southern Hemisphere"
    },
    password: {
        type: String,
        trim: true,
        required: "Password"
    }

})



const User = mongoose.model("User", UserSchema);

module.exports = User;