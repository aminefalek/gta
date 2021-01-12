const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('./models/User');

function initialize(passport) {
    const authenticateUser = async (req, email, password, done) => {
		 // Match user
		 console.log('in auth')
		// eturn done(null,user)
        User.findOne({ email: email, guser: req.body.guser })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'That email is not registered' });
				}
				console.log(req.body)
				if(req.body.guser){
					console.log('ok because google')
					return done(null,user)
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
            })
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