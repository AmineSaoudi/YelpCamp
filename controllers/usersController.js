const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')

module.exports.registerUser = catchAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const preUser = new User({ username, email });
        const postUser = await User.register(preUser, password);
        req.login(postUser, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', 'A user with that username or email already exists')
        res.redirect('/register')
    }
})

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}
module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back');
    const returnUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(returnUrl)
}
module.exports.logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'Logged you out!')
        res.redirect('/campgrounds');
    });
}

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}