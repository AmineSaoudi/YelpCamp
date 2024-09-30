let dbUrl;

if (process.env.NODE_ENV !== "production") {
    // IE IF WE'RE IN DEVELOPMENT
    require('dotenv').config();
    dbUrl = "mongodb://localhost:27017/yelp-camp"

}else{
    // IE IF WE'RE IN PRODUCTION
    dbUrl = process.env.DB_URL
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const ExpressError = require("./utils/ExpressError");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const User = require("./models/user");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const session = require("express-session");
const flash = require("connect-flash");

const MongoDBStore = require("connect-mongo")


// brew services start mongodb/brew/mongodb-community@7.0
// brew services stop mongodb/brew/mongodb-community@7.0

console.log(dbUrl)
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//Ejs Engine
app.engine("ejs", ejsMate);

//Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize({
    replaceWith: '_'
}))
app.use(helmet({ contentSecurityPolicy: false }));


//Session

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    crypto: {
        secret: 'secretkey'
    },
    touchAfter: 24*60*60
})

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    secret: "secretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        name: 'sess',
        httpOnly: true,
        // secure: true,
        expires: 1000 * 60 * 60 * 20 * 7,
        maxAge: 1000 * 60 * 60 * 20 * 7,
    },
};

app.use(session(sessionConfig));

//Flash
app.use(flash());



//Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Res.locals
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    return next();
});

//Routes
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.get("/", (req, res) => {
    res.render("home");
});

app.all("*", (req, res, next) => {
    next(new ExpressError("Invalid Link", 404));
});

//Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Serving on ${port}`);
});
