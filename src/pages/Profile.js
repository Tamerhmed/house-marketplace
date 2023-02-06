import { useState,useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import {
        updateDoc,
         doc,
         getDocs,
         query,
         where,
         orderBy,
         deleteDoc,
         collection
        
        } from "firebase/firestore";
import { db } from "../firebase.config";
import { async } from "@firebase/util";
import {toast} from 'react-toastify';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';
import ListingItem from "../components/ListingItem";

const Profile = () => {

  const auth = getAuth();
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name:auth.currentUser.displayName,
    email:auth.currentUser.email
  });
const navigate = useNavigate();

const {name, email} = formData;

useEffect(()=>{
  const fetchUserListings = async()=> {
    const listingRef = collection(db, 'listings');
    const q = query(
      listingRef,
      where('userRef', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    )

    const querySnap = await getDocs(q);

    let listings = [];
    querySnap.forEach((doc)=>{
      return listings.push({
        id:doc.id,
        data:doc.data()
      })
    })

    setListings(listings);
    setLoading(false);
  }

  fetchUserListings();
},[auth.currentUser.uid])

const onLogout = ()=> {
  auth.signOut();
  navigate('/');
}

const onSubmit = async()=> {
  try {
    if(auth.currentUser.displayName !== name) {
      await updateProfile(auth.currentUser, {
        displayName:name
      });

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name
      })
    }
    toast.success('username updated');
  } catch (error) {
    toast.error('Could not update profile details');
  }
}

const onChange = (e)=> {
  setFormData((prevState)=> ({
    ...prevState,
    [e.target.id]: e.target.value,
  }))
}

const onDelete = async(listingId)=> {
  if(window.confirm('Are you sure that you want to delete')) {
    await deleteDoc(doc(db, 'listings', listingId))
    const updatedListings = listings.filter((listing)=> {
      return listing.id !== listingId
    })
    setListings(updatedListings);
    toast.success('Successfully deleted listings')
  }
}

const onEdit = (listingId)=> {
  navigate(`/edit-listing/${listingId}`)
}



console.log(listings)
  return (
    <div className="profile">
      <header className="profileHeader">
         <p className="pageHeader">My Profile</p>
         <button
         className="logOut"
         type='button'
         onClick={onLogout}
         >
          Logout
         </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p 
          className="changePersonalDetails"
          onClick={()=> {
            changeDetails && onSubmit()
            setChangeDetails((prevState)=> !prevState)
          }}
          >
            {changeDetails ? 'done' : 'change'}
            </p>
        </div>
        <div className="profileCard">
          <form>
            <input 
            type='text'
            id='name'
            className={!changeDetails ? 'profileName': 'profileNameActive'}
            disabled={!changeDetails}
            value={name}
            onChange={onChange}
            />
             <input 
            type='text'
            id='email'
            className={!changeDetails ? 'profileEmail': 'profileEmailActive'}
            disabled={!changeDetails}
            value={email}
            onChange={onChange}
            />
          </form>
        </div>
        <Link to='/create-listing' className="createListing">
          <img src={homeIcon} alt="home" />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt="arrow right" />
        </Link>
        {
          !loading && listings?.length > 0 && (
            <>
              <p className="listingText">
                Your Listings
              </p>
              <ul className="listingsList">
                {
                  listings.map((listing)=>{
                    return <ListingItem
                     key={listing.id}
                    listing={listing.data}
                     id={listing.id}
                     onDelete={()=> onDelete(listing.id)}
                     onEdit={()=> onEdit(listing.id)}
                     />
                     
                  })
                }
              </ul>
            </>
          )
        }
      </main>
     </div>
  )
}

export default Profile