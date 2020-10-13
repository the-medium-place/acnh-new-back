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
    northernMonthAvail: {
        type: Array
    },
    southernMonthAvail: {
        type: Array
    },
    timeAvail: {
        type: String
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
        type: String
    },
    museumPhrase: {
        type: String
    }

})



const Fish = mongoose.model("Fish", FishSchema);

module.exports = Fish;