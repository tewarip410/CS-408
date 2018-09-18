const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = Schema({
  name: String,
  email: String,
  googleId: String  
});

userSchema.statics.findOrCreate = async (profile, callback) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      // TODO pull profile info from Google profile and set it in db
      return callback(null, user);
    }
    user = await User.create({ 
      email: profile.emails[0].value,
      googleId: profile.id,
      name: profile.displayName
    });
    return callback(null, user);
  } catch (err) {
    return callback(err, false);
  }
}

const User = mongoose.model('User', userSchema);

module.exports = User;
