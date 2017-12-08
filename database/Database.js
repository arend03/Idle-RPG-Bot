const mongoose = require('mongoose');
const { playerSchema, newPlayerObj } = require('./schemas/player');
const { mongoDBUri } = require('../settings');

const Player = mongoose.model('Player', playerSchema);

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

mongoose.connection.on('open', () => {
  console.log('\nDATABASE: Connected!');
});

mongoose.connection.on('close', () => {
  console.log('DATABASE: Disconnected!\n');
});

process.on('close', () => {
  console.log('Database disconnecting on app termination');
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    process.exit(0);
  });
});

function connect() {
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(mongoDBUri, { useMongoClient: true });
  }
}

function disconnect() {
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close();
  }
}

class Database {

  createNewPlayer(discordId, name) {
    connect();
    return new Promise((resolve, reject) => {
      return Player.create(newPlayerObj(discordId, name), (err, result) => {
        if (err) {
          disconnect();
          return reject(err);
        }
        console.log(`DATABASE: ${discordId} has been created.`);
        disconnect();
        return resolve(result);
      });
    });
  }

  loadPlayer(discordId) {
    connect();
    return new Promise((resolve, reject) => {
      return Player.findOne({ discordId }, (err, result) => {
        if (err) {
          disconnect();
          return reject(err);
        }
        console.log(`DATABASE: ${discordId} has been loaded from the Database.`);
        disconnect();
        return resolve(result);
      });
    });
  }

  savePlayer(discordId, player) {
    connect();
    return new Promise((resolve, reject) => {
      return Player.findOneAndUpdate({ discordId }, player, (err, result) => {
        if (err) {
          disconnect();
          return reject(err);
        }
        console.log(`DATABASE: ${discordId} has been saved into the Database.`);
        disconnect();
        return resolve(result);
      });
    });
  }

  getSameMapPlayers(map) {
    connect();
    return new Promise((resolve, reject) => {
      return Player.find({ map: { name: map.name } }, (err, result) => {
        if (err) {
          disconnect();
          return reject(err);
        }
        disconnect();
        return resolve(result);
      });
    });
  }

  deleteAllPlayers() {
    connect();
    return new Promise((resolve, reject) => {
      return Player.remove({}, (err, result) => {
        if (err) {
          disconnect();
          return reject(err);
        }
        disconnect();
        return resolve(result);
      });
    });
  }

}
module.exports = new Database();
