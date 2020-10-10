const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
// var exphbs = require("express-handlebars");
const cors = require("cors");
const bcrypt = require('bcrypt')

const PORT = process.env.PORT || 3001;


const db = require("./models");

const app = express();
// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.use(express.static("public"));


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

//Set up express-session to save user sessions
app.use(session({
    secret: "keyboard cat",
    resave: true,
    // add store method here later!!
    saveUninitialized: true,
    cookie: {
        maxAge: 720000
    }
}))


//.lean() to make JSON object from Mongoose object

app.get("/api/users", (req, res) => {
    db.User.find({})
        // .populate("exercises").sort({date:-1}).lean() 
        .then(dbUser => {
            // console.log(dbUser);
            res.send(dbUser)
        })
        .catch(err => {
            res.json(err);
        });
})

app.post("/api/users", ({ body }, res) => {
    // console.log(body)
    db.User.create(body)
})

app.get("/", (req, res) => {
    res.send("API splash!")
})

app.post("/login", (req, res) => {

    // console.log(req.body.username);
    // console.log(req.body.password);

    db.User.findOne({ username: req.body.username })
        .then(dbUser => {
            console.log(dbUser);
            if (!dbUser) {
                req.session.user = false;
                console.log("could not find user");
                res.status(404).end();
            }
            if (bcrypt.compareSync(req.body.password, dbUser.password)) {
                // req.session.username = dbUser.username;
                // req.session.hemisphere = dbUser.islandHemisphere;
                // req.session.islaneName = dbUser.islandName

                req.session.user = {
                    username: dbUser.username,
                    id: dbUser._id,
                    islandHemisphere: dbUser.islandHemisphere,
                    islandName: dbUser.islandName
                }
                console.log("success");
                console.log(req.session);
                // res.redirect('/view-events');
                // res.redirect("/");
                res.json(req.session).status(200).end();
            } else {
                console.log("unsuccess");
                req.sessions.user = false;
                res.status(404).end();
                // res.redirect('/');
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
})

app.get('/readsessions', (req,res) => {
    res.json(req.session);
})
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
