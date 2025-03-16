import { useEffect, useState } from "react";

const TrackPlayer = () => {
  const [playedTracks, setPlayedTracks] = useState([]); // Tracks that have already been played
  const [selectedTrack, setSelectedTrack] = useState({ name: "", id: "" });
  const [paused, setPaused] = useState(false); // Play/Pause state
  const [trackList, setTracks] = useState([]); // Store fetched tracks
  const [loading, setLoading] = useState(true); // Loading state
  const [show, setShow] = useState(false); // Tracklist visibility state

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

      return fetchedTracks;
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
      setTracks(tracksData); // Update state with fetched tracks
      setLoading(false);
      setSelectedTrack(tracksData[Math.floor(Math.random() * tracksData.length)]); // Set random track after loading tracks
    };

    fetchTracks();
  }, []);

  // Function to select the next track
  const nextTrack = () => {
    let x = Math.floor(Math.random() * trackList.length);
    while (playedTracks.includes(x)) {
      x = Math.floor(Math.random() * trackList.length);
    }

    const newTrack = trackList[x];
    setSelectedTrack(newTrack);
    setPlayedTracks((prevPlayedTracks) => [...prevPlayedTracks, x]);
  };

  // Function to handle player state change when the video ends
  const handlePlayerEnded = () => {
    // window.location.reload(); 
    setPaused(false);
    setShow(false)
    nextTrack(); // Automatically trigger nextTrack when the video ends
  };

  const handlePlayerReady = () => {
    setPaused(false);  // Ensures the video will play as soon as it’s ready
  };

  // Handle player pause/play toggle
  const pauseOrPlay = () => {
    setPaused((prevPaused) => !prevPaused);
    const iframe = document.getElementById("player");
    const playerWindow = iframe.contentWindow;

    if (paused) {
      playerWindow.postMessage('{"event":"command","func":"playVideo","args":""}', "*");
    } else {
      playerWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
    }
  };

  // Handle video select
  const handleTrackSelect = (track) => {
    setSelectedTrack(track);
    toggleTracklist();
  };

  const handlePlayerError = () => {
    nextTrack(); // Automatically trigger nextTrack when there is an error
  };

  const checkIfVideoEnded = () => {
    const iframe = document.getElementById("player");
    const player = iframe.contentWindow;

    // Send a message to get the current time and duration of the video
    player.postMessage(
      '{"event":"command","func":"getCurrentTime","args":[]}',
      "*"
    );

    player.postMessage(
      '{"event":"command","func":"getDuration","args":[]}',
      "*"
    );
  };

  // Listen to the response for current time and duration
  useEffect(() => {
    const handlePlayerMessage = (event) => {
      if (event.origin === "https://www.youtube.com") {
        const data = event.data;

        // When receiving current time and duration
        if (data.event === "infoDelivery") {
          const currentTime = data.info.currentTime;
          const duration = data.info.duration;

          if (currentTime >= duration) {
            console.log("Video reached the end, loading next track.");
            nextTrack(); // Trigger nextTrack when the video ends
          }
        }
      }
    };

    window.addEventListener("message", handlePlayerMessage);

    const intervalId = setInterval(() => {
      checkIfVideoEnded(); // Check every second
    }, 1000);

    return () => {
      window.removeEventListener("message", handlePlayerMessage);
      clearInterval(intervalId); // Cleanup interval on component unmount
    };
  }, [playedTracks, trackList]);

  useEffect(() => {
    // Send message to iframe to load the video after selected track changes
    const iframe = document.getElementById("player");
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${selectedTrack.id}?autoplay=1&enablejsapi=1`;
    }
  }, [selectedTrack]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="relative flex flex-col"> 
          <iframe
          className="mx-auto"
            id="player"
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${selectedTrack.id}?autoplay=1&enablejsapi=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            onLoad={handlePlayerReady}
            onError={handlePlayerError}
            title="YouTube Player"
          />

          <div className="mt-2">
            <h3>{selectedTrack.name}</h3>
          </div>
          <div className="flex flex-row gap-3 w-full mx-auto p-0 justify-center mt-2">
            <button onClick={pauseOrPlay}>
              {paused ? 
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-14">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z" clipRule="evenodd" />
            </svg> : 
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-14">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM9 8.25a.75.75 0 0 0-.75.75v6c0 .414.336.75.75.75h.75a.75.75 0 0 0 .75-.75V9a.75.75 0 0 0-.75-.75H9Zm5.25 0a.75.75 0 0 0-.75.75v6c0 .414.336.75.75.75H15a.75.75 0 0 0 .75-.75V9a.75.75 0 0 0-.75-.75h-.75Z" clipRule="evenodd" />
          </svg>}
              
            </button>
            
            <button onClick={handlePlayerEnded}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-14">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z" clipRule="evenodd" />
                  </svg>
            </button>
          </div>
          <button className="w-fit mx-auto my-2" onClick={toggleTracklist}>Tracklist</button>
            {show && (
              <ul className="text-left top-0 overflow-y-scroll bg-black px-12">
                {trackList.map((track) => (
                  <li
                    className="py-2 px-4 border rounded-full mb-3"
                    key={track.id}
                    onClick={() => handleTrackSelect(track)}
                  >
                    {track.name}
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}
    </div>
  );
};

export default TrackPlayer;
