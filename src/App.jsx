import { useEffect, useState } from 'react'
import TrackPlayer from './components/TrackPlayer.jsx'
import './App.css'

function App() {
	const [count, setCount] = useState(Number.parseInt(localStorage.getItem('count')) || 0)

	//watch for changes in the count
	useEffect(() => {
		//store the count in local storage
		localStorage.setItem('count', count)
	}, [count])

	return (
		<>		
			<div className="bg-black w-full h-full justify-items-center my-auto">
				<TrackPlayer/>
			</div>	
		</>
	)
}

export default App
