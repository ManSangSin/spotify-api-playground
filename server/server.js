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