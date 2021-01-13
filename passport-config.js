const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('./models/User');


const { auth } = require('google-auth-library');
const client = auth.fromAPIKey('AIzaSyBn0XdZGYEuIBNOKAWpxy_yAJVSQGWxcrc');

function initialize(passport) {
    const authenticateUser = async (req, email, password, done) => {
		 // Match user
		 console.log('in auth')
		// eturn done(null,user)
        user = await User.findOne({ email: email, guser: req.body.guser })
            // .then(user => {
		if (!user) {
			return done(null, false, { message: 'That email is not registered' });
		}
		console.log(req.body)
		if(req.body.guser){
			var user_gmail = req.body.email
			var idToken = req.body.password; 
			var user_name = req.body.name;
			var user_gid = req.body.gid;
			const res1 =  await client.verifyIdToken({ idToken });
			const { email, name, picture, sub: googleid } = res1.getPayload();

			if(email == user_gmail && user_name == name && googleid == user_gid){
				console.log('ok because google')
				return done(null,user)
			} else {
				console.log("Google not ok")
				return done(null, false, { message: 'Google Sign In incorrect' });
			}		
		}			
		// Match password
		bcrypt.compare(password, user.password, (err, isMatch) => {
			if (err) throw err;
			if (isMatch) {
				return done(null, user);
			} else {
				return done(null, false, { message: 'Password incorrect' });
			}
		})
	// )
    }
    passport.use(new localStrategy({ usernameField: 'email', passReqToCallback: true }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })
}

module.exports = initialize