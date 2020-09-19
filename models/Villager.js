const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const VillagerSchema = new Schema({
    user_id: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    name: {
        type: String
    },
    personality: {
        type: String
    },
    birthdayString: {
        type: String
    },
    birthdayDate: {
        type: String
    },
    species: {
        type: String
    },
    gender: {
        type: String
    },
    catchPhrase: {
        type: String
    },
    icon: {
        type: String
    },
    image: {
        type: String
    }

})



const Villager = mongoose.model("Villager", VillagerSchema);

module.exports = Villager;