import { useEffect, useState } from "react";

const TrackPlayer = () => {
  const [playedTracks, setPlayedTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState({ name: "", id: "" });
  const [paused, setPaused] = useState(false);
  const [trackList, setTracks] = useState([]); // Store fetched tracks
  const [loading, setLoading] = useState(true); // Loading state
  const [show, setShow] = useState(false); // Tracklist visibility state
  const [currentTimestamp, setCurrentTimestamp] = useState(0); // To store current timestamp

  const getYoutubeVideosIDs = async () => {
    try {
      let nextPageToken = "";
      const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
      const PLAYLIST_ID = "PLRdMBDNqSy0Q0NcuZjytIt9sxZOOhW942";
      let fetchedTracks = [];

      do {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&key=${API_KEY}&maxResults=50&pageToken=${nextPageToken}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        nextPageToken = data.nextPageToken || "";

        const newTracks = data.items.map((item) => ({
          name: item.snippet.title,
          id: item.snippet.resourceId.videoId,
        }));

        fetchedTracks = [...fetchedTracks, ...newTracks];
      } while (nextPageToken);

      return fetchedTracks; // ✅ Return fetched tracks
    } catch (error) {
      console.error("Error fetching playlist items:", error);
      return []; // Return empty array in case of error
    }
  };

  const toggleTracklist = () => {
    setShow((prevShow) => !prevShow);
  };

  // Fetch tracks and set initial selected track
  useEffect(() => {
    const fetchTracks = async () => {
      const tracksData = await getYoutubeVideosIDs();
      setTracks(tracksData); // ✅ Update state with fetched tracks
      setLoading(false);
      setSelectedTrack(tracksData[Math.floor(Math.random() * tracksData.length)]); // Set random track after loading tracks
    };

    fetchTracks();
  }, []);

  // Function to select next track
  const nextTrack = async () => {
    let x = Math.floor(Math.random() * trackList.length);
    while (playedTracks.includes(x)) {
      x = Math.floor(Math.random() * trackList.length);
    }

    const newTrack = trackList[x];
    setSelectedTrack(newTrack);
    setPlayedTracks((prevPlayedTracks) => [...prevPlayedTracks, x]);
  };

  // Pause or play the video
  const pauseOrPlay = () => {
    const iframe = document.getElementById("player");
    const playerWindow = iframe.contentWindow;
    if (paused) {
      setPaused(false);
      playerWindow.postMessage('{"event":"command","func":"playVideo","args":""}', "*");
    } else {
      setPaused(true);
      playerWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
    }
  };

  // Skip to the end of the video
  const skipToEnd = () => {
    const iframe = document.getElementById("player");
    const playerWindow = iframe.contentWindow;
    playerWindow.postMessage('{"event":"command","func":"seekTo","args":[99999,true]}', "*");
  };

  // Function to get the current timestamp from the video
  const getCurrentTimestamp = () => {
    const iframe = document.getElementById("player");
    const playerWindow = iframe.contentWindow;
    playerWindow.postMessage('{"event":"command","func":"getCurrentTime","args":[]}', "*");
  };

  // Listen for the current timestamp response from YouTube iframe
  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.origin === "https://www.youtube.com") {
        const data = event.data;
        if (data.event === "infoDelivery" && data.info && data.info.currentTime !== undefined) {
          setCurrentTimestamp(data.info.currentTime); // Update the current timestamp state
        }
      }
    });
  }, []);

  // YouTube player initialization
  const loadYouTubeAPI = () => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);
  };

  const onPlayerStateChange = (event) => {
    // Check if the video has ended
    if (event.data === window.YT.PlayerState.ENDED) {
      console.log("Video has ended");
      nextTrack(); // Automatically trigger nextTrack when the video ends
    }
  };

  const onPlayerError = async () => {
    await nextTrack();
  };

  useEffect(() => {
    loadYouTubeAPI();
  }, []);

//   useEffect(()=> {
//     onPlayerStateChange(ENDED);
//   }, []);

  

  useEffect(() => {
    if (selectedTrack.id) {
      // Updating the iframe src whenever the selected track changes
      const iframe = document.getElementById("player");
      iframe.src = `https://www.youtube.com/embed/${selectedTrack.id}?autoplay=1&enablejsapi=1`;
    }
  }, [selectedTrack]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="">
          <button
            onClick={toggleTracklist}
            className="transition-all overflow-x-hidden justify-items-center items-center TrackList bg-black border border-orange-950"
          >
            Tracklist
          </button>
          {show && (
            <ul className="mx-auto w-full h-screen justify-items-center overflow-y-scroll px-auto hide-scrollbar">
              {trackList.map((track) => (
                <li
                  className="w-full pr-32 font-mono my-2 bg-black-950 hover:b border p-4 rounded-lg text-left border-orange-500 hover:bg-orange-950 opacity-50 hover:opacity-90 transition-all text-orange-600"
                  key={track.id}
                  onClick={() => {
                    setSelectedTrack(track)
                    toggleTracklist()    
                }}
                >
                  {track.name}
                </li>
              ))}
            </ul>
          )}

          {/* Video Player (iframe) */}
          <iframe
            id="player"
            height="315"
            width="560"
            title="YouTube Player"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            className="my-3"
          ></iframe>

          <div className="mb-2">
            <h3>{selectedTrack.name}</h3>
          </div>
          <div>
            <button className="mr-2" onClick={pauseOrPlay}>{paused ? "Play" : "Pause"}</button>
            <button onClick={skipToEnd}>Skip to End</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPlayer;
