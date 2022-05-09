require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const passport = require('passport');
const DiscordStrategy = require('passport-discord');

const PORT = process.env.PORT | 3001;

const ticketModel = require('./models/ticket_schema');
const DashboardUserModel = require('./models/dashboardUser_schema');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SECRET = process.env.SECRET;

const CALLBACK_URL = "/oauth/discord/callback";

const jwt = require('jsonwebtoken');
const CommandModel = require('./models/command_schema');

let scopes = ['identify', 'email', 'guilds'];

mongoose.connect(process.env.MONGO_ID,{
	useNewUrlParser: true,
	useUnifiedTopology: true,
	keepAlive: true,
}).then(()=>{
	console.log("Database Connection established.");
}).catch((err) => {
	console.log("Error connecting to Mongo database.");
	console.log(err);
});

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));

app.use(passport.initialize());

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});



passport.use(new DiscordStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: scopes
}, async function (accessToken, refreshToken, profile, done) {
    console.log(profile)
    try{
        let user = await DashboardUserModel.findOne({email: profile.email})
        if(!user) {
            const newUser = new DashboardUserModel({
                email: profile.email,
                username: profile.username,
                id: profile.id,
                accessToken: profile.accessToken,
            });
            await newUser.save();
            return done(null, newUser)
        } else {
            await user.updateOne({accessToken: profile.accessToken});
            return done(null, user)
        }
    } catch(err) {
        return done(err, profile)
    }
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

app.get('/tickets', async (req, res) => {
    const tickets = await ticketModel.find();
    res.json(tickets);
});

app.get('/oauth/discord',passport.authenticate('discord'));
app.get('/oauth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), function(req, res, next) {
    const token = jwt.sign({id: req.user.id}, SECRET, {expiresIn: 60 * 60 * 24 * 1000})
    req.logIn(req.user, function(err) {
        if (err) return next(err); ;
        res.redirect(`http://localhost:3000?token=${token}`)
      });
});

app.post('/command', async (req, res) => {
    const command = new CommandModel({
        id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        response: req.body.response,
    })
    command.save();
    res.sendStatus(200)
})

app.use((req,res,next)=> {
    const token = req.headers['authorization'];
    jwt.verify(token, SECRET, function(err, data){
        if (err) {
            res.status(401).send({error: "NotAuthorized" })
        } else {
            req.user = data;
            next();
        }
    })
})

app.get('/profile', async (req, res) => {
    const user = await DashboardUserModel.findOne({id: req.user.id})
    console.log(user);
    res.json(user);
})
