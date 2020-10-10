const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const UserSchema = new Schema({

    username: {
        type: String,
        trim: true,
        required: "Username",
        index: {
            unique: true
        }
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
    },
    refreshToken: String

   

})

// BCRYPT PASSWORD ENCRYPTION
UserSchema.pre('save', async function save(next) {
    if (!this.isModified('password')) return next();
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      return next();
    } catch (err) {
      return next(err);
    }
  });
  
  UserSchema.methods.validatePassword = async function validatePassword(data) {
    return bcrypt.compare(data, this.password);
  };

const User = mongoose.model("User", UserSchema);

module.exports = User;