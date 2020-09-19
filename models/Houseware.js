const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const HousewareSchema = new Schema({
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
    },
    tag: {
        type: String
    },
    image: {
        type: String
    },
    size: {
        type: String
    },
    source: {
        type: String
    },
    sourceDetail: {
        type: String
    }

})



const Houseware = mongoose.model("Houseware", HousewareSchema);

module.exports = Houseware;