browser console

Meteor.call("sendMessage", "hello from the console")

mongo console

db.messages.insert({text: "hello from Mongo", createdAt: new Date, username: "mongo console"})

accounts packages

meteor add accounts-ui accounts-password accounts-facebook
