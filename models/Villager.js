const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const VillagerSchema = new Schema({
    name: {
        type: String
    },
    personality: {
        type: String
    },
    birthdayString: {
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
    hobby: String,

    bubbleColor: String,

    textColor: String,

    saying: String,  
      
    icon: {
        type: String
    },
    image: {
        type: String
    },
    api_id: String

})



const Villager = mongoose.model("Villager", VillagerSchema);

module.exports = Villager;