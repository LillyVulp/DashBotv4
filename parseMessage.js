const globals = require("./globals.js");

async function parseMessage(message) {

  if(message.channel.type == "dm" || message.author.bot) {

    return;

  }

  else if(message.content.toLowerCase() == "no u") {

	globals.sendMessage(message.channel.id, "Reverse");

  }

  else if(message.content.startsWith("<@" + selfID + ">") || message.content.startsWith("<@!" + selfID + ">")) {

	const spaceIndex = message.content.indexOf(" ");

	if(spaceIndex == -1) {

		globals.sendMessage(message.channel.id, "Yes?");
	
	}

	else {

		var trimmedContent = message.content.substring(spaceIndex+1, message.content.length);

		globals.request("https://www.pandorabots.com/pandora/talk-xml?botid=" + process.env.pandoraID + "&input=" + encodeURIComponent(trimmedContent) + "&custid=" + message.author.id + "337", function(err, response, body) {

			if(err) {

				globals.errorHandle(err, "Error connecting to PandoraBot", false);

				globals.sendMessage(message.channel.id, "Ughh... I got a headache, ask me later");

			}

			else if(response.statusCode == 200) {

				var start = body.indexOf("<that>");
				var end = body.indexOf("</that>");
				body = body.substring(start + 6, end);
				body = body.replace(/&lt;br&gt;/g, "\n");
				body = body.replace(/&quot;/g, "\"");

				globals.sendMessage(message.channel.id, body);

			}

			else {

				globals.errorHandle(response.statusCode, "Invalid PandoraBot Status Code", false);

				globals.sendMessage(message.channel.id, "W... what's happening... w-what's going on... AAAAAAAAA");

			}

		});

	}

  }

  else {

    globals.database.runQuery(globals.database.createQuery("servers")).then(function(result) {

      var guild = "NotFound";

      if(result.length > 1) {

        var results = result[0];

        for(var i=0; i<results.length; i++) {

          if(results[i].id == message.guild.id) {

            guild = i;
            break;

          }

        }

        if(guild == "NotFound") {

          const taskKey = globals.database.key(["servers"]);

          const data = {
            key: taskKey,
            data: {
              id: message.guild.id,
              prefix: "d!"
            }
          }

          globals.database.save(data).then(function() {

            parseMessage(message);

          }).catch(function(err) {

            globals.errorHandle(err, "Adding guild to database - prefix", false);

            return;

          });

        } else {

          if(message.content.startsWith(results[guild].prefix)) {

            processPrefixCommand(message, results[guild].prefix);

          }

        }

      }

      else {

        globals.errorHandle(result, "Invalid result format - check server prefix", false);

      }

    }).catch(function(err) {

      globals.errorHandle(err, "check server prefix", false);

    });

  }

}

function processPrefixCommand(message, prefix) {

  var trimmedContent = message.content.substring(prefix.length);
  
  const spaceIndex = trimmedContent.indexOf(" ");

  if(spaceIndex == -1) {

  }

  else {

    const commandName = trimmedContent.substring(0, spaceIndex);
    trimmedContent = trimmedContent.substring(spaceIndex + 1, trimmedContent.length);

    executeCommand(commandName, trimmedContent, message.channel, message.author.id);

  }

}

function executeCommand(commandName, trimmedContent, channel, authorID) {

	switch(commandName) {
		case "echo":
			globals.sendMessage(channel.id, trimmedContent);
			break;

		case "exec":
			if(authorID == globals.ownerID) {
        			try {
            				eval(trimmedContent);
          			}
        			catch(e){
					globals.sendMessage(channel.id, e.message);
				}
			}
			else {
				globals.sendMessage(channel.id, "I'm just gonna ignore you cuz you don't know what you're doing");
			}
			break;

		case "play":

			try{
				globals.bot.channels.get(process.env.devVoiceChannel).join().then(function(conn){
					if(trimmedContent.startsWith("<")) {
						trimmedContent = trimmedContent.substring(1, trimmedContent.length - 1);
					}
					var stream = globals.ytaudio(trimmedContent, { filter : 'audioonly' });
					const dispatcher = conn.playStream(stream);
					dispatcher.on('end', () => {
						conn.disconnect();
					});

					dispatcher.on('error', e => {
  						console.log(e);
						conn.disconnect();
					});
					
				});
			} catch(e) {
				globals.errorHandle(e, "stream youtube", false);
				globals.sendMessage(channel.id, "Failed to stream");
			}

	}

}

module.exports = parseMessage;
