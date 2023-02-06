import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import SwiperCore,{ Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import Spinner from "../components/Spinner";
import shareIcon from '../assets/svg/shareIcon.svg';
import { async } from "@firebase/util";


const Listing = () => {
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shareLinkCopied, setShareLinkCopied] = useState(false);
    
    const navigate = useNavigate();
    const params = useParams();
    const auth = getAuth();


    const handleShareLink = ()=> {
        navigator.clipboard.writeText(window.location.href);
        setShareLinkCopied(true);
        setTimeout(() => {
            setShareLinkCopied(false);
        }, 2000);
    }


useEffect(()=> {
    const fetchListing = async()=> {
        const docRef = doc(db, 'listings',params.listingId);
        const docSnap = await getDoc(docRef)
    
        if(docSnap.exists()) {
            // console.log(docSnap.data());
            setListing(docSnap.data());
            setLoading(false);
        }
    }



    fetchListing();
}, [navigate, params.listingId]);


if(loading) {
    return <Spinner />
}


  return (
    <main>
        <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
            slidesPerView={1}
             pagination={{ clickable: true }}
            
        >
        {listing.imgUrls.map((image, index)=> {
            return <SwiperSlide key={index}>
                <div className="swiperSlideDiv"
                style={{
                    // background:`url(${listing.imgUrls[index]})
                    //  center no-repeat`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                    }}
                >
                <img src={image} alt="house" className="swiperSlideDiv" />
                </div>
            </SwiperSlide>
        })}
        </Swiper>
    <div className="shareIconDiv"
    onClick={()=> handleShareLink()}
    >
        <img src={shareIcon} alt="share link" />
    </div>
        {setShareLinkCopied && <p className="linkCopied">Link Copied!</p>}
        <div className="listingDetails">
            <p className="listingName">
                {listing.name} - $
                {
                    listing.offer ?
                    listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
            </p>
            <p className="listingLocation">
                {listing.location}
            </p>
            <p className="listingType">
                For {listing.type === 'rent' ? 'Rent': 'Sale'}
            </p>
            {listing.offer && (
               <p className="discountedPrice">
                    ${listing.regularPrice - listing.discountedPrice} discounted
               </p> 
            )}
            <ul className="listingDetailsList">
                <li>
                    {listing.bedrooms > 1 ? 
                    `${listing.bedrooms} Bedrooms`
                    : '1 Bedroom'
                }
                </li>
                <li>
                    {listing.bathrooms > 1 ? 
                    `${listing.bathrooms} Bathrooms`
                    : '1 Bathroom'
                }
                </li>
                <li>
                    {listing.parking && 'Parking Spot'}
                </li>
                <li>
                    {listing.furnished && 'Furnished'}
                </li>
            </ul>
            <p className="listingLocationTitle">
                location: {listing.location}
            </p>
            
            {
                auth.currentUser?.uid !== listing.userRef && (
                    // ?listingName=${listing.name}
                    <Link 
                    to={`/contact/${listing.userRef}?listingName=${listing.name}`}
                    className='primaryButton'
                    >
                    Contact Landlord
                    </Link>
                )
            }
        </div>
    </main>
  )
}

export default Listing;