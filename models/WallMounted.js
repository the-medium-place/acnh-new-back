const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WallMountedSchema = new Schema({
    user_id: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    name: {
        type: String
    },
    buyPrice: {
        type: Number
    },
    sellPrice: {
        type: Number
    }

})



const WallMounted = mongoose.model("WallMounted", WallMountedSchema);

module.exports = WallMounted;