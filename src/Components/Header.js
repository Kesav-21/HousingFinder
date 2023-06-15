import React, { useEffect } from "react";
import logo from '../assets/svg/logo.svg';
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export default function Header() {
  const [pageState,setPageState]=useState("Sign in")
  const location = useLocation();
  const navigate = useNavigate();
  const auth=getAuth()
  useEffect(()=>{
    onAuthStateChanged(auth,(user)=>{
      if(user){
        setPageState("Profile")
      }else
      setPageState("Sign in")
    })
  },[auth])
  const pathMatchRoute = (route) => {
    if (route === location.pathname) {
      return true;
    }
  }
  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-40">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img
            src={logo}
            alt="logo"
            className="h-5 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <div>
          <ul className="flex space-x-10">
            <li className={`cursor-pointer py-3 text-sm font-semibold  border-b-[3px]  ${pathMatchRoute("/") ? "text-black border-b-red-500":"text-gray-100 border-b-transparent"}`} onClick={() => navigate("/")}>
              Home
            </li>
            <li className={`cursor-pointer py-3 text-sm font-semibold  border-b-[3px] ${pathMatchRoute("/offers") ? "text-black border-b-red-500":"text-gray-100 border-b-transparent"}`} onClick={() => navigate("/offers")}>
              Offers
            </li>
            <li className={`cursor-pointer py-3 text-sm font-semibold border-b-[3px] ${(pathMatchRoute("/sign-in") || pathMatchRoute("/profile")) ? "text-black border-b-red-500":"text-gray-100 border-b-transparent"}`} onClick={() => navigate("/profile")}>
              {pageState}
            </li>
          </ul>
        </div>
      </header>
    </div>
  )
}
