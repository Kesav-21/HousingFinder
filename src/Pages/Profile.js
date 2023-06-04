import { getAuth, updateProfile } from 'firebase/auth';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { updateDoc,doc } from 'firebase/firestore';
import { toast } from 'react-toastify';

export default function Profile() {
  const navigate=useNavigate();
  const auth=getAuth()
  const [changeDetail,setChangeDetail]=useState(false)
  const [formData,setFormData]=useState({
    fname:auth.currentUser.displayName,
    email:auth.currentUser.email
});
const {email,fname}=formData;
const onLogout=()=>{
  auth.signOut()
  navigate('/')
}
const onChange=(e)=>{
  setFormData((prevState)=>({
    ...prevState,
    [e.target.id]:e.target.value,
  }))
}
const onSubmit=async()=>{
  try{
    if(auth.currentUser.displayName !== fname){
      await updateProfile(auth.currentUser,{
        displayName:fname,
      });
      const docRef=doc(db,"users",auth.currentUser.uid)
      await updateDoc(docRef,{
        name:fname
      })
    }toast.success("Profile Updated")
  }catch(error){
    toast.error("Cant Update Profile")
  }
}
  return (
    <>
    <section className='max-w-6xl mx-auto flex justify-center items-center flex-col'>
    <h1 className='text-3xl text-center mt-6 font-bold'>My Profile</h1>
    <div className='w-full md:w-[50%] mt-6 px-3'>
      <form>
        <input type="text" id="fname" value={fname} disabled={!changeDetail} onChange={onChange} className={`w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out mb-6 ${changeDetail && "bg-red-200 focus:bg-red-200"}`} />
        <input type="email" id="email" value={email} disabled className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out mb-6' />
        <div className='flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6'>
          <p className='flex items-center '>Do you want to change your name?
          <span onClick={()=>{ changeDetail && onSubmit();
             setChangeDetail((prevState)=>!prevState)}} className='text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer'>{changeDetail ? "Apply Change":"Edit"}</span>
          </p>
          <p onClick={onLogout} className='text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out'>Sign Out</p>          
        </div>
      </form>
    </div>
    </section>
    </>
  )
}
