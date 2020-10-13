const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const HousewareSchema = new Schema({
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
    api_id: {
        type: Number
    },
    sourceDetail: {
        type: String
    }

})



const Houseware = mongoose.model("Houseware", HousewareSchema);

module.exports = Houseware;