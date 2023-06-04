if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const mongoose = require('mongoose');
const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review = require('./models/review');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require("connect-mongo");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/YelpCamp";

const secret = 'thishouldbeasecret';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
});
const db = mongoose.connection;
db.on('error', err => {
    console.log(err);
});
db.once('open', () => {
    console.log("database connected".toUpperCase());
})

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60, //seconds
})


const sessionConfig = {
    store,
    name: 'session', //-> to avoid someone looking for connect.sid we use other names to protect user session
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, -> cookies are accessible only thru https only (http-secure)
        expires: Date.now() + (1000 * 24 * 60 * 60 * 7), //in milliseconds
        maxAge: 1000 * 24 * 60 * 60 * 7,
    }
}

const firebaseConfig = {
    apiKey: "AIzaSyCG1oJNymI8a24qwZK0QlsfCrX6Tbe9s4E",
    authDomain: "travellure-c1015.firebaseapp.com",
    projectId: "travellure-c1015",
    storageBucket: "travellure-c1015.appspot.com",
    messagingSenderId: "1004788136442",
    appId: "1:1004788136442:web:e70b76551d60f0c6618c43",
    measurementId: "G-6TTGN22JFJ",
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseapp);


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(session(sessionConfig));
app.use(flash());
app.use(mongoSanitize({
    replaceWith: '_'
}));


const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/npm/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(helmet.contentSecurityPolicy({
    directives: {
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dqevklduu/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
            "https://images.unsplash.com/",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
    },
}));
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

app.use(passport.authenticate('session'));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

const campgroundsRouter = require('./routes/campgrounds');
app.use('/campgrounds', campgroundsRouter);

const reviewRouter = require('./routes/reviews');
app.use('/campgrounds/:id/reviews', reviewRouter);

const userRouter = require('./routes/users');
app.use('/', userRouter);

const searchRouter = require('./routes/search');
app.use('/search', searchRouter);

app.get('/', (req, res) => {
    res.render('home');
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    res.status(status).render('error', { err });
    // next(err);
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`SERVING ON PORT ${port}`);
})