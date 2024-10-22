const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = Schema({
  name: String,
  email: String,
  googleId: String,
  googleImg: String,
  bio: String

});

userSchema.statics.findOrCreate = async (profile, callback) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      user.googleImg = profile._json.image.url;
      user.email = profile.emails[0].value;
      await user.save();
      return callback(null, user);
    }
    // need _json for some reason... idk google is weird :(
    user = await User.create({
      email: profile.emails[0].value,
      googleId: profile.id,
      name: profile.displayName,
      googleImg: profile._json.image.url
    });
    return callback(null, user);
  } catch (err) {
    return callback(err, false);
  }
}

const User = mongoose.model('User', userSchema);

module.exports = User;
