Meteor.methods({
  joingame: function(options) {
    check(options, {
      key: String,
      position: String
    });

    //Check if the game key is valid
    //Check if this position is available
    //If true, assign the position to this person
    //return success
    if (checkGameKey) {
      return {
        success: true,
        gamekey: options.key
      };
    } else {
      return {
        success: false,
        message: 'The provided key is incorrect'
      };
    }
  },
  submitOrder: function(options) {
    check(options, {
      outOrder: Number
    });

    return true;
  },
  checkGameKey: function(key) {
    check(key, String);

    return {
      success: checkGameKey(key)
    };
  }
});

let checkGameKey = function(key) {
  return true;
};
