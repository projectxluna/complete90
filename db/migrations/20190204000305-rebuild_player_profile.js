module.exports = {
  up(db) {
    return new Promise((resolve, reject) => {
      var profiles = db.collection('user_profile').find({
        "$or": [
          { "height": { $ne: null } },
          { "position": { $ne: null } },
          { "foot": { $ne: null } }
        ]
      });
      var updates = [];
      profiles.forEach(p => {
        updates.push({
          "updateOne": {
            "filter" : {_id: p._id},
            "update" : {
              "$set": { // Set new property called playerProfile
                "playerProfile": {
                  "height": p.height || "",
                  "position": p.position || "",
                  "foot": p.foot || ""
                }
              },
              "$unset": { // Cleanup old properties
                "height": "",
                "position": "",
                "foot": ""
              },
            }
          }
        });
      });
      db.collection('user_profile').bulkWrite(updates, function(result) {
        resolve();
      });
    });
  },

  down(db) {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }
};
