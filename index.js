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

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.use(session({
    secret: SECRET,
    maxAge: 1000 * 60 * 60 *24, // 1 Day
    saveUninitialized: false
}))

passport.use(new DiscordStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: scopes
}, function (accessToken, refreshToken, profile, done) {
    console.log(profile)
    DashboardUserModel.find()
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

aapp.get('/oauth/discord',passport.authenticate('discord'));
app.get('/oauth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), function(req, res) {
    console.log('Login success')
    res.redirect('http://localhost:3000')
});
app.get('oauth/discord/logout', (req, res) => {

});