
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { CartProvider } from './context/CartContext';

// Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import DashboardPage from './pages/DashboardPage';

// Components
import Header from './components/Header';
import VoiceAssistant from './components/VoiceAssistant';

function App() {
  return (
    <Router>
      <CartProvider>
        <Box>
          <Header />
          <Box p={4}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </Box>
          <VoiceAssistant />
          {/* Footer component will go here */}
        </Box>
      </CartProvider>
    </Router>
  );
}

export default App;
