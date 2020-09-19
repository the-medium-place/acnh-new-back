const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FishSchema = new Schema({
    name: {
        type: String,
        required: "Fish Name",
    },
    api_id: {
        type: Number
    },
    user_id: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    northernMonthAvail: {
        type: Array
    },
    southernMonthAvail: {
        type: Array
    },
    timeAvail: {
        type: Array
    },
    price: {
        type: Number
    },
    priceCJ: {
        type: Number
    },
    image: {
        type: String
    },
    icon: {
        type: String
    },
    catchPhrase: {
        type: Text
    },
    museumPhrase: {
        type: Text
    }

})



const Fish = mongoose.model("Fish", FishSchema);

module.exports = Fish;