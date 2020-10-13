const express = require("express");
const mongoose = require("mongoose");
// const session = require('express-session');
const cors = require("cors");
const bcrypt = require('bcrypt');
// const MongoStore = require('connect-mongo')(session);
const jwt = require('jsonwebtoken');
const logger = require('morgan');
require('dotenv').config();
// const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3001;

const db = require("./models");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger('dev'));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/acnh_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

// LOCAL DEV LINK
app.use(cors({
    origin: ["http://localhost:3000"]
}));

// DEPLOYED SITE LINK
// app.use(cors({
//     origin: ["https://awesome-acnh-react.herokuapp.com"],
//     credentials: true,
// }))



const checkAuthStatus = request => {
    if(!request.headers.authorization) {
        // localStorage.removeItem('token');
        return false
    }
    token = request.headers.authorization.split(' ')[1];
    // console.log(token);
    const loggedInUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            // localStorage.removeItem('token');
            return false
        }
        else {
            return data
        };
    })
    // console.log(loggedInUser);
    return loggedInUser;
}


const generateAccessToken = user => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 1000 * 60 * 60
    })
}

// =======================================
// END JWT SETUP
// =======================================


// =====================
// BEGIN ROUTES
// =====================

//.lean() to make JSON object from Mongoose object

app.get("/", (req, res) => {
    res.send("API splash!")
})


app.get("/api/users", (req, res) => {
    db.User.find({})
        .then(dbUser => {
            // console.log(dbUser);
            res.json(dbUser)
        })
        .catch(err => {
            res.json(err);
        });
})



app.post("/userFromToken", (req,res) => {
    // console.log("req.body: ",req.body.token)
    const loggedInUser = jwt.verify(req.body.token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if(err) {
            console.log(err);
            return false
        }
        else {return data}
    })
    console.log(loggedInUser);
    res.json(loggedInUser);
})

// |=============|
// | LOGIN ROUTE |
// |=============|
app.post("/login", (req, res) => {

    // console.log(req.body.username);
    // console.log(req.body.password);

    db.User.findOne({ username: req.body.username })
        .then(dbUser => {
            // console.log(dbUser);
            if (!dbUser) {
                console.log("could not find user");
                res.json("username not found").status(404).end();
            }
            else if (bcrypt.compareSync(req.body.password, dbUser.password)) {
                // user logged int
                // Create JWT
                console.log("success");
                const user = {
                    username: dbUser.username,
                    islandHemisphere: dbUser.islandHemisphere,
                    islandName: dbUser.islandName,
                    id: dbUser._id
                };

                const accessToken = generateAccessToken(user);
 
                // send the JWT to the user
                res.status(200).json({ ...user, accessToken });

                // res.send({ accessToken, refreshToken })

            } else {
                console.log("unsuccess");
                res.json("please check credentials and try again.").status(404);
            }
        }).catch(err => {
            console.log(err);
            res.status(500).send('Please try again.');
        });
})

// to get new access token if the old one has expired
// called manually from the client if the user's token is expired

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    // refreshToken should be saved in DB
    if (!refreshToken) return res.status(401);
    if (!refreshTokens.includes(refreshToken)) return res.status(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403);
        const accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken });
    });
});

app.post('/userFromToken', (req,res) => {
    const loggedInUser = jwt.verify(req.body.token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {return false}
        else {return data};
    })
    res.json(loggedInUser);
})

// REMOVE ACCE
app.delete('/logout', (req, res) => {
    if (!req.body.token) return res.sendStatus(400)
    // remove from DB
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
});


app.get("/users/:id", (req, res) => {
    const loggedInUser = checkAuthStatus(req);
    if(loggedInUser){
    db.User.findOne({ _id: req.params.id })
        .then(dbUser => {
            res.json(dbUser);
        })
    } else {
        res.status(401).send('not logged in');
    }
})

// |=============|
// | CREATE USER |
// |=============|
app.post("/api/users", ({ body }, res) => {
    // console.log(body)
    db.User.create(body)
})

// |================|
// | API GET ROUTES |
// |================|

// GET USER FISH
app.get("/api/fish/:id", (req, res) => {

        db.User.find({ _id: req.params.id })
        .populate('fish')
        .then(dbUser => {
            console.log(dbUser);
            res.json(dbUser);
        })
})

// GET USER BUGS
app.get("/api/bugs/:id", (req, res) => {
    db.User.find({ _id: req.params.id })
    .populate('bugs')
    .then(dbUser => {
        console.log(dbUser);
        res.json(dbUser);
    })
})

// GET USER FOSSILS
app.get("/api/fossils/:id", (req, res) => {
    db.User.find({ _id: req.params.id })
    .populate('fossils')
    .then(dbUser => {
        console.log(dbUser);
        res.json(dbUser);
    })
})

// GET USER HOUSEWARES
app.get("/api/housewares/:id", (req, res) => {
    db.User.find({ _id: req.params.id })
    .populate('housewares')
    .then(dbUser => {
        console.log(dbUser);
        res.json(dbUser);
    })
})

// GET USER MISC
app.get("/api/misc/:id", (req, res) => {
    db.User.find({ _id: req.params.id })
    .populate('miscs')
    .then(dbUser => {
        console.log(dbUser);
        res.json(dbUser);
    })
})

// GET USER SEACREATURES
app.get("/api/seacreatures/:id", (req, res) => {
    db.User.find({ _id: req.params.id })
    .populate('seaCreatures')
    .then(dbUser => {
        console.log(dbUser);
        res.json(dbUser);
    })
})

// GET USER VILLAGERS
app.get("/api/villagers/:id", (req, res) => {
    db.User.find({ _id: req.params.id })
    .populate('villagers')
    .then(dbUser => {
        console.log(dbUser);
        res.json(dbUser);
    })
})

// GET USER WALLMOUNTEDS
app.get("/api/wallmounteds/:id", (req, res) => {
    db.User.find({ _id: req.params.id })
    .populate('wallMounteds')
    .then(dbUser => {
        console.log(dbUser);
        res.json(dbUser);
    })
})

// |==================|
// | SAVE SAVE ROUTES |
// |==================|

// SAVE FISH
app.post("/api/fish/:userid", ({ body, params }, res) => {
    // console.log("body: ", body);
    // console.log("params: ", params);
    // CREATE OBJECT FOR DB
    // ====================
    const fishObj = {
        name: body.name['name-USen'],
        api_id: body.id,
        northernMonthAvail: body['month-array-northern'],
        southernMonthAvail: body['month-array-southern'],
        timeAvail: body.time,
        price: body.price,
        priceCJ: body['price-cj'],
        image: body.image_url,
        icon: body.icon_url,
        catchPhrase: body['catch-phrase'],
        museumPhrase: body['museum-phrase']
    }

    // CHECK DB FOR EXISTING RECORD
    // ============================
    db.Fish.findOne({ api_id : body.id })
    .then(dbResult => {
        console.log(dbResult);
        // IF NO RESULT IN DB
        // CREATE DOCUMENT FIRST
        // =====================
        if(!dbResult){
            db.Fish.create(fishObj)
            .then(data => {
                console.log("data: ", data)
                console.log("new fish saved!")
                // THEN ADD TO USER ASSOC ARRAY
                // ============================
                db.User.findOneAndUpdate({ _id: params.userid }, {$push: { fish: data._id }})
                .then(result => console.log(result))
            })
        } else {
        // RESULT FOUND IN DATABASE 
        // ========================
            console.log("fish already in db, added to user");
            // SAVE RECORD _id TO USER ASSOC ARRAY
            // ===================================
            db.User.findOneAndUpdate({ _id: params.userid }, {$addToSet: { fish: dbResult._id }})
            .then(result => console.log(result))
        }
    })   
})

// SAVE BUGS
app.post("/api/bugs/:userid", ({ body, params }, res) => {
    // console.log("body: ", body);
    // console.log("params: ", params);
    // CREATE OBJECT FOR DB
    // ====================
    const bugObj = {
        name:body.name['name-USen'],
        api_id: body.id,
        northernMonthAvail: body.availability['month-array-northern'],
        southernMonthAvail: body.availability['month-array-southern'],
        timeAvail: body.availability.time,
        location: body.availability.location,
        price: body.price,
        priceFlick: body['price-flick'],
        image: body.image_uri,
        icon: body.icon_uri,
        catchPhrase: body['catch-phrase'],
        museumPhrase: body['museum-phrase']
  
    }
    console.log(bugObj);
    // CHECK DB FOR EXISTING RECORD
    // ============================
    db.Bug.findOne({ api_id : body.id })
    .then(dbResult => {
        console.log(dbResult);
        // IF NO RESULT IN DB
        // CREATE DOCUMENT FIRST
        // =====================
        if(!dbResult){
            db.Bug.create(bugObj)
            .then(data => {
                console.log("data: ", data)
                console.log("new bug saved!")
                // THEN ADD TO USER ASSOC ARRAY
                // ============================
                db.User.findOneAndUpdate({ _id: params.userid }, {$push: { bugs: data._id }})
                .then(result => console.log(result))
            })
        } else {
        // RESULT FOUND IN DATABASE 
        // ========================
            console.log("bug already in db, added to user");
            // SAVE RECORD _id TO USER ASSOC ARRAY
            // ===================================
            db.User.findOneAndUpdate({ _id: params.userid }, {$addToSet: { bugs: dbResult._id }})
            .then(result => console.log(result))
        }
    })   
})

// SAVE FOSSILS
app.post("/api/fossils/:userid", ({ body, params }, res) => {
    // console.log("body: ", body);
    // console.log("params: ", params);
    // CREATE OBJECT FOR DB
    // ====================
    const fossilObj = {
        name: body.name['name-USen'],
        price: body.price,
        museumPhrase: body['museum-phrase'],
        image: body.image_uri,
        api_id: body['file-name'],
        part_of: body['part-of']
    }
    console.log(fossilObj);
    // CHECK DB FOR EXISTING RECORD
    // ============================
    db.Fossil.findOne({ api_id : body['file-name'] })
    .then(dbResult => {
        console.log(dbResult);
        // IF NO RESULT IN DB
        // CREATE DOCUMENT FIRST
        // =====================
        if(!dbResult){
            db.Fossil.create(fossilObj)
            .then(data => {
                console.log("data: ", data)
                console.log("new fossil saved!")
                // THEN ADD TO USER ASSOC ARRAY
                // ============================
                db.User.findOneAndUpdate({ _id: params.userid }, {$push: { fossils: data._id }})
                .then(result => console.log(result))
            })
        } else {
        // RESULT FOUND IN DATABASE 
        // ========================
            console.log("fossil already in db, added to user");
            // SAVE RECORD _id TO USER ASSOC ARRAY
            // ===================================
            db.User.findOneAndUpdate({ _id: params.userid }, {$addToSet: { fossils: dbResult._id }})
            .then(result => console.log(result))
        }
    })   
})

// TODO: SAVE HOUSEWARES
app.post("/api/housewares/:userid", ({ body, params }, res) => {
    // console.log("body: ", body);
    // console.log("params: ", params);
    // CREATE OBJECT FOR DB
    // ====================
    const housewareObj = {
  
    }

    // CHECK DB FOR EXISTING RECORD
    // ============================
    db.Houseware.findOne({ api_id : body.id })
    .then(dbResult => {
        console.log(dbResult);
        // IF NO RESULT IN DB
        // CREATE DOCUMENT FIRST
        // =====================
        if(!dbResult){
            db.Houseware.create(housewareObj)
            .then(data => {
                console.log("data: ", data)
                console.log("new houseware saved!")
                // THEN ADD TO USER ASSOC ARRAY
                // ============================
                db.User.findOneAndUpdate({ _id: params.userid }, {$push: { housewares: data._id }})
                .then(result => console.log(result))
            })
        } else {
        // RESULT FOUND IN DATABASE 
        // ========================
            console.log("houseware already in db, added to user");
            // SAVE RECORD _id TO USER ASSOC ARRAY
            // ===================================
            db.User.findOneAndUpdate({ _id: params.userid }, {$addToSet: { housewares: dbResult._id }})
            .then(result => console.log(result))
        }
    })   
})

// TODO: SAVE MISC
app.post("/api/misc/:userid", ({ body, params }, res) => {
    // console.log("body: ", body);
    // console.log("params: ", params);
    // CREATE OBJECT FOR DB
    // ====================
    const miscObj = {
  
    }

    // CHECK DB FOR EXISTING RECORD
    // ============================
    db.Misc.findOne({ api_id : body.id })
    .then(dbResult => {
        console.log(dbResult);
        // IF NO RESULT IN DB
        // CREATE DOCUMENT FIRST
        // =====================
        if(!dbResult){
            db.Misc.create(miscObj)
            .then(data => {
                console.log("data: ", data)
                console.log("new houseware saved!")
                // THEN ADD TO USER ASSOC ARRAY
                // ============================
                db.User.findOneAndUpdate({ _id: params.userid }, {$push: { misc: data._id }})
                .then(result => console.log(result))
            })
        } else {
        // RESULT FOUND IN DATABASE 
        // ========================
            console.log("houseware already in db, added to user");
            // SAVE RECORD _id TO USER ASSOC ARRAY
            // ===================================
            db.User.findOneAndUpdate({ _id: params.userid }, {$addToSet: { misc: dbResult._id }})
            .then(result => console.log(result))
        }
    })   
})

// SAVE SEACREATURES
app.post("/api/seacreatures/:userid", ({ body, params }, res) => {
    // console.log("body: ", body);
    // console.log("params: ", params);
    // CREATE OBJECT FOR DB
    // ====================
    console.log(body);
    const seaObj = {
        name: body.name['name-USen'],
        api_id: body.id,
        northernMonthAvail: body.availability['month-array-northern'],
        southernMonthAvail: body.availability['month-array-southern'],
        timeAvail: body.availability.time,
        price: body.price,
        image: body.image_uri,
        icon: body.icon_uri,
        catchPhrase: body['catch-phrase'],
        museumPhrase: body['museum-phrase']
    }
    console.log(seaObj);

    // CHECK DB FOR EXISTING RECORD
    // ============================
    db.SeaCreature.findOne({ api_id : body.id })
    .then(dbResult => {
        console.log(dbResult);
        // IF NO RESULT IN DB
        // CREATE DOCUMENT FIRST
        // =====================
        if(!dbResult){
            db.SeaCreature.create(seaObj)
            .then(data => {
                console.log("data: ", data)
                console.log("new sea creature saved!")
                // THEN ADD TO USER ASSOC ARRAY
                // ============================
                db.User.findOneAndUpdate({ _id: params.userid }, {$push: { seaCreatures: data._id }})
                .then(result => console.log(result))
            })
        } else {
        // RESULT FOUND IN DATABASE 
        // ========================
            console.log("sea creature already in db, added to user");
            // SAVE RECORD _id TO USER ASSOC ARRAY
            // ===================================
            db.User.findOneAndUpdate({ _id: params.userid }, {$addToSet: { seaCreatures: dbResult._id }})
            .then(result => console.log(result))
        }
    })   
})

// SAVE VILLAGERS
app.post("/api/villagers/:userid", ({ body, params }, res) => {
    // console.log("body: ", body);
    // console.log("params: ", params);
    // CREATE OBJECT FOR DB
    // ====================
    const villagerObj = {
        name: body.name['name-USen'],
        personality: body.personality,
        birthdayString: body['birthday-string'],
        species: body.species,
        gender: body.gender,
        catchPhrase: body['catch-phrase'],
        hobby: body.hobby,
        bubbleColor: body['bubble-color'],
        textColor: body['text-color'],
        saying: body.saying,
        icon: body.icon_uri,
        image: body.image_uri,
        api_id: body['file-name']
    }
    console.log(villagerObj);
    // CHECK DB FOR EXISTING RECORD
    // ============================
    db.Villager.findOne({ api_id : body['file-name'] })
    .then(dbResult => {
        console.log(dbResult);
        // IF NO RESULT IN DB
        // CREATE DOCUMENT FIRST
        // =====================
        if(!dbResult){
            db.Villager.create(villagerObj)
            .then(data => {
                console.log("data: ", data)
                console.log("new fossil saved!")
                // THEN ADD TO USER ASSOC ARRAY
                // ============================
                db.User.findOneAndUpdate({ _id: params.userid }, {$push: { villagers: data._id }})
                .then(result => console.log(result))
            })
        } else {
        // RESULT FOUND IN DATABASE 
        // ========================
            console.log("fossil already in db, added to user");
            // SAVE RECORD _id TO USER ASSOC ARRAY
            // ===================================
            db.User.findOneAndUpdate({ _id: params.userid }, {$addToSet: { villagers: dbResult._id }})
            .then(result => console.log(result))
        }
    })   
})

// TODO: SAVE HOUSEWARES
app.post("/api/villagers/:userid", ({ body, params }, res) => {
    // console.log("body: ", body);
    // console.log("params: ", params);
    // CREATE OBJECT FOR DB
    // ====================
    const villagerObj = {
  
    }

    // CHECK DB FOR EXISTING RECORD
    // ============================
    db.Villager.findOne({ api_id : body.id })
    .then(dbResult => {
        console.log(dbResult);
        // IF NO RESULT IN DB
        // CREATE DOCUMENT FIRST
        // =====================
        if(!dbResult){
            db.Villager.create(housewareObj)
            .then(data => {
                console.log("data: ", data)
                console.log("new houseware saved!")
                // THEN ADD TO USER ASSOC ARRAY
                // ============================
                db.User.findOneAndUpdate({ _id: params.userid }, {$push: { villagers: data._id }})
                .then(result => console.log(result))
            })
        } else {
        // RESULT FOUND IN DATABASE 
        // ========================
            console.log("houseware already in db, added to user");
            // SAVE RECORD _id TO USER ASSOC ARRAY
            // ===================================
            db.User.findOneAndUpdate({ _id: params.userid }, {$addToSet: { villagers: dbResult._id }})
            .then(result => console.log(result))
        }
    })   
})

// TODO: SAVE WALLMOUNTEDS
app.post("/api/fossils/:userid", ({ body, params }, res) => {
    // console.log("body: ", body);
    // console.log("params: ", params);
    // CREATE OBJECT FOR DB
    // ====================
    const fossilObj = {
  
    }

    // CHECK DB FOR EXISTING RECORD
    // ============================
    db.Fossil.findOne({ api_id : body.id })
    .then(dbResult => {
        console.log(dbResult);
        // IF NO RESULT IN DB
        // CREATE DOCUMENT FIRST
        // =====================
        if(!dbResult){
            db.Fossil.create(fossilObj)
            .then(data => {
                console.log("data: ", data)
                console.log("new bug saved!")
                // THEN ADD TO USER ASSOC ARRAY
                // ============================
                db.User.findOneAndUpdate({ _id: params.userid }, {$push: { fossils: data._id }})
                .then(result => console.log(result))
            })
        } else {
        // RESULT FOUND IN DATABASE 
        // ========================
            console.log("bug already in db, added to user");
            // SAVE RECORD _id TO USER ASSOC ARRAY
            // ===================================
            db.User.findOneAndUpdate({ _id: params.userid }, {$addToSet: { fossils: dbResult._id }})
            .then(result => console.log(result))
        }
    })   
})

// TODO: SAVE HOUSEWARES
app.post("/api/wallmounted/:userid", ({ body, params }, res) => {
    // console.log("body: ", body);
    // console.log("params: ", params);
    // CREATE OBJECT FOR DB
    // ====================
    const wallMountedObj = {
  
    }

    // CHECK DB FOR EXISTING RECORD
    // ============================
    db.WallMounted.findOne({ api_id : body.id })
    .then(dbResult => {
        console.log(dbResult);
        // IF NO RESULT IN DB
        // CREATE DOCUMENT FIRST
        // =====================
        if(!dbResult){
            db.WallMounted.create(housewareObj)
            .then(data => {
                console.log("data: ", data)
                console.log("new houseware saved!")
                // THEN ADD TO USER ASSOC ARRAY
                // ============================
                db.User.findOneAndUpdate({ _id: params.userid }, {$push: { wallMounteds: data._id }})
                .then(result => console.log(result))
            })
        } else {
        // RESULT FOUND IN DATABASE 
        // ========================
            console.log("houseware already in db, added to user");
            // SAVE RECORD _id TO USER ASSOC ARRAY
            // ===================================
            db.User.findOneAndUpdate({ _id: params.userid }, {$addToSet: { wallMounteds: dbResult._id }})
            .then(result => console.log(result))
        }
    })   
})




app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});
