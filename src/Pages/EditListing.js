import React, { useEffect } from 'react'
import { useState } from "react";
import { toast } from "react-toastify";
import Spinner from "../Components/Spinner";
import {getStorage, uploadBytesResumable,ref,getDownloadURL} from 'firebase/storage'
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { serverTimestamp,doc , getDoc,updateDoc} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router";

const EditLisiting = () => {
  const navigate=useNavigate();
  const auth=getAuth();
  const [geoLocationEnabled,setGeoLocationEnabled]=useState(true);
  const [loading,setLoading]=useState(false);
  const [listing,setListing]=useState(null);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms:1,
    bathrooms:1,
    parking:false,
    furnished:false,
    address:"",
    description:"",
    offer:true,
    regularPrice:0,
    discountedPrice:0,
    latitude:0,
    longitude:0,
    images:{}
  });
  const { type, name,bedrooms,bathrooms,parking,furnished,address,description,offer,regularPrice, discountedPrice,latitude,longitude,images } = formData;

  const params=useParams()

  useEffect(()=>{
    if(listing && listing.userRef!== auth.currentUser.uid){
        toast.error("You cannot edit the listing")
        navigate('/')
    }
  },[auth.currentUser.uid,navigate,listing])

  useEffect(()=>{
    setLoading(true);
    const fetchListing=async()=>{
        const docRef=doc(db,'listings',params.listingId)
        const docSnap=await getDoc(docRef);
        if(docSnap.exists()){
            setListing(docSnap.data());
            setFormData({...docSnap.data()})
            setLoading(false);
        }else{
            navigate('/')
            toast.error("Listing doesn't exists");
        }
    }
    fetchListing()
  },[navigate,params.listingId]);

  
  const onChange = (e) => {
    var boolean=null;
    if(e.target.value==="true"){
      boolean=true
    }
    if(e.target.value==="false"){
      boolean=false
    }
    // Files
    if(e.target.files){
      setFormData((prevState)=>({
        ...prevState,
        images:e.target.files
      }));
    }
    // Text/number/Boolean
    if(!e.target.files){
      setFormData((prevState)=>({
        ...prevState,
        [e.target.id]:boolean ?? e.target.value,
      }));
    }
  };

  const onSubmit=async(e)=>{
    e.preventDefault();
    setLoading(true);
    if(+discountedPrice>= +regularPrice){
      setLoading(false);
      toast.error("Discounted Price should be less than regular price");
    return;
    }
    if(images.length>6){
      setLoading(false);
      toast.error("Max 6 images are allowed");
      return;
    }
    let geolocation={}
    if(!geoLocationEnabled){
      geolocation.lat=latitude;
      geolocation.lng=longitude;
    }

    const storeImage=async(image)=>{
      return new Promise((resolve,reject)=>{
        const storage=getStorage()
        const filename=`${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef=ref(storage,filename);
        const uploadTask=uploadBytesResumable(storageRef,image);
        uploadTask.on('state_changed', 
  (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    reject(error)
  }, 
  () => {
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      resolve(downloadURL);
    });
  }
);
      })
    }

    const imgUrls=await Promise.all(
      [...images].map((image)=>storeImage(image))).catch((error)=>{
        setLoading(false)
        toast.error("Images not uploaded")
        return;
      })
    
      const formDataCopy={
        ...formData,
        imgUrls,
        geolocation,
        timestamp:serverTimestamp(),
        userRef:auth.currentUser.uid
      };
      delete formDataCopy.images;
      !formDataCopy.offer && delete formDataCopy.discountedPrice;
      const docRef=doc(db,'listings',params.listingId);
      await updateDoc(docRef,formDataCopy);
      setLoading(false)
      toast.success("Listing Updated");
      navigate(`/category/${formDataCopy.type}/${docRef.id}`);

  }

  if(loading){
    return <Spinner/>;
  }

  return (
    <main className="max-w-md px-2 mx-auto">
      <h1 className="text-3xl text-center mt-6 font-bold">Edit Listing</h1>
      <form onSubmit={onSubmit}>
        <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
        <div className="flex">
          <button
            type="button"
            id="type"
            value="sale"
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition ease-in-out w-full ${
              type === "rent"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            Sell
          </button>
          <button
            type="button"
            id="type"
            value="rent"
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition ease-in-out w-full ${
              type === "sale"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            Rent
          </button>
        </div>
        <p className="text-lg mt-6 font-semibold">Name</p>
        <input
          type="text"
          id="name"
          value={name}
          onChange={onChange}
          placeholder="Name"
          maxLength="32"
          minLength="10"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        <div className="flex space-x-6 mb-6">
          <div>
            <p className="text-lg font-semibold">Beds</p>
            <input type="number" id="bedrooms" value={bedrooms} onChange={onChange} min='1' max='50' required className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 wase-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"/>
          </div>
          <div>
            <p className="text-lg font-semibold">Baths</p>
            <input type="number" id="bathrooms" value={bathrooms} onChange={onChange} min='1' max='50' required className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 wase-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"/>
          </div>
        </div>
        <p className="text-lg mt-6 font-semibold">Parking spot</p>
        <div className="flex">
          <button
            type="button"
            id="parking"
            value={true}
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition ease-in-out w-full ${
              !parking 
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            YES
          </button>
          <button
            type="button"
            id="parking"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition ease-in-out w-full ${
              parking
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            NO
          </button>
        </div>
        <p className="text-lg mt-6 font-semibold">Furnished</p>
        <div className="flex">
          <button
            type="button"
            id="furnished"
            value={true}
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition ease-in-out w-full ${
              !furnished
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            YES
          </button>
          <button
            type="button"
            id="furnished"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition ease-in-out w-full ${
              furnished
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            NO
          </button>
        </div>
        <p className="text-lg mt-6 font-semibold">Address</p>
        <textarea
          type="text"
          id="address"
          value={address}
          onChange={onChange}
          placeholder="Address"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        {!geoLocationEnabled && (
          <div className="flex space-x-6 justify-start mb-6">
            <div>
            <p className="text-lg font-semibold">Latitude</p>
            <input type="number" id="latitude" min="-90" max="90" value={latitude} onChange={onChange} required className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focusLbg-white focus:text-gray-700 focus:border-slate-600 text-center"/>
          </div>
          <div>
          <p className="text-lg font-semibold">Longitude</p>
          <input type="number" id="longitude" min="-180" max="180" value={longitude} onChange={onChange} required className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focusLbg-white focus:text-gray-700 focus:border-slate-600 text-center"/>
        </div>
        </div>
        )}
        <p className="text-lg  font-semibold">Description</p>
        <textarea
          type="text"
          id="description"
          value={description}
          onChange={onChange}
          placeholder="Name"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        <p className="text-lg font-semibold">Offer</p>
        <div className="flex mb-6">
          <button
            type="button"
            id="offer"
            value={true}
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition ease-in-out w-full ${
              !offer
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            YES
          </button>
          <button
            type="button"
            id="offer"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition ease-in-out w-full ${
              offer
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            NO
          </button>
        </div>
        <div className="flex items-center mb-6 ">
          <div >
            <p className="text-semibold text-lg">Regular Price</p>
            <div className="flex w-full justify-center items-center space-x-6">
              <input type="number" id="regularPrice" value={regularPrice} onChange={onChange} min="50" max="1000000" required className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"/>
              {type ==="rent" && (
              <div className="">
                <p className="text-md w-full whitespace-nowrap">Rs /month</p>
              </div>
            )}
            </div>
            
          </div>
        </div>
        {offer && (
        <div className="flex items-center mb-6 ">
          <div >
            <p className="text-semibold text-lg">Discounted Price</p>
            <div className="flex w-full justify-center items-center space-x-6">
              <input type="number" id="discountedPrice" value={discountedPrice} onChange={onChange} min="50" max="1000000" required={offer} className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"/>
              {type ==="rent" && (
              <div className="">
                <p className="text-md w-full whitespace-nowrap">Rs /month</p>
              </div>
            )}
            </div>
          </div>
        </div>)}
        <div className="mb-6">
          <p className="text-semibold text-lg">Images</p>
          <p className="text-gray-600">The First image will be the cover (max 6)</p>
          <input type="file" id="images" onChange={onChange} accept=".jpg,.png,.jpeg" multiple required className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-15- ease-in-out focus:bg-white focus:border-slate-600"/>
        </div>
        <button type="submit" className="mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">Edit Listing</button>
      </form>
    </main>
  );
};

export default EditLisiting;
