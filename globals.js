const Datastore = require('@google-cloud/datastore').Datastore;
const Discord = require("discord.js");
const database = new Datastore();
const bot = new Discord.Client();
const http = require("http");
const fs = require('fs');
const path = require("path");
const request = require("request");
const youtubeStream = require('ytdl-core');
const ownerID = process.env.ownerID;
const selfID = process.env.botID;
const parseXML = require('xml2js').parseString;
var botRunning = false;

function errorHandle(err, location, isCritical) {

  console.log("An error has occured at " + location + ". Here is a description: " + err);

  if(isCritical) {

    console.log("This error is critical. The bot will now restart");
    process.exit(1);

  }

}

async function sendMessage(channelID, message) {

  return new Promise(async function(resolve, reject) {

    await bot.channels.get(channelID).send(message).then(function(response) {

      resolve(response);

    }).catch(function(err) {

      reject(err);

    });

  })

}

module.exports = {

  database: database,
  bot: bot,
  Discord: Discord,
  Datastore: Datastore,
  http: http,
  fs: fs,
  parseXML: parseXML,
  path: path,
  botRunning: botRunning,
  errorHandle: errorHandle,
  sendMessage: sendMessage,
  request: request,
  ownerID: ownerID,
  ytaudio: youtubeStream,
  selfID: selfID

}
