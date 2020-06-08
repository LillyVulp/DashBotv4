//Import variables

var globals = require("./globals.js");
var parseMessage = require("./parseMessage.js");

//Login to Discord

getToken();

//Set initial presence

globals.bot.on("ready", function() {
  setBotPresence("default");
});

//Set up HTTP server

const server = globals.http.createServer(runServer).listen(process.env.PORT);

//Listen for messages sent to bot

globals.bot.on("message", parseMessage);

function setBotPresence(presenceName) {

  globals.fs.readFile(__dirname + "/presence.xml", function(err, result) {
    if(err) {
      console.log("An error occured while reading the presence file. " + err);
    }
    else {
      globals.parseXML(result, function(err, data) {
        if(err) {
          console.log("An error occured while processing the presence file. " + err);
        }
        else {
          var selectedPresence = data.presences[presenceName];
          if(selectedPresence == null) {
            console.log("Presence " + presenceName + " could not be found. Switching to default");
            presenceName = "default";
            selectedPresence = data.presences["default"];
            if(selectedPresence == null) {
              console.log("Default presence could not be found. Presence not set");
              return;
            }
          }
          selectedPresence = selectedPresence[0];
          globals.bot.user.setPresence({game: {name: selectedPresence["text"][0]}, status: selectedPresence["status"][0]}).then(function() {
            console.log("Presence set to " + presenceName);
          }).catch(function(err) {
            console.log("An error occured while setting presence. " + err);
          });

        }
      });
    }
  })

}

async function getToken() {

  console.log("Fetching token");

  globals.database.get(globals.database.key(['keys', 'discord']), login);

}

async function login(err, result) {

  if(err) {

    globals.errorHandle(err, "Database Connection - Discord Key Fetch", true);

  }

  else {

    console.log("Logging in");

    globals.bot.login(result.token).then(function() {
      console.log(("Login successful"));
    }).catch(function(err) {
      globals.errorHandle(err, "Discord Login", true);
    });

  }

}

function runServer(request, response) {

  response.writeHead(200, {
    'Content-Type': 'text/html',
  });

  var filePath = globals.path.join(__dirname, 'main.html');
  var readStream = globals.fs.createReadStream(filePath);
  readStream.pipe(response);

}
