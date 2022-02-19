const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.login = async (req, res, next) => {
    req.flash('success',  `Welcome back to YelpCamp!!` );
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
    //to return to the page from where log in was required
}

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const newUser = await User.register(user, password);
        req.login(newUser, (err)=>{
            if(err) next(err);
            req.flash('success', `Hey, ${newUser.username}!! Welcome to YelpCamp!!`);
            return res.redirect('/campgrounds')
        }); 
    }
    catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }

}

module.exports.logout = (req, res) => {
    req.logOut();
    req.flash('success',"Goodbye, You've Successfully logged out");
    res.redirect('/campgrounds');
}