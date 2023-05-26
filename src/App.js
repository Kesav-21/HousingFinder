import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import Home from './Pages/Home';
import Offers from './Pages/Offers';
import Profile from './Pages/Profile';
import SignIn from './Pages/SignIn';
import Signup from './Pages/Signup';
import ForgotPassword from './Pages/ForgotPassword';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/sign-in' element={<SignIn/>}/>
          <Route path='/sign-up' element={<Signup/>}/>
          <Route path='/forgot-password' element={<ForgotPassword/>}/>
          <Route path='/offers' element={<Offers/>}/>          
        </Routes>
      </Router>
      
    </div>
  );
}

export default App;
