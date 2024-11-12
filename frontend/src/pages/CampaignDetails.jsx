import { useParams , Link} from 'react-router-dom'
import {ethers } from 'ethers'
import Countdown from 'react-countdown';
import { useEffect, useState } from 'react'
import { SVGMap } from 'react-svg-map'
import 'react-svg-map/lib/index.css'
import World from '@svg-maps/world'
import India from '@svg-maps/india'
import Japan from '@svg-maps/japan'
import USA from '@svg-maps/usa'
import Australia from '@svg-maps/australia'
import Brazil from '@svg-maps/brazil'
import Germany from '@svg-maps/germany'
import Italy from '@svg-maps/italy'
import Canada from '@svg-maps/canada'
import challengeData from '../assets/campaignData.json'
import './map.css'

function challengeDetails() {
    const { id } = useParams()
    const [challenge, setchallenge] = useState(null)
    const [timeLeft, setTimeLeft] = useState('')
    const [selectedState, setSelectedState] = useState(null)
    const [stateValue, setStateValue] = useState('')
    const [bidAmount, setBidAmount] = useState('')
    const [selectedRegions, setSelectedRegions] = useState([])

    // For ended challenge data
    const [endedchallengeData] = useState({
        placedBids: 2,
        bidAmount: 10,
        rewards: {
            bid: 10,
            gains: 4,
            losses: 2,
            finalPayout: 12  // 10 + 4 - 2
        },
        stateOutcomes: {
            "California": { value: Math.floor(Math.random() * 10) + 1 },
            "Texas": { value: Math.floor(Math.random() * 10) + 1 },
            "Florida": { value: Math.floor(Math.random() * 10) + 1 },
            "New York": { value: Math.floor(Math.random() * 10) + 1 },
            // Add more states as needed
        },
        deterministicOutcomes: {
            "California": { value: "yes" },
            "Texas": { value: "no" },
            "Florida": { value: "yes" },
            "New York": { value: "no" },
            // Add more states as needed
        }
    })

    const maps = {
        'world': World,
        'india': India,
        'japan': Japan,
        'usa': USA,
        'australia': Australia,
        'brazil': Brazil,
        'germany': Germany,
        'italy': Italy,
        'canada': Canada
    }

    const locationNames = {
        'world': 'World',
        'india': 'India',
        'japan': 'Japan',
        'usa': 'United States',
        'australia': 'Australia',
        'brazil': 'Brazil',
        'germany': 'Germany',
        'italy': 'Italy',
        'canada': 'Canada'
    }

    const getMap = (location) => {
        return maps[location.toLowerCase()] || World
    }

    const getEndedStateColor = (stateName) => {
        if (challenge.type === 'Deterministic') {
            const outcome = endedchallengeData.deterministicOutcomes[stateName]?.value;
            return outcome === 'yes' ? '#22c55e' : '#ef4444';  // Green for yes, Red for no
        } else {
            const value = endedchallengeData.stateOutcomes[stateName]?.value || 0;
            const hue = (value * 25) % 360;
            return `hsl(${hue}, 70%, 60%)`;
        }
    }

    useEffect(() => {
        const foundchallenge = challengeData.challenges.find(c => c.id === id)
        if (foundchallenge) {
            setchallenge(foundchallenge)
        }
    }, [id])

   
    const renderer = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
          return <span className="text-red-600 font-bold">Challenge Ended</span>;
        }
        
        return (
          <div className="bg-blue-50 px-6 py-3 rounded-lg border-2 border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Time Remaining</div>
            <div className="text-2xl font-bold text-blue-800 flex gap-4">
              <div className="text-center">
                <span className="tabular-nums">{days}</span>
                <div className="text-xs text-blue-600">Days</div>
              </div>
              <div className="text-center">
                <span className="tabular-nums">{hours}</span>
                <div className="text-xs text-blue-600">Hours</div>
              </div>
              <div className="text-center">
                <span className="tabular-nums">{minutes}</span>
                <div className="text-xs text-blue-600">Minutes</div>
              </div>
              <div className="text-center">
                <span className="tabular-nums">{seconds}</span>
                <div className="text-xs text-blue-600">Seconds</div>
              </div>
            </div>
          </div>
        );
      };

    const handleStateClick = (event) => {
        if (challenge.status !== 'Active') {
            return
        }
        
        const stateName = event.target.getAttribute('name')
        if (selectedRegions.some(region => region.state === stateName)) {
            alert('This region has already been selected')
            return
        }
        setSelectedState(stateName)
        setStateValue('')
        setBidAmount('')
    }

    // Send transaction 


    const sendTransaction = async (amount) => {
        try {
            // Check if MetaMask is installed
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to make transactions');
            }
    
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            // Create provider and signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer =  await provider.getSigner();
    
            // Create transaction object
            const tx = {
                to: import.meta.env.VITE_RECEIVERS_ADDRESS, // Replace with the address to send to
                value: ethers.parseEther(amount.toString()),
            };
    
            // Send transaction
            const transaction = await signer.sendTransaction(tx);
            
            // Wait for transaction to be mined
            const receipt = await transaction.wait();
    
            return {
                success: true,
                hash: transaction.hash,
                receipt
            };
    
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        }
    }


   


    const handleSubmit = async() => {
        if (!selectedState) {
            alert('Please select a region first')
            return
        }

        if (challenge.type === 'Deterministic') {
            const value = stateValue.toLowerCase()
            if (value !== 'yes' && value !== 'no') {
                alert('Please enter either "yes" or "no"')
                return
            }
        }

        if (challenge.type === 'Non Deterministic') {
            const numValue = Number(stateValue)
            if (isNaN(numValue) || numValue < 0 || numValue > 10) {
                alert('Please enter a number between 0 and 10')
                return
            }
        }
        // 

        const amount = Number(bidAmount)
        if (!bidAmount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid bid amount')
            return
        }
        //Start transaction
        const result = await sendTransaction(amount)
        console.log(result)

        setSelectedRegions([...selectedRegions, {
            state: selectedState,
            value: stateValue,
            bid: amount,
            txHash: result.hash
        }])

        setSelectedState(null)
        setStateValue('')
        setBidAmount('')
    }

    if (!challenge) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div>
            <div className="max-w-6xl mx-auto px-6 mt-8 mb-4">
                <Link 
                    to="/" 
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                    <svg 
                        className="w-5 h-5 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                        />
                    </svg>
                    Back
                </Link>
            </div>

        <div className="max-w-6xl mx-auto px-6 mt-8 mb-4">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8 border-b pb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{challenge.name}</h1>
                <p className="text-gray-500 mt-2">Challenge ID: {challenge.id}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
                {/* Status Badge */}
                <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${
                    challenge.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                    {challenge.status}
                </span>
                
                {/* Enhanced Timer */}
                {challenge.status === 'Active' && (
                   <Countdown
                   date={Date.now() + 15 * 60 * 1000} //15m
                   renderer={renderer}
                   onComplete={() => {
                     // Optional: handle what happens when timer completes
                     console.log('Timer completed');
                        }}
                    />
                )}
            </div>
        </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* challenge Details */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Challenge Details</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                                <p className={`mt-1 text-lg font-medium ${
                                    challenge.type === 'Deterministic' 
                                        ? 'text-purple-600' 
                                        : 'text-orange-600'
                                }`}>
                                    {challenge.type}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Geolocation</h3>
                                <p className="mt-1 text-lg font-medium flex items-center">
                                    {challenge.geolocation === 'world' ? '🌎 ' : '🏳️ '}
                                    {locationNames[challenge.geolocation.toLowerCase()]}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Show different content based on challenge status */}
                    {challenge.status === 'Active' ? (
                        <>
                            {/* Active challenge Content */}
                            {selectedState && (
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        Place Bid for <p className="text-red-600  font-bold ml-2"> {selectedState}</p>
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {challenge.type === 'Deterministic' 
                                                    ? 'Enter yes/no:' 
                                                    : 'Enter value (0-10):'}
                                            </label>
                                            <input
                                                type={challenge.type === 'Deterministic' ? 'text' : 'number'}
                                                value={stateValue}
                                                onChange={(e) => setStateValue(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md"
                                                placeholder={challenge.type === 'Deterministic' ? 'yes/no' : '0-10'}
                                                min={challenge.type === 'Deterministic' ? undefined : "0"}
                                                max={challenge.type === 'Deterministic' ? undefined : "10"}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bid Amount ($):
                                            </label>
                                            <input
                                                type="number"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md"
                                                placeholder="Enter bid amount"
                                                min="0"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSubmit}
                                            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                        >
                                            Submit Bid
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedRegions.length > 0 && (
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Regions</h3>
                                    <div className="space-y-3">
                                        {selectedRegions.map((region, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-white rounded-md">
                                                <div>
                                                    <p className="font-medium">{region.state}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Value: {region.value}
                                                    </p>
                                                </div>
                                                <p className="text-blue-600 font-medium">
                                                    ${region.bid}
                                                </p>
                                            </div>
                                        ))}
                                        <div className="pt-4 border-t">
                                            <p className="text-right font-medium">
                                                Total Bid: ${selectedRegions.reduce((sum, region) => sum + region.bid, 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Ended challenge Content */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                {/* Rewards Section */}
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rewards</h3>
                                <div className="space-y-4">
    <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Bid (A)</h3>
        <p className="text-2xl font-bold text-gray-900">${endedchallengeData.rewards.bid}</p>
    </div>
    
    <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Gains (B)</h3>
        <p className="text-2xl font-bold text-green-600">+${endedchallengeData.rewards.gains}</p>
    </div>
    
    <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Losses (C)</h3>
        <p className="text-2xl font-bold text-red-600">-${endedchallengeData.rewards.losses}</p>
    </div>
    
    <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm bg-blue-50">
        <h3 className="text-sm font-medium text-gray-500">Final Payout (A+B-C)</h3>
        <p className="text-2xl font-bold text-blue-600">${endedchallengeData.rewards.finalPayout}</p>
    </div>
</div>
                                {/* <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500">Bid(A)</h3>
                                        <p className="text-2xl font-bold text-gray-900">${endedchallengeData.rewards.bid}</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500">Gains(B)</h3>
                                        <p className="text-2xl font-bold text-green-600">+${endedchallengeData.rewards.gains}</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500">Losses(C)</h3>
                                        <p className="text-2xl font-bold text-red-600">-${endedchallengeData.rewards.losses}</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500">Final Payout (A+B-C)</h3>
                                        <p className="text-2xl font-bold text-blue-600">${endedchallengeData.rewards.finalPayout}</p>
                                    </div>
                                </div> */}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column - Map */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Geographic Coverage</h2>
                    {challenge.status === 'Active' ? (
                        <>
                            <p className="text-sm text-gray-600 mb-4">
                                Click on a region to place your bid
                            </p>
                            <div className="h-[400px] overflow-hidden">
                                <SVGMap 
                                    map={getMap(challenge.geolocation)}
                                    className={`w-full h-full ${challenge.status === 'Active' ? 'active' : 'inactive'}`}
                                    onLocationClick={handleStateClick}
                                    locationClassName={(location) => {
                                        const isSelected = selectedRegions.some(r => r.state === location.name)
                                        return `svg-map__location ${
                                            isSelected ? 'fill-blue-200' : 
                                            location.name === selectedState ? 'fill-yellow-200' : ''
                                        }`
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                {challenge.type === 'Deterministic' ? (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                                            <span>Yes</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                                            <span>No</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        Values range from 1-10 (different colors)
                                    </div>
                                )}
                            </div>
                            <div className="h-[400px] overflow-hidden">
                                <SVGMap 
                                    map={getMap(challenge.geolocation)}
                                    className="w-full h-full"
                                    locationClassName="svg-map__location"
                                    locationStyle={(location) => ({
                                        fill: getEndedStateColor(location.name),
                                        cursor: 'pointer'
                                    })}
                                    onLocationClick={(event) => {
                                        const stateName = event.target.getAttribute('name');
                                        const outcome = challenge.type === 'Deterministic' 
                                            ? endedchallengeData.deterministicOutcomes[stateName]
                                            : endedchallengeData.stateOutcomes[stateName];
                                        if (outcome) {
                                            alert(`${stateName}\nValue: ${outcome.value}`);
                                        }
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
        </div>
    )
}

export default challengeDetails
// import { useParams } from 'react-router-dom'
// import { useEffect, useState } from 'react'
// import { SVGMap } from 'react-svg-map'
// import 'react-svg-map/lib/index.css'
// import World from '@svg-maps/world'
// import India from '@svg-maps/india'
// import Japan from '@svg-maps/japan'
// import USA from '@svg-maps/usa'
// import Australia from '@svg-maps/australia'
// import Brazil from '@svg-maps/brazil'
// import Germany from '@svg-maps/germany'
// import Italy from '@svg-maps/italy'
// import Canada from '@svg-maps/canada'
// import challengeData from '../assets/challengeData.json'
// import './map.css'

// function challengeDetails() {
//     const { id } = useParams()
//     const [challenge, setchallenge] = useState(null)
//     const [timeLeft, setTimeLeft] = useState('')
//     const [selectedState, setSelectedState] = useState(null)
//     const [stateValue, setStateValue] = useState('')
//     const [bidAmount, setBidAmount] = useState('')
//     const [selectedRegions, setSelectedRegions] = useState([])

//     const maps = {
//         'world': World,
//         'india': India,
//         'japan': Japan,
//         'usa': USA,
//         'australia': Australia,
//         'brazil': Brazil,
//         'germany': Germany,
//         'italy': Italy,
//         'canada': Canada
//     }

//     const locationNames = {
//         'world': 'World',
//         'india': 'India',
//         'japan': 'Japan',
//         'usa': 'United States',
//         'australia': 'Australia',
//         'brazil': 'Brazil',
//         'germany': 'Germany',
//         'italy': 'Italy',
//         'canada': 'Canada'
//     }

//     const getMap = (location) => {
//         return maps[location.toLowerCase()] || World
//     }

//     useEffect(() => {
//         const foundchallenge = challengeData.challenges.find(c => c.id === id)
//         if (foundchallenge) {
//             setchallenge(foundchallenge)
//         }
//     }, [id])

//     useEffect(() => {
//         if (!challenge || challenge.status !== 'Active') return

//         const calculateTimeLeft = () => {
//             const endDate = new Date()
//             endDate.setDate(endDate.getDate() + 30)
//             const difference = endDate - new Date()

//             if (difference > 0) {
//                 const days = Math.floor(difference / (1000 * 60 * 60 * 24))
//                 const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
//                 const minutes = Math.floor((difference / 1000 / 60) % 60)
//                 const seconds = Math.floor((difference / 1000) % 60)

//                 return `${days}d ${hours}h ${minutes}m ${seconds}s`
//             }
//             return 'Ended'
//         }

//         const timer = setInterval(() => {
//             setTimeLeft(calculateTimeLeft())
//         }, 1000)

//         return () => clearInterval(timer)
//     }, [challenge])

//     const handleStateClick = (event) => {
//         if (challenge.status !== 'Active') {
//             alert('This challenge is not active. Bidding is closed.')
//             return
//         }
        
//         const stateName = event.target.getAttribute('name')
//         if (selectedRegions.some(region => region.state === stateName)) {
//             alert('This region has already been selected')
//             return
//         }
//         setSelectedState(stateName)
//         setStateValue('')
//         setBidAmount('')
//     }

//     const handleSubmit = () => {
//         if (!selectedState) {
//             alert('Please select a region first')
//             return
//         }

//         // Validation for Deterministic
//         if (challenge.type === 'Deterministic') {
//             const value = stateValue.toLowerCase()
//             if (value !== 'yes' && value !== 'no') {
//                 alert('Please enter either "yes" or "no"')
//                 return
//             }
//         }

//         // Validation for Non-Deterministic
//         if (challenge.type === 'Non Deterministic') {
//             const numValue = Number(stateValue)
//             if (isNaN(numValue) || numValue < 0 || numValue > 10) {
//                 alert('Please enter a number between 0 and 10')
//                 return
//             }
//         }

//         // Validation for bid amount
//         const amount = Number(bidAmount)
//         if (!bidAmount || isNaN(amount) || amount <= 0) {
//             alert('Please enter a valid bid amount')
//             return
//         }

//         // Add to selected regions
//         setSelectedRegions([...selectedRegions, {
//             state: selectedState,
//             value: stateValue,
//             bid: amount
//         }])

//         // Reset inputs
//         setSelectedState(null)
//         setStateValue('')
//         setBidAmount('')
//     }

//     if (!challenge) {
//         return (
//             <div className="flex items-center justify-center min-h-[60vh]">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//             </div>
//         )
//     }

//     return (
//         <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
//             {/* Header Section */}
//             <div className="flex justify-between items-center mb-8 border-b pb-6">
//                 <div>
//                     <h1 className="text-3xl font-bold text-gray-900">{challenge.name}</h1>
//                     <p className="text-gray-500 mt-2">challenge ID: {challenge.id}</p>
//                 </div>
//                 <div className="text-right">
//                     <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${
//                         challenge.status === 'Active'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-red-100 text-red-800'
//                     }`}>
//                         {challenge.status}
//                     </span>
//                     {challenge.status === 'Active' && (
//                         <div className="mt-2 text-sm font-medium text-gray-500">
//                             Time Left: {timeLeft}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Main Content Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Left Column */}
//                 <div className="space-y-6">
//                     {/* challenge Details */}
//                     <div className="bg-gray-50 p-6 rounded-lg">
//                         <h2 className="text-xl font-semibold text-gray-900 mb-4">challenge Details</h2>
//                         <div className="space-y-4">
//                             <div>
//                                 <h3 className="text-sm font-medium text-gray-500">Type</h3>
//                                 <p className={`mt-1 text-lg font-medium ${
//                                     challenge.type === 'Deterministic' 
//                                         ? 'text-purple-600' 
//                                         : 'text-orange-600'
//                                 }`}>
//                                     {challenge.type}
//                                 </p>
//                             </div>
//                             <div>
//                                 <h3 className="text-sm font-medium text-gray-500">Geolocation</h3>
//                                 <p className="mt-1 text-lg font-medium flex items-center">
//                                     {challenge.geolocation === 'world' ? '🌎 ' : '🏳️ '}
//                                     {locationNames[challenge.geolocation.toLowerCase()]}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Bid Input Section - Only show for active challenges */}
//                     {challenge.status === 'Active' && selectedState && (
//                         <div className="bg-gray-50 p-6 rounded-lg">
//                             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                                 Place Bid for {selectedState}
//                             </h3>
//                             <div className="space-y-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         {challenge.type === 'Deterministic' 
//                                             ? 'Enter yes/no:' 
//                                             : 'Enter value (0-10):'}
//                                     </label>
//                                     <input
//                                         type={challenge.type === 'Deterministic' ? 'text' : 'number'}
//                                         value={stateValue}
//                                         onChange={(e) => setStateValue(e.target.value)}
//                                         className="w-full px-3 py-2 border rounded-md"
//                                         placeholder={challenge.type === 'Deterministic' ? 'yes/no' : '0-10'}
//                                         min={challenge.type === 'Deterministic' ? undefined : "0"}
//                                         max={challenge.type === 'Deterministic' ? undefined : "10"}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Bid Amount ($):
//                                     </label>
//                                     <input
//                                         type="number"
//                                         value={bidAmount}
//                                         onChange={(e) => setBidAmount(e.target.value)}
//                                         className="w-full px-3 py-2 border rounded-md"
//                                         placeholder="Enter bid amount"
//                                         min="0"
//                                     />
//                                 </div>
//                                 <button
//                                     onClick={handleSubmit}
//                                     className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
//                                 >
//                                     Submit Bid
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Selected Regions List - Only show for active challenges */}
//                     {challenge.status === 'Active' && selectedRegions.length > 0 && (
//                         <div className="bg-gray-50 p-6 rounded-lg">
//                             <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Regions</h3>
//                             <div className="space-y-3">
//                                 {selectedRegions.map((region, index) => (
//                                     <div key={index} className="flex justify-between items-center p-3 bg-white rounded-md">
//                                         <div>
//                                             <p className="font-medium">{region.state}</p>
//                                             <p className="text-sm text-gray-500">
//                                                 Value: {region.value}
//                                             </p>
//                                         </div>
//                                         <p className="text-blue-600 font-medium">
//                                             ${region.bid}
//                                         </p>
//                                     </div>
//                                 ))}
//                                 <div className="pt-4 border-t">
//                                     <p className="text-right font-medium">
//                                         Total Bid: ${selectedRegions.reduce((sum, region) => sum + region.bid, 0)}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Right Column - Map */}
//                 <div className="bg-gray-50 p-6 rounded-lg">
//                     <h2 className="text-xl font-semibold text-gray-900 mb-4">Geographic Coverage</h2>
//                     {challenge.status === 'Active' ? (
//                         <>
//                             <p className="text-sm text-gray-600 mb-4">
//                                 Click on a region to place your bid
//                             </p>
//                             <div className="h-[400px] overflow-hidden">
//                                 <SVGMap 
//                                     map={getMap(challenge.geolocation)}
//                                     className={`w-full h-full ${challenge.status === 'Active' ? 'active' : 'inactive'}`}
//                                     onLocationClick={handleStateClick}
//                                     locationClassName={(location) => {
//                                         const isSelected = selectedRegions.some(r => r.state === location.name)
//                                         return `svg-map__location ${
//                                             isSelected ? 'fill-blue-200' : 
//                                             location.name === selectedState ? 'fill-yellow-200' : ''
//                                         }`
//                                     }}
//                                 />
//                             </div>
//                         </>
//                     ) : (
//                         <>
//                             <p className="text-sm text-red-600 mb-4">
//                                 This challenge is not active. Bidding is closed.
//                             </p>
//                             <div className="h-[400px] overflow-hidden opacity-50">
//                                 <SVGMap 
//                                     map={getMap(challenge.geolocation)}
//                                     className="w-full h-full inactive"
//                                     locationClassName="svg-map__location"
//                                 />
//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default challengeDetails



















// import { useParams } from 'react-router-dom'
// import { useEffect, useState } from 'react'
// import './map.css'
// import { SVGMap } from 'react-svg-map'
// import 'react-svg-map/lib/index.css'
// import World from '@svg-maps/world'
// import India from '@svg-maps/india'
// import Japan from '@svg-maps/japan'
// import USA from '@svg-maps/usa'
// import Australia from '@svg-maps/australia'
// import Brazil from '@svg-maps/brazil'
// import Germany from '@svg-maps/germany'
// import Italy from '@svg-maps/italy'
// import Canada from '@svg-maps/canada'
// import challengeData from '../assets/challengeData.json'

// function challengeDetails() {
//     const { id } = useParams()
//     const [challenge, setchallenge] = useState(null)
//     const [timeLeft, setTimeLeft] = useState('')
//     const [selectedState, setSelectedState] = useState(null)
//     const [stateValue, setStateValue] = useState('')
//     const [bidAmount, setBidAmount] = useState('')
//     const [selectedRegions, setSelectedRegions] = useState([])

//     const maps = {
//         'world': World,
//         'india': India,
//         'japan': Japan,
//         'usa': USA,
//         'australia': Australia,
//         'brazil': Brazil,
//         'germany': Germany,
//         'italy': Italy,
//         'canada': Canada
//     }

//     const locationNames = {
//         'world': 'World',
//         'india': 'India',
//         'japan': 'Japan',
//         'usa': 'United States',
//         'australia': 'Australia',
//         'brazil': 'Brazil',
//         'germany': 'Germany',
//         'italy': 'Italy',
//         'canada': 'Canada'
//     }

//     const getMap = (location) => {
//         return maps[location.toLowerCase()] || World
//     }

//     useEffect(() => {
//         const foundchallenge = challengeData.challenges.find(c => c.id === id)
//         if (foundchallenge) {
//             setchallenge(foundchallenge)
//         }
//     }, [id])

//     useEffect(() => {
//         if (!challenge || challenge.status !== 'Active') return

//         const calculateTimeLeft = () => {
//             const endDate = new Date()
//             endDate.setDate(endDate.getDate() + 30)
//             const difference = endDate - new Date()

//             if (difference > 0) {
//                 const days = Math.floor(difference / (1000 * 60 * 60 * 24))
//                 const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
//                 const minutes = Math.floor((difference / 1000 / 60) % 60)
//                 const seconds = Math.floor((difference / 1000) % 60)

//                 return `${days}d ${hours}h ${minutes}m ${seconds}s`
//             }
//             return 'Ended'
//         }

//         const timer = setInterval(() => {
//             setTimeLeft(calculateTimeLeft())
//         }, 1000)

//         return () => clearInterval(timer)
//     }, [challenge])

//     const handleStateClick = (event) => {
//         const stateName = event.target.getAttribute('name')
//         // Check if state is already selected
//         if (selectedRegions.some(region => region.state === stateName)) {
//             alert('This region has already been selected')
//             return
//         }
//         setSelectedState(stateName)
//         setStateValue('')
//         setBidAmount('')
//     }

//     const handleSubmit = () => {
//         if (!selectedState) {
//             alert('Please select a region first')
//             return
//         }

//         // Validation for Deterministic
//         if (challenge.type === 'Deterministic') {
//             const value = stateValue.toLowerCase()
//             if (value !== 'yes' && value !== 'no') {
//                 alert('Please enter either "yes" or "no"')
//                 return
//             }
//         }

//         // Validation for Non-Deterministic
//         if (challenge.type === 'Non Deterministic') {
//             const numValue = Number(stateValue)
//             if (isNaN(numValue) || numValue < 0 || numValue > 10) {
//                 alert('Please enter a number between 0 and 10')
//                 return
//             }
//         }

//         // Validation for bid amount
//         const amount = Number(bidAmount)
//         if (!bidAmount || isNaN(amount) || amount <= 0) {
//             alert('Please enter a valid bid amount')
//             return
//         }

//         // Add to selected regions
//         setSelectedRegions([...selectedRegions, {
//             state: selectedState,
//             value: stateValue,
//             bid: amount
//         }])

//         // Reset inputs
//         setSelectedState(null)
//         setStateValue('')
//         setBidAmount('')
//     }

//     if (!challenge) {
//         return (
//             <div className="flex items-center justify-center min-h-[60vh]">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//             </div>
//         )
//     }

//     return (
//         <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
//             {/* Header Section */}
//             <div className="flex justify-between items-center mb-8 border-b pb-6">
//                 <div>
//                     <h1 className="text-3xl font-bold text-gray-900">{challenge.name}</h1>
//                     <p className="text-gray-500 mt-2">challenge ID: {challenge.id}</p>
//                 </div>
//                 <div className="flex items-center gap-6">
//                     <div className="text-right">
//                         <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${
//                             challenge.status === 'Active'
//                                 ? 'bg-green-100 text-green-800'
//                                 : 'bg-red-100 text-red-800'
//                         }`}>
//                             {challenge.status}
//                         </span>
//                         {challenge.status === 'Active' && (
//                             <div className="mt-2 text-sm font-medium text-gray-500">
//                                 Time Left: {timeLeft}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Left Column */}
//                 <div className="space-y-6">
//                     {/* challenge Details */}
//                     <div className="bg-gray-50 p-6 rounded-lg">
//                         <h2 className="text-xl font-semibold text-gray-900 mb-4">challenge Details</h2>
//                         <div className="space-y-4">
//                             <div>
//                                 <h3 className="text-sm font-medium text-gray-500">Type</h3>
//                                 <p className={`mt-1 text-lg font-medium ${
//                                     challenge.type === 'Deterministic' 
//                                         ? 'text-purple-600' 
//                                         : 'text-orange-600'
//                                 }`}>
//                                     {challenge.type}
//                                 </p>
//                             </div>
//                             <div>
//                                 <h3 className="text-sm font-medium text-gray-500">Geolocation</h3>
//                                 <p className="mt-1 text-lg font-medium flex items-center">
//                                     {challenge.geolocation === 'world' ? '🌎 ' : '🏳️ '}
//                                     {locationNames[challenge.geolocation.toLowerCase()]}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Bid Input Section */}
//                     {selectedState && (
//                         <div className="bg-gray-50 p-6 rounded-lg">
//                             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                                 Place Bid for {selectedState}
//                             </h3>
//                             <div className="space-y-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         {challenge.type === 'Deterministic' 
//                                             ? 'Enter yes/no:' 
//                                             : 'Enter value (0-10):'}
//                                     </label>
//                                     <input
//                                         type={challenge.type === 'Deterministic' ? 'text' : 'number'}
//                                         value={stateValue}
//                                         onChange={(e) => setStateValue(e.target.value)}
//                                         className="w-full px-3 py-2 border rounded-md"
//                                         placeholder={challenge.type === 'Deterministic' ? 'yes/no' : '0-10'}
//                                         min={challenge.type === 'Deterministic' ? undefined : "0"}
//                                         max={challenge.type === 'Deterministic' ? undefined : "10"}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Bid Amount ($):
//                                     </label>
//                                     <input
//                                         type="number"
//                                         value={bidAmount}
//                                         onChange={(e) => setBidAmount(e.target.value)}
//                                         className="w-full px-3 py-2 border rounded-md"
//                                         placeholder="Enter bid amount"
//                                         min="0"
//                                     />
//                                 </div>
//                                 <button
//                                     onClick={handleSubmit}
//                                     className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
//                                 >
//                                     Submit Bid
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Selected Regions List */}
//                     {selectedRegions.length > 0 && (
//                         <div className="bg-gray-50 p-6 rounded-lg">
//                             <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Regions</h3>
//                             <div className="space-y-3">
//                                 {selectedRegions.map((region, index) => (
//                                     <div key={index} className="flex justify-between items-center p-3 bg-white rounded-md">
//                                         <div>
//                                             <p className="font-medium">{region.state}</p>
//                                             <p className="text-sm text-gray-500">
//                                                 Value: {region.value}
//                                             </p>
//                                         </div>
//                                         <p className="text-blue-600 font-medium">
//                                             ${region.bid}
//                                         </p>
//                                     </div>
//                                 ))}
//                                 <div className="pt-4 border-t">
//                                     <p className="text-right font-medium">
//                                         Total Bid: ${selectedRegions.reduce((sum, region) => sum + region.bid, 0)}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Right Column - Map */}
//                 <div className="bg-gray-50 p-6 rounded-lg">
//                     <h2 className="text-xl font-semibold text-gray-900 mb-4">Geographic Coverage</h2>
//                     <p className="text-sm text-gray-600 mb-4">
//                         Click on a region to place your bid
//                     </p>
//                     <div className="h-[400px] overflow-hidden">
//                         <SVGMap 
//                             map={getMap(challenge.geolocation)}
//                             className="w-full h-full"
//                             onLocationClick={handleStateClick}
//                             locationClassName={(location) => {
//                                 const isSelected = selectedRegions.some(r => r.state === location.name)
//                                 return `svg-map__location ${
//                                     isSelected ? 'fill-blue-200' : 
//                                     location.name === selectedState ? 'fill-yellow-200' : ''
//                                 }`
//                             }}
//                         />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default challengeDetails
// import { useParams, useNavigate } from 'react-router-dom'
// import { useEffect, useState } from 'react'
// import { SVGMap } from 'react-svg-map'
// import 'react-svg-map/lib/index.css'
// import World from '@svg-maps/world'
// import India from '@svg-maps/india'
// import Japan from '@svg-maps/japan'
// import USA from '@svg-maps/usa'
// import Australia from '@svg-maps/australia'
// import Brazil from '@svg-maps/brazil'
// import Germany from '@svg-maps/germany'
// import Italy from '@svg-maps/italy'
// import Canada from '@svg-maps/canada'
// import challengeData from '../assets/challengeData.json'

// function challengeDetails() {
//     const { id } = useParams()
//     const navigate = useNavigate()
//     const [challenge, setchallenge] = useState(null)
//     const [timeLeft, setTimeLeft] = useState('')
//     const [selectedStates, setSelectedStates] = useState({})
//     const [stateBids, setStateBids] = useState({})

//     const maps = {
//         'world': World,
//         'india': India,
//         'japan': Japan,
//         'usa': USA,
//         'australia': Australia,
//         'brazil': Brazil,
//         'germany': Germany,
//         'italy': Italy,
//         'canada': Canada
//     }

//     const locationNames = {
//         'world': 'World',
//         'india': 'India',
//         'japan': 'Japan',
//         'usa': 'United States',
//         'australia': 'Australia',
//         'brazil': 'Brazil',
//         'germany': 'Germany',
//         'italy': 'Italy',
//         'canada': 'Canada'
//     }

//     const getMap = (location) => {
//         return maps[location.toLowerCase()] || World
//     }

//     useEffect(() => {
//         const foundchallenge = challengeData.challenges.find(c => c.id === id)
//         if (foundchallenge) {
//             setchallenge(foundchallenge)
//         }
//     }, [id])

//     useEffect(() => {
//         if (!challenge || challenge.status !== 'Active') return

//         const calculateTimeLeft = () => {
//             const endDate = new Date()
//             endDate.setDate(endDate.getDate() + 30) // Example: 30 days from now
//             const difference = endDate - new Date()

//             if (difference > 0) {
//                 const days = Math.floor(difference / (1000 * 60 * 60 * 24))
//                 const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
//                 const minutes = Math.floor((difference / 1000 / 60) % 60)
//                 const seconds = Math.floor((difference / 1000) % 60)

//                 return `${days}d ${hours}h ${minutes}m ${seconds}s`
//             }
//             return 'Ended'
//         }

//         const timer = setInterval(() => {
//             setTimeLeft(calculateTimeLeft())
//         }, 1000)

//         return () => clearInterval(timer)
//     }, [challenge])

//     if (!challenge) {
//         return (
//             <div className="flex items-center justify-center min-h-[60vh]">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//             </div>
//         )
//     }




//     return (
//         <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
//             {/* Header Section */}
//             <div className="flex justify-between items-center mb-8 border-b pb-6">
//                 <div>
//                     <h1 className="text-3xl font-bold text-gray-900">{challenge.name}</h1>
//                     <p className="text-gray-500 mt-2">challenge ID: {challenge.id}</p>
//                 </div>
//                 <div className="flex items-center gap-6">
//                     {/* Status Badge */}
//                     <div className="text-right">
//                         <span
//                             className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${
//                                 challenge.status === 'Active'
//                                     ? 'bg-green-100 text-green-800'
//                                     : 'bg-red-100 text-red-800'
//                             }`}
//                         >
//                             {challenge.status}
//                         </span>
//                         {challenge.status === 'Active' && (
//                             <div className="mt-2 text-sm font-medium text-gray-500">
//                                 Time Left: {timeLeft}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Left Column - Details */}
//                 <div className="space-y-6">
//                     <div className="bg-gray-50 p-6 rounded-lg">
//                         <h2 className="text-xl font-semibold text-gray-900 mb-4">challenge Details</h2>
//                         <div className="space-y-4">
//                             <div>
//                                 <h3 className="text-sm font-medium text-gray-500">Type</h3>
//                                 <p className={`mt-1 text-lg font-medium ${
//                                     challenge.type === 'Deterministic' 
//                                         ? 'text-purple-600' 
//                                         : 'text-orange-600'
//                                 }`}>
//                                     {challenge.type}
//                                 </p>
//                             </div>
//                             <div>
//                                 <h3 className="text-sm font-medium text-gray-500">Geolocation</h3>
//                                 <p className="mt-1 text-lg font-medium flex items-center">
//                                     {challenge.geolocation === 'world' ? '🌎 ' : '🏳️ '}
//                                     {locationNames[challenge.geolocation.toLowerCase()]}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right Column - Map */}
//                 <div className="bg-gray-50 p-6 rounded-lg">
//                     <h2 className="text-xl font-semibold text-gray-900 mb-4">Geographic Coverage</h2>
//                     <div className="h-[400px] overflow-hidden">
//                         <SVGMap 
//                             map={getMap(challenge.geolocation)}
//                             className="w-full h-full"
//                             onLocationClick={(event) => {
//                                 console.log('Location clicked:', event)
//                             }}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Summary Section */}
//             <div className="mt-8 p-6 bg-gray-50 rounded-lg">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">challenge Summary</h2>
//                 <p className="text-gray-600 leading-relaxed">
//                     This {challenge.type.toLowerCase()} challenge is currently {challenge.status.toLowerCase()} and targets 
//                     {challenge.geolocation === 'world' ? ' a global audience' : ` users in ${locationNames[challenge.geolocation.toLowerCase()]}`}. 
//                 </p>
//             </div>
//         </div>
//     )
// }

// export default challengeDetails

// import { useParams, useNavigate } from 'react-router-dom'
// import { useEffect, useState } from 'react'
// import { SVGMap } from 'react-svg-map'
// import 'react-svg-map/lib/index.css'
// import World from '@svg-maps/world'
// import India from '@svg-maps/india'
// import Japan from '@svg-maps/japan'
// import USA from '@svg-maps/usa'
// import Australia from '@svg-maps/australia'
// import Brazil from '@svg-maps/brazil'
// import Germany from '@svg-maps/germany'
// import Italy from '@svg-maps/italy'
// import Canada from '@svg-maps/canada'
// import challengeData from '../assets/challengeData.json'

// function challengeDetails() {
//     const { id } = useParams()
//     const navigate = useNavigate()
//     const [challenge, setchallenge] = useState(null)
//     const [timeLeft, setTimeLeft] = useState('')

//     const maps = {
//         'world': World,
//         'india': India,
//         'japan': Japan,
//         'usa': USA,
//         'australia': Australia,
//         'brazil': Brazil,
//         'germany': Germany,
//         'italy': Italy,
//         'canada': Canada
//     }

//     const locationNames = {
//         'world': 'World',
//         'india': 'India',
//         'japan': 'Japan',
//         'usa': 'United States',
//         'australia': 'Australia',
//         'brazil': 'Brazil',
//         'germany': 'Germany',
//         'italy': 'Italy',
//         'canada': 'Canada'
//     }

//     const getMap = (location) => {
//         return maps[location.toLowerCase()] || World
//     }

//     useEffect(() => {
//         const foundchallenge = challengeData.challenges.find(c => c.id === id)
//         if (foundchallenge) {
//             setchallenge(foundchallenge)
//         }
//     }, [id])

//     useEffect(() => {
//         if (!challenge || challenge.status !== 'Active') return

//         const calculateTimeLeft = () => {
//             const endDate = new Date()
//             endDate.setDate(endDate.getDate() + 30) // Example: 30 days from now
//             const difference = endDate - new Date()

//             if (difference > 0) {
//                 const days = Math.floor(difference / (1000 * 60 * 60 * 24))
//                 const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
//                 const minutes = Math.floor((difference / 1000 / 60) % 60)
//                 const seconds = Math.floor((difference / 1000) % 60)

//                 return `${days}d ${hours}h ${minutes}m ${seconds}s`
//             }
//             return 'Ended'
//         }

//         const timer = setInterval(() => {
//             setTimeLeft(calculateTimeLeft())
//         }, 1000)

//         return () => clearInterval(timer)
//     }, [challenge])

//     if (!challenge) {
//         return (
//             <div className="flex items-center justify-center min-h-[60vh]">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//             </div>
//         )
//     }

//     return (
//         <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
//             {/* Header Section */}
//             <div className="flex justify-between items-center mb-8 border-b pb-6">
//                 <div>
//                     <h1 className="text-3xl font-bold text-gray-900">{challenge.name}</h1>
//                     <p className="text-gray-500 mt-2">challenge ID: {challenge.id}</p>
//                 </div>
//                 <div className="flex items-center gap-6">
//                     {/* Status Badge */}
//                     <div className="text-right">
//                         <span
//                             className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${
//                                 challenge.status === 'Active'
//                                     ? 'bg-green-100 text-green-800'
//                                     : 'bg-red-100 text-red-800'
//                             }`}
//                         >
//                             {challenge.status}
//                         </span>
//                         {challenge.status === 'Active' && (
//                             <div className="mt-2 text-sm font-medium text-gray-500">
//                                 Time Left: {timeLeft}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Left Column - Details */}
//                 <div className="space-y-6">
//                     <div className="bg-gray-50 p-6 rounded-lg">
//                         <h2 className="text-xl font-semibold text-gray-900 mb-4">challenge Details</h2>
//                         <div className="space-y-4">
//                             <div>
//                                 <h3 className="text-sm font-medium text-gray-500">Type</h3>
//                                 <p className={`mt-1 text-lg font-medium ${
//                                     challenge.type === 'Deterministic' 
//                                         ? 'text-purple-600' 
//                                         : 'text-orange-600'
//                                 }`}>
//                                     {challenge.type}
//                                 </p>
//                             </div>
//                             <div>
//                                 <h3 className="text-sm font-medium text-gray-500">Geolocation</h3>
//                                 <p className="mt-1 text-lg font-medium flex items-center">
//                                     {challenge.geolocation === 'world' ? '🌎 ' : '🏳️ '}
//                                     {locationNames[challenge.geolocation.toLowerCase()]}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right Column - Map */}
//                 <div className="bg-gray-50 p-6 rounded-lg">
//                     <h2 className="text-xl font-semibold text-gray-900 mb-4">Geographic Coverage</h2>
//                     <div className="h-[400px] overflow-hidden">
//                         <SVGMap 
//                             map={getMap(challenge.geolocation)}
//                             className="w-full h-full"
//                             onLocationClick={(event) => {
//                                 console.log('Location clicked:', event)
//                             }}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Summary Section */}
//             <div className="mt-8 p-6 bg-gray-50 rounded-lg">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">challenge Summary</h2>
//                 <p className="text-gray-600 leading-relaxed">
//                     This {challenge.type.toLowerCase()} challenge is currently {challenge.status.toLowerCase()} and targets 
//                     {challenge.geolocation === 'world' ? ' a global audience' : ` users in ${locationNames[challenge.geolocation.toLowerCase()]}`}. 
//                 </p>
//             </div>
//         </div>
//     )
// }

// export default challengeDetails
