import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import Home from './Pages/Home';
import Offers from './Pages/Offers';
import Profile from './Pages/Profile';
import SignIn from './Pages/SignIn';
import Signup from './Pages/Signup';
import ForgotPassword from './Pages/ForgotPassword';
import Header from './Components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './Components/PrivateRoute';
import CreateLisiting from './Pages/CreateLisiting';
import EditListing from './Pages/EditListing';
import Listing from './Pages/Listing';
import Category from './Pages/Category';

function App() {
  return (
    <div>
      <Router>
        <Header/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='profile' element={<PrivateRoute/>}>
            <Route path='/profile' element={<Profile/>}/>
          </Route>
          <Route path='/sign-in' element={<SignIn/>}/>
          <Route path='/sign-up' element={<Signup/>}/>
          <Route path='/forgot-password' element={<ForgotPassword/>}/>
          <Route path='/category/:categoryName/:listingId' element={<Listing/>}/>
          <Route path='/offers' element={<Offers/>}/>
          <Route path='/category/:categoryName' element={<Category/>}/>
          <Route path='create-listing' element={<PrivateRoute/>}>
            <Route path='/create-listing' element={<CreateLisiting/>}/> 
          </Route>
          <Route path='edit-listing' element={<PrivateRoute/>}>
            <Route path='/edit-listing/:listingId' element={<EditListing/>}/> 
          </Route>    
        </Routes>
      </Router>
      <ToastContainer
position="bottom-center"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="dark"
/>
    </div>
  );
}

export default App;
