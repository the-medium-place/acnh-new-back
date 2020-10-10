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
// app.use(cors({
//     origin: ["http://localhost:3000"]
// }));

// DEPLOYED SITE LINK
app.use(cors({
    origin: ["https://awesome-acnh-react.herokuapp.com"],
    credentials: true,
}))



const checkAuthStatus = request => {
    if(!request.headers.authorization) {
        return false
    }
    token = request.headers.authorization.split(' ')[1];
    // console.log(token);
    const loggedInUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) return false
        else return data;
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

app.post("/api/users", ({ body }, res) => {
    // console.log(body)
    db.User.create(body)
})

app.get("/readsessions", (req, res) => {
    res.json(req.session);
    // db.getCollection('sessions').findOne({}).then(dbSession => res.json(dbSession))
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
    // console.log(loggedInUser);
    res.json(loggedInUser);
})

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

// remove the access token
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




app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});
