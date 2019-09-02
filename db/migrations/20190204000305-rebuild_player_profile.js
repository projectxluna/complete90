function migrateProfile () {
  var profiles = db.user_profile.find();
  profiles.forEach(function(p) {
    db.user_profile.update({ _id: p._id }, {
      "$set": {
        "profiles":[  
          {
            "jersey" : "",
            "age" : "",
            "foot" : p.foot || "",
            "position" : p.position || "",
            "height" : p.height || "",
            "type" : "PLAYER"
          }
        ],
      },
      "$unset": {
        "height": "",
        "position": "",
        "foot": ""
      },
    });
  });
}

db.user_profile.bulkWrite(updates, function (result) {
  console.log(result)
});
migrateProfile();
// mongo --host mongo.internal.lucova.com lucova_payment --eval "load('/tmp/real_fruit_app_users.js')" > input.json