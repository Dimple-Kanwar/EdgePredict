import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import ConnectButton from '../../ConnectButton'
import Logo from '../../../src/assets/pics/EdgePredictLogo.jpg'

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()

  // Check if current path is a challenge page
  const isChallengePage = location.pathname.includes('/challenge/')

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-[#131921] text-white">
      {/* Top Navigation Bar */}
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Left side with logo */}
        <div className="flex-1">
          <Link to="/" className="flex items-center space-x-2">
            <img src={Logo} alt="EdgePredictLogo" className="h-8 w-8 rounded-full" />
            <span className="text-lg font-bold">Challenge Manager</span>
          </Link>
        </div>

        {/* Right side with connect button */}
        <div className="flex items-center">
          <ConnectButton />
        </div>
      </div>

      {/* Bottom Navigation Bar - Only show if not on challenge page */}
      {!isChallengePage && (
        <div className="bg-[#232f3e] py-2">
          <div className="container mx-auto px-4">
            <nav className="flex items-center space-x-6">
              {/* Hamburger Menu */}
              <button className="lg:hidden">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Navigation Links */}
              <Link 
                to="/active" 
                className="text-sm text-white hover:text-gray-300 transition-colors whitespace-nowrap"
              >
                Active
              </Link>
              <Link 
                to="/ended" 
                className="text-sm text-white hover:text-gray-300 transition-colors whitespace-nowrap"
              >
                Ended
              </Link>
              <Link 
                to="/world" 
                className="text-sm text-white hover:text-gray-300 transition-colors whitespace-nowrap"
              >
                World
              </Link>
              
              {/* Countries Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-sm text-white hover:text-gray-300 transition-colors flex items-center whitespace-nowrap"
                >
                  Countries
                  <svg
                    className={`ml-1 h-4 w-4 transform transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {['India', 'Japan', 'United States', 'France', 'Germany', 'Italy', 'Brazil'].map((country) => (
                        <Link
                          key={country}
                          to={`/country/${country.toLowerCase()}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {country}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link 
                to="/deterministic" 
                className="text-sm text-white hover:text-gray-300 transition-colors whitespace-nowrap"
              >
                Deterministic
              </Link>
              <Link 
                to="/non-deterministic" 
                className="text-sm text-white hover:text-gray-300 transition-colors whitespace-nowrap"
              >
                Non Deterministic
              </Link>
              {/* <div className="flex items-center">
                <ConnectButton />
              </div> */}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
// import { Link } from 'react-router-dom'
// import { useState, useRef, useEffect } from 'react'

// function Navbar() {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false)
//   const dropdownRef = useRef(null)

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false)
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [])

//   return (
//     <header className="bg-[#131921] text-white">
//       {/* Top Navigation Bar */}
//       <div className="container mx-auto px-4 py-2 flex items-center justify-between">
//         {/* Logo */}
//         <Link to="/" className="flex items-center space-x-2">
//           <svg 
//             className="h-6 w-6 text-blue-500" 
//             fill="none" 
//             viewBox="0 0 24 24" 
//             stroke="currentColor"
//           >
//             <path 
//               strokeLinecap="round" 
//               strokeLinejoin="round" 
//               strokeWidth={2} 
//               d="M13 10V3L4 14h7v7l9-11h-7z"
//             />
//           </svg>
//           <span className="text-lg font-bold">challenge Manager</span>
//         </Link>
//       </div>

//       {/* Bottom Navigation Bar */}
//       <div className="bg-[#232f3e] py-2">
//         <div className="container mx-auto px-4">
//           <nav className="flex items-center space-x-6">
//             {/* Hamburger Menu */}
//             <button className="lg:hidden">
//               <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             </button>

//             {/* Navigation Links */}
//             <Link 
//               to="/active" 
//               className="text-sm text-white hover:text-gray-300 transition-colors whitespace-nowrap"
//             >
//               Active
//             </Link>
//             <Link 
//               to="/ended" 
//               className="text-sm text-white hover:text-gray-300 transition-colors whitespace-nowrap"
//             >
//               Ended
//             </Link>
//             <Link 
//               to="/world" 
//               className="text-sm text-white hover:text-gray-300 transition-colors whitespace-nowrap"
//             >
//               World
//             </Link>
            
//             {/* Countries Dropdown */}
//             <div className="relative" ref={dropdownRef}>
//               <button
//                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                 className="text-sm text-white hover:text-gray-300 transition-colors flex items-center whitespace-nowrap"
//               >
//                 Countries
//                 <svg
//                   className={`ml-1 h-4 w-4 transform transition-transform ${
//                     isDropdownOpen ? 'rotate-180' : ''
//                   }`}
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               </button>
//               {isDropdownOpen && (
//                 <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
//                   <div className="py-1">
//                     {['India', 'Japan', 'United States', 'France', 'Germany', 'Italy', 'Brazil'].map((country) => (
//                       <Link
//                         key={country}
//                         to={`/country/${country.toLowerCase()}`}
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         onClick={() => setIsDropdownOpen(false)}
//                       >
//                         {country}
//                       </Link>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <Link 
//               to="/deterministic" 
//               className="text-sm text-white hover:text-gray-300 transition-colors whitespace-nowrap"
//             >
//               Deterministic
//             </Link>
//             <Link 
//               to="/non-deterministic" 
//               className="text-sm text-white hover:text-gray-300 transition-colors whitespace-nowrap"
//             >
//               Non Deterministic
//             </Link>
//           </nav>
//         </div>
//       </div>
//     </header>
//   )
// }

// export default Navbar