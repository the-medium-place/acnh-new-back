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

// ====================================
// BEGIN JWT TRIAL
// ====================================
// CHECK FOR JWT TOKEN
// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorizatioin'];

//     // if the header doesn't eist, token will be undefined
//     const token = authHeader && authHeader.split(' ')[1];
//     console.log(token);

//     if (!token) return res.status(401).json({ message: 'Invalid token' })

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) return res.status(403).json({ message: 'Invalid token' });
//         // valid token
//         req.user = user;
//         next();
//     })
// }

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



// LOCAL DEV LINK
// app.use(cors({
//     origin: ["http://localhost:3000"]
// }));

// DEPLOYED SITE LINK
app.use(cors({
    origin: ["https://awesome-acnh-react.herokuapp.com"]
}))


//Set up express-session to save user sessions
// app.use(session({
//     secret: "keyboard cat",
//     store: new MongoStore({
//         // mongooseConnection: db,
//         port: PORT,
//         collections: 'sessions',
//         url: process.env.MONGODB_URI || "mongodb://localhost/acnh_db"
//     }),
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 2 * 60 * 60 * 1000
//     },

// }))

// =====================
// BEGIN ROUTES
// =====================

//.lean() to make JSON object from Mongoose object

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
// app.use((req, res, next) => {
//     if (req.cookies.user_sid && !req.session.username) {
//         res.clearCookie('user_sid');        
//     }
//     next();
// });

app.post("/api/users", ({ body }, res) => {
    // console.log(body)
    db.User.create(body)
})

app.get("/", (req, res) => {
    res.send("API splash!")
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






// db.User
//   .findOne({
//     where: {
//       username: req.body.username 
//     }
//   })
//   .then((dbUser) => {
//     if (dbUser.username === null) {
//       console.log("could not find user");
//       res.status(404).end();
//     }
//     if (bcrypt.compareSync(req.body.password, dbUser.password)) {
//       req.session.username = dbUser;
//       console.log("success");
//       // res.redirect('/view-events');
//       res.redirect("/view-events");
//       res.status(200).end();
//     } else {
//       console.log("unsuccess");
//       res.redirect("/login-fail");
//       res.status(404).end();
//       // res.redirect('/');
//     }
//   });


// TEST USER COLLECTION
// db.User.create({
//     username: 'zgstowel',
//     userEmail: 'zgstowell@gmail.com',
//     islandName: 'Para-Docks',
//     islandHemisphere: 'northern',
//     password: 'password',

// })



// app.post("/api/exercises", ({ body }, res) => {
//     const newObj = {
//         name: body.name,
//         count: body.count,
//         unit: body.unit,
//         notes: body.notes
//     }
//     console.log("server side")
//     console.table(newObj);

//     db.Exercise.create(newObj)
//         .then(({ _id }) => db.Workout.findOneAndUpdate({_id: body._id}, { $push: { exercises: _id } }, { new: true }))
//         .then(dbWorkout => {
//             console.log(dbWorkout);
//             res.send(dbWorkout);
//         })
//         .catch(err => {
//             console.log(err);
//             res.send(err);
//         })
// })

// app.put("/api/exercises", (req, res) => {

//     db.Exercise.findOneAndUpdate({_id: req.body._id}, req.body, { new: true })
// // WORKING HERE RIGHT NOW FIGURE OUT HOW TO UPDAT THE INFO ON THE FOUND INFO
//     .then(dbExercise => {
//         res.send(dbExercise);
//         console.log(dbExercise);
//     })
//     .catch(err => {
//         res.send(err);
//         console.log(err);
//     })

// })

// app.get("/populatedworkouts", (req, res) => {
//     db.Workout.find({}).sort({date:'asc'})
//         .populate("exercises")
//         .then(dbWorkout => {
//             // dbWorkout = dbWorkout.reverse();
//             res.render({workouts: dbWorkout})
//             // res.json(dbWorkout);
//         })
//         .catch(err => {
//             res.json(err);
//         });
// })



// app.post("/api/workouts", ({ body }, res) => {

//     db.Workout.create({ name: body.name })
//         .then(dbWorkout => {
//             console.log(dbWorkout);

//             res.send(dbWorkout)
//             // displayWorkout();
//         })
//         .catch(({ message }) => {
//             console.log(message);


//         });
// });


// app.delete("/api/exercises", ({ body }, res) => {
//     db.Exercise.deleteOne({_id: body._id}, function(err) {
//         if(err) throw err;
//         console.log("successful deletion");
//         res.redirect("/")
//     })
// })

// app.delete("/api/workouts", ({ body }, res) => {
//     db.Workout.deleteOne({_id: body._id}, function(err){
//         if(err) throw err;
//         console.log('successful deletion');
//         res.redirect("/")
//     })
// })


app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});
