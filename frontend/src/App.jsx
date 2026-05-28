import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BottomNav, Toast } from './components/shared';
import InstallPrompt from './components/InstallPrompt';

import Intro from './screens/Intro';
import Welcome from './screens/Welcome';
import { Login, Signup, OTP } from './screens/Auth';
import Home from './screens/Home';
import Search from './screens/Search';
import ProductDetail from './screens/ProductDetail';
import Cart from './screens/Cart';
import Checkout from './screens/Checkout';
import { OrderSuccess, Orders, Tracking } from './screens/Orders';
import Account from './screens/Account';
import Wishlist from './screens/Wishlist';

const SHOW_BOTTOM_NAV = ['/', '/search', '/cart', '/orders', '/account', '/wishlist'];

function AppContent() {
  const { pathname } = useLocation();
  const showNav = SHOW_BOTTOM_NAV.includes(pathname);

  return (
    <div className="app-shell">
      <div className="device-frame">
        <Routes>
          <Route path="/intro"         element={<Intro />} />
          <Route path="/welcome"       element={<Welcome />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/signup"        element={<Signup />} />
          <Route path="/otp"           element={<OTP />} />
          <Route path="/"              element={<Home />} />
          <Route path="/search"        element={<Search />} />
          <Route path="/product/:id"   element={<ProductDetail />} />
          <Route path="/cart"          element={<Cart />} />
          <Route path="/checkout"      element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/orders"        element={<Orders />} />
          <Route path="/order/:id"     element={<Orders />} />
          <Route path="/track/:id"     element={<Tracking />} />
          <Route path="/account"       element={<Account />} />
          <Route path="/wishlist"      element={<Wishlist />} />
        </Routes>
        {showNav && <BottomNav />}
        <Toast />
        <InstallPrompt />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
