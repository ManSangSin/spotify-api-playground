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

app.get('/login', function(req, res) {

  // var state = "qwertyuiopasdfgh";
  // var scope = 'user-read-private user-read-email';
  const querystring = `client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}`
  // console.log(querystring)
  res.redirect(`https://accounts.spotify.com/authorize?${querystring}`)
    // .stringify({
    //   response_type: 'code',
    //   client_id: client_id,
    //   scope: scope,
    //   redirect_uri: redirect_uri,
    //   state: state
    // })
});

app.get(`/callback`, async function(req, res) {
  // we are accessing the querystring (not a parameter) - req.query returns an object of the key/value after the route
  const code = req.query.code
  // Spotify API requires client id/secret to be encoded with base64
  const client_id_secret_base64 = btoa(`${client_id}:${client_secret}`);
  // console.log(`base64: ${client_id_secret_base64}`)
  const data = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${client_id_secret_base64}`
    },
    body: `code=${code}&grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`
  });
  const json = await data.json();
  res.send(json)
})

async function getPlaylist(access_token, playlist_id) {
  const data = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${access_token}`
    }
  });
  const json = await data.json();
  return json
  // console.log(json)
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
  // console.log(json)
}
