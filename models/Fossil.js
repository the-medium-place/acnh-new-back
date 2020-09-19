const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FossilSchema = new Schema({
    user_id: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
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
    }

})



const Fossil = mongoose.model("Fossil", FossilSchema);

module.exports = Fossil;