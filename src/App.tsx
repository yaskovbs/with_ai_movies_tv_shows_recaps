import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './components/HomePage'
import AdvancedHomePage from './components/AdvancedHomePage'
import ContactPage from './components/ContactPage'
import FAQPage from './components/FAQPage'
import Footer from './components/Footer'
import TermsOfServicePage from './components/TermsOfServicePage'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'

function App() {
  const [apiKey, setApiKey] = useState('')

  // Visitor registration is now handled automatically by LocalStorageService

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<AdvancedHomePage apiKey={apiKey} />} />
          <Route path="/basic" element={<HomePage apiKey={apiKey} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
