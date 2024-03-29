import { getAuth, updateProfile } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { updateDoc, doc, collection, query, orderBy,where,getDocs, deleteDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { FcHome } from "react-icons/fc";
import ListingItem from "../Components/ListingItem";

export default function Profile() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [listings,setListings]=useState(null);
  const [loading,setLoading]=useState(true);
  const [changeDetail, setChangeDetail] = useState(false);
  const [formData, setFormData] = useState({
    fname: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const { email, fname } = formData;
  const onLogout = () => {
    auth.signOut();
    navigate("/");
  };
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };
  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== fname) {
        await updateProfile(auth.currentUser, {
          displayName: fname,
        });
        const docRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(docRef, {
          name: fname,
        });
      }
      toast.success("Profile Updated");
    } catch (error) {
      toast.error("Cant Update Profile");
    }
  };

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      let listings = [];
      querySnap.forEach((doc)=>{
        return listings.push({
          id:doc.id,
          data:doc.data(),
        })
      })
      setListings(listings);
      setLoading(false)
    };
    fetchUserListings();
  }, [auth.currentUser.uid]);

  const onDelete=async(listingId)=>{
    if(window.confirm("Are you sure want to Delete")){
      await deleteDoc(doc(db,'listings',listingId))
      const updatedListings=listings.filter((listing)=>listing.id!==listingId)
      setListings(updatedListings)
      toast.success("Successfully Deleted Listing")
    }
  }
  const onEdit=(listingId)=>{
    navigate(`/edit-listing/${listingId}`)
  }

  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
        <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3">
          <form>
            <input
              type="text"
              id="fname"
              value={fname}
              disabled={!changeDetail}
              onChange={onChange}
              className={`w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out mb-6 ${
                changeDetail && "bg-red-200 focus:bg-red-200"
              }`}
            />
            <input
              type="email"
              id="email"
              value={email}
              disabled
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out mb-6"
            />
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6">
              <p className="flex items-center ">
                Do you want to change your name?
                <span
                  onClick={() => {
                    changeDetail && onSubmit();
                    setChangeDetail((prevState) => !prevState);
                  }}
                  className="text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer"
                >
                  {changeDetail ? "Apply Change" : "Edit"}
                </span>
              </p>
              <p
                onClick={onLogout}
                className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"
              >
                Sign Out
              </p>
            </div>
          </form>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white uppercase px-7 py-3 text-sm font-medium rounded shadow-md hover:bg-blue-700 transition ease-in-out duration-150 hover:shadow-lg active:bg-blue-800"
          >
            <Link
              to="/create-listing"
              className="flex justify-center items-center"
            >
              <FcHome className="mr-2 text-3xl bg-red-200 rounded-full p-1 border-2" />{" "}
              Sell or rent your home
            </Link>
          </button>
        </div>
      </section>
      <div className="max-w-6xl px-3 mt-6 mx-auto">
        {!loading && listings.length>0 &&(
        <>
          <h2 className="text-2xl text-center font-semibold mb-6 mt-6">My Listings</h2>
          <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-6 mb-6">
            {listings.map((listing)=>(
              <ListingItem key={listing.id} id={listing.id} listing={listing.data} onDelete={()=>onDelete(listing.id)} onEdit={()=>onEdit(listing.id)}/>
            ))}
          </ul>
        </>
        )}
      </div>
    </>
  );
}
