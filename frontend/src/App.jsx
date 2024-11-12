import { createWeb3Modal } from '@web3modal/wagmi/react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet, hedera, hederaTestnet, polygon, polygonAmoy, rootstock, rootstockTestnet,berachainTestnetbArtio } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from './store'
import Layout from './pages/Layout'
import MainContent from './pages/MainContent'
import CampaignDetails from './pages/CampaignDetails'

// 1. Get projectId
const projectId = '2c4250b0ed1c4c85027974613fc83eaf'

// 2. Create wagmiConfig
const metadata = {
  name: 'deApp',
  description: 'deApp for testing',
  url: 'http://localhost:5173', // Update this to match your dev server port
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, arbitrum, hedera, hederaTestnet, polygon, polygonAmoy, rootstock, rootstockTestnet,berachainTestnetbArtio]
const config = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({ wagmiConfig: config, projectId, chains })

// 4. Create query client
const queryClient = new QueryClient()


function App() {


  return (
    <ReduxProvider store={store}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<MainContent />} />
                <Route path="active" element={<MainContent />} />
                <Route path="ended" element={<MainContent />} />
                <Route path="world" element={<MainContent />} />
                <Route path="countries" element={<MainContent />} />
                <Route path="deterministic" element={<MainContent />} />
                <Route path="/country/:code" element={<MainContent />} />
                <Route path="non-deterministic" element={<MainContent />} />
                <Route path="challenge/:id" element={<CampaignDetails />} />
              </Route>
            </Routes>
          </Router>
        </QueryClientProvider>
      </WagmiProvider>
    </ReduxProvider>
  )
}

export default App
