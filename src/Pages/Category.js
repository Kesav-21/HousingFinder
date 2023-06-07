import React, { useEffect,useState } from 'react'
import {db} from '../firebase'
import { getDocs,collection,query,where,orderBy,limit, startAfter } from 'firebase/firestore'
import { toast } from 'react-toastify'
import Spinner from '../Components/Spinner'
import ListingItem from '../Components/ListingItem'
import { useParams } from 'react-router'

export default function Category() {
    const params=useParams();
  const [listings,setListings]=useState(null)
  const [loading,setLoading]=useState(true)
  const [lastFetchedListing,setLastFetchedListing]=useState(null);
  useEffect(()=>{
    const fetchOffers=async()=>{
      try{
        const listingRef=collection(db,'listings')
        const q=query(listingRef,where('type','==',params.categoryName),orderBy('timestamp','desc'),limit(8))
        const querySnap=await getDocs(q);
        const lastVisible=querySnap.docs[querySnap.docs.length-1]
        setLastFetchedListing(lastVisible)
        const listings=[];
        querySnap.forEach((doc)=>{
          return listings.push({
            id:doc.id,
            data:doc.data()
          })
        })
        setListings(listings)
        setLoading(false)
      }catch(error){
        toast.error("Couldn't fetch the offers listing")
      }
    }
    fetchOffers()
  },[params.categoryName]);

  const onFetchMoreListings=async()=>{
    try{
      const listingRef=collection(db,'listings')
      const q=query(listingRef,where('type','==',params.categoryName),orderBy('timestamp','desc'),startAfter(lastFetchedListing),limit(4))
      const querySnap=await getDocs(q);
      const lastVisible=querySnap.docs[querySnap.docs.length-1]
      setLastFetchedListing(lastVisible)
      const listings=[];
      querySnap.forEach((doc)=>{
        return listings.push({
          id:doc.id,
          data:doc.data()
        })
      })
      setListings((prevState)=>[...prevState,...listings])
      setLoading(false)
    }catch(error){
      toast.error("Couldn't fetch the offers listing")
    }
    
  }

  return (
    <div className='max-w-6xl mx-auto px-3'>
      <h1 className='text-3xl text-center mt-6 font-bold mb-6'>{params.categoryName==="rent"? "Place for rent":"Places for Sale"}</h1>
      {loading ? (<Spinner/>):
      listings.length>0 ?(
        <>
          <main>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
              {listings.map((listing)=>(
                <ListingItem key={listing.id} id={listing.id} listing={listing.data}/>
              ))}
            </ul>
          </main>
          {lastFetchedListing && (
            <div className='flex justify-center items-center'>
              <button onClick={onFetchMoreListings} className='bg-white px-3 py-1.5 text-gray-700 border-gray-300 mb-6 mt-6 hover:border-slate-600 rounded transition duration-150 ease-in-out'>Load More</button>
            </div>
          )}
        </>
      ):(
        <p>There are no Offers Currently</p>
      )}
    </div>
  )
}
