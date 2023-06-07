import React, { useEffect,useState } from 'react'
import {db} from '../firebase'
import { getDocs,collection,query,where,orderBy,limit, startAfter } from 'firebase/firestore'
import { toast } from 'react-toastify'
import Spinner from '../Components/Spinner'
import ListingItem from '../Components/ListingItem'

export default function Offers() {
  const [offerListings,setOfferListings]=useState(null)
  const [loading,setLoading]=useState(true)
  const [lastFetchedListing,setLastFetchedListing]=useState(null);
  useEffect(()=>{
    const fetchOffers=async()=>{
      try{
        const offerRef=collection(db,'listings')
        const q=query(offerRef,where('offer','==',true),orderBy('timestamp','desc'),limit(8))
        const querySnap=await getDocs(q);
        const lastVisible=querySnap.docs[querySnap.docs.length-1]
        setLastFetchedListing(lastVisible)
        const offers=[];
        querySnap.forEach((doc)=>{
          return offers.push({
            id:doc.id,
            data:doc.data()
          })
        })
        setOfferListings(offers)
        setLoading(false)
      }catch(error){
        toast.error("Couldn't fetch the offers listing")
      }
    }
    fetchOffers()
  },[]);

  const onFetchMoreListings=async()=>{
    try{
      const offerRef=collection(db,'listings')
      const q=query(offerRef,where('offer','==',true),orderBy('timestamp','desc'),startAfter(lastFetchedListing),limit(4))
      const querySnap=await getDocs(q);
      const lastVisible=querySnap.docs[querySnap.docs.length-1]
      setLastFetchedListing(lastVisible)
      const offers=[];
      querySnap.forEach((doc)=>{
        return offers.push({
          id:doc.id,
          data:doc.data()
        })
      })
      setOfferListings((prevState)=>[...prevState,...offers])
      setLoading(false)
    }catch(error){
      toast.error("Couldn't fetch the offers listing")
    }
    
  }

  return (
    <div className='max-w-6xl mx-auto px-3'>
      <h1 className='text-3xl text-center mt-6 font-bold mb-6'>Offers</h1>
      {loading ? (<Spinner/>):
      offerListings.length>0 ?(
        <>
          <main>
            <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
              {offerListings.map((offer)=>(
                <ListingItem key={offer.id} id={offer.id} listing={offer.data}/>
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
