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
const master_spotify_playlist_id = "7ML1iO1h2gFyjwYUkzcOGK";
// Spotify API requires client id/secret to be encoded with base64 when requesting for access token
const client_id_secret_base64 = btoa(`${client_id}:${client_secret}`);

app.get('/login', function(req, res) {
  // state optional but recommended, used very when a user is redirected back to the website that its not intercepted (state sent should match state returned)
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-public';
  const querystring = `client_id=${client_id}&scope=${scope}&response_type=code&redirect_uri=${redirect_uri}&state=${state}`
  res.redirect(`https://accounts.spotify.com/authorize?${querystring}`)
});

app.get(`/callback`, async function(req, res) {
  // code is returned when a user logins in to spotify and gives consent to access their data (for this project, only the master account is required to login)
  // code is returned in the query string when user is redirected back to our website after logging in/consenting
  // to access the query string (not a parameter) - use req.query which returns an object of all the key/value pairs in the query string
  const code = req.query.code
  const access_token = await getAccessToken(code, client_id_secret_base64)
  const playlistDetails = await getPlaylist(access_token, master_spotify_playlist_id)
  const snapshot_id = (playlistDetails.snapshot_id)
  const tracksArray = (playlistDetails.tracks.items)
  const deleteSongsURIArray = [];
  tracksArray.map((track) => {
    console.log(track.track.uri);
    const trackObject = {}
    trackObject.uri = track.track.uri
    deleteSongsURIArray.push(trackObject);
  });
  console.log(deleteSongsURIArray); 
  const deleteSongsReq = await deleteSongsFromPlaylist(access_token, master_spotify_playlist_id, snapshot_id, deleteSongsURIArray)
  res.send(deleteSongsReq)
})

// Fetch call functions to spotify API

async function getAccessToken(code, client_id_secret_base64) {
  const data = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${client_id_secret_base64}`
    },
    body: `code=${code}&redirect_uri=${redirect_uri}&grant_type=authorization_code`
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

async function deleteSongsFromPlaylist(access_token, playlist_id, snapshot_id, songsToDelURIArray) {
  const data = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tracks: songsToDelURIArray,
      snapshot_id: snapshot_id
  })
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