import React from 'react'
import {FcGoogle} from 'react-icons/fc';
import { toast } from 'react-toastify';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import {serverTimestamp,doc,getDoc,setDoc} from 'firebase/firestore';
import {db} from '../firebase';
import {useNavigate} from 'react-router-dom'

const OAuth = () => {
  const navigate=useNavigate();
  const onGoogleAuth=async (e)=>{
    e.preventDefault()
    try{
      const auth=getAuth()
      const provider=new GoogleAuthProvider()
      const result=await signInWithPopup(auth,provider)
      const user=result.user;
      
      // check database

      const docRef=doc(db,'users',user.uid)
      const docSnap=await getDoc(docRef)
      if(!docSnap.exists()){
        await setDoc(docRef,{
          name:user.displayName,
          email:user.email,
          timestamp:serverTimestamp()
        })
      }
      navigate('/');
    }catch(error){
      toast.error("Couldn't Able to Sign In")
    }
  }
  return (
    <button onClick={onGoogleAuth} className='flex items-center justify-center w-full bg-red-700 text-white px-7 py-3 uppercase text-sm font-medium hover:bg-red-800 active:bg-red-900 shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out rounded'><FcGoogle className='text-2xl bg-white rounded-full mx-4'/>Continue With Google</button>
  )
}

export default OAuth