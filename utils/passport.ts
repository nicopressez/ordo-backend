import { Strategy as LocalStrategy} from "passport-local"
import passport from "passport"
import bcrypt from "bcryptjs"


import User from "../models/user"

type User = {
    _id?: string,
};

passport.use(new LocalStrategy(
    async (email, password, done) => {
        try{
            // Check DB for user with email
            const user = await User.findOne({email:email});
            if (!user) {
                return done(null,false,{message: "No user found with this email and password combination."})
            }

            // Check password match
            const match = bcrypt.compare(password, user.password);
            if (!match) {
                return done(null,false, {message: "No user found with this email and password combination."})
            }

            return done(null,user)
        }catch(err) {
            return done(err);
        }
    }
));

passport.serializeUser((user: User, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id,done) => {
    try{
        const user = await User.findById(id);
        done(null,user);
    } catch (err) {
        done(err);
    }
  });
  
  export default passport;