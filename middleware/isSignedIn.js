// middleware/is-signed-in.js

const isSignedIn = (req, res, next) => {
    // Check if the user is signed in by checking the session
    if (req.session.user) {
        // User is signed in, proceed to the next middleware or route handler
        return next();
    } else {
        // User is not signed in, redirect to the login page
        res.redirect('/auth/sign-in');
    }
}
module.exports = isSignedIn;