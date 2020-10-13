const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FossilSchema = new Schema({
    name: {
        type: String
    },
    price: {
        type: Number
    },
    museumPhrase: {
        type: String
    },
    image: {
        type: String
    },
    api_id: {
        type: String
    },
    part_of: String

})



const Fossil = mongoose.model("Fossil", FossilSchema);

module.exports = Fossil;