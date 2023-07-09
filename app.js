if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

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
        // secure: true, -> cookies are accessible only thru http only (http-secure)
        expires: Date.now() + (1000 * 24 * 60 * 60 * 7), //in milliseconds
        maxAge: 1000 * 24 * 60 * 60 * 7,
    }
}


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
    "http://cdn.jsdelivr.net/npm/",
    "http://api.tiles.mapbox.com/",
    "http://api.mapbox.com/",
    "http://kit.fontawesome.com/",
    "http://cdnjs.cloudflare.com/",
    "http://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "http://cdn.jsdelivr.net/npm/",
    "http://kit-free.fontawesome.com/",
    "http://stackpath.bootstrapcdn.com/",
    "http://api.mapbox.com/",
    "http://api.tiles.mapbox.com/",
    "http://fonts.googleapis.com/",
    "http://use.fontawesome.com/",
];
const connectSrcUrls = [
    "http://api.mapbox.com/",
    "http://a.tiles.mapbox.com/",
    "http://b.tiles.mapbox.com/",
    "http://events.mapbox.com/",
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
            "http://res.cloudinary.com/dqevklduu/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
            "http://images.unsplash.com/",
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