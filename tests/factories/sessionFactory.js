const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
// this is where we store the cookie key
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

// this is a helper function to create a session object
// which helps to simulate a logged in user, during testing
module.exports = (user) => {
  const sessionObject = {
    passport: {
      user: user._id.toString(),
    },
  };
  // user Buffer to create a base64 encoded string of the user id
  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');

  const sig = keygrip.sign('session=' + session);

  return { session, sig };
};
