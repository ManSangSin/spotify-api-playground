const express = require("express");
const dotenv = require('dotenv');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

const app = express();


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

app.get("/", function(req,res) {
  res.send("Hello World");
});

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = 'http://localhost:3001/callback';
const master_spotify_playlist_id = "2RoQkVgIhgQmCZadrMoDLd";
// Spotify API requires client id/secret to be encoded with base64 when requesting for access token
const client_id_secret_base64 = btoa(`${client_id}:${client_secret}`);

app.get('/login', function(req, res) {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email';
  const querystring = `client_id=${client_id}&scope=${scope}&response_type=code&redirect_uri=${redirect_uri}&state=${state}`
  res.redirect(`https://accounts.spotify.com/authorize?${querystring}`)
});

app.get(`/callback`, async function(req, res) {
  // we are accessing the querystring (not a parameter) - req.query returns an object of the key/value after the route
  const code = req.query.code
  const access_token = await getAccessToken(code, client_id_secret_base64)
  const playlistSongs = await getPlaylistItems(access_token, master_spotify_playlist_id)
  res.send(playlistSongs)
})

// Fetch call functions to spotify API

async function getAccessToken(code, client_id_secret_base64) {
  const data = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${client_id_secret_base64}`
    },
    body: `code=${code}&grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`
  });
  const json = await data.json();
  return json.access_token
}


async function getPlaylist(access_token, playlist_id) {
  const data = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${access_token}`
    }
  });
  const json = await data.json();
  return json
}

async function getPlaylistItems(access_token, playlist_id) {
  const data = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${access_token}`
    }
  });
  const json = await data.json();
  return json
}

// Utility Functions

function generateRandomString(stringLength) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let generatedString = "";
  for (let i = 0; i < stringLength; i++) {
    const randomCharacter = characters[Math.floor(Math.random() * characters.length)]
    generatedString += randomCharacter
  }
  return generatedString;
}