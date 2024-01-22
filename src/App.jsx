import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const spotifyClientID = import.meta.env.VITE_CLIENT_ID
  const spotifyClientSecret = import.meta.env.VITE_CLIENT_SECRET
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      const data = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `grant_type=client_credentials&client_id=${spotifyClientID}&client_secret=${spotifyClientSecret}`
      });
      const json = await data.json();
      setToken(`Bearer ${json.access_token}`);
      // console.log(token)
      // addPlaylist()
    }

    const addPlaylist = async () => {
      await fetchToken()
      console.log(token)
      await fetch("https://api.spotify.com/v1/users/31tulwjq2gsomhq5h5xdon2oopnu/playlists", {
        method: "POST",
        headers: {
          "Authorization": `{${token}}`,
          "Content-Type": "application/json"
        },
        body: {
          "uris": ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M", "spotify:episode:512ojhOuo1ktJprKbVcKyQ"],
          "position": 0
        }
      });
    }

    const run2functions = async() => {
      await fetchToken();
      console.log(token)
      addPlaylist();
    }
    addPlaylist();
    
  }, [])

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div>
      <iframe src="https://open.spotify.com/embed/playlist/2RoQkVgIhgQmCZadrMoDLd?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <p>{token}</p>
    </>
  )
}

export default App
