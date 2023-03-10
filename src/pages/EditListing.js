import {useState, useEffect, useRef} from 'react';
import {onAuthStateChanged, getAuth} from 'firebase/auth';
import { 
        getStorage,
        ref,
        uploadBytesResumable,
        getDownloadURL
    } from "firebase/storage";
import { 
    serverTimestamp,
     addDoc,
     doc,
    collection,
    getDoc,
    updateDoc
    
    } from 'firebase/firestore';
import {db} from '../firebase.config';
import {v4 as uuidv4} from 'uuid';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { async } from '@firebase/util';


const EditListing = () => {
    const [geolocationEnabled, setGeolocationEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [listing, setListing] = useState(null);
    const [formData, setFormData] = useState({
            type: "rent",
            name: "",
			bedrooms: 1,
			bathrooms: 1,
			parking: false,
			furnished: false,
            address: '',
			offer: false,
			regularPrice: 0,
			discountedPrice: 0,
			latitude: 0,
            longitude: 0,
			images: []
    });

    const {
        name,
        type,
        bedrooms,
        bathrooms,
        parking,
        furnished,
        address,
        offer,
        regularPrice,
        discountedPrice,
        images,
        latitude,
        longitude
    } = formData;

    const auth = getAuth();
    const navigate = useNavigate();
    const params = useParams();
    const isMounted = useRef(true);

    //redirect if listing is not user's
    useEffect(()=> {
        if(listing && listing.useRef !== auth.currentUser.uid) {
            toast.error('You can not edit that listing');
            navigate('/');
        }
    }, []);

    useEffect(()=> {
        setLoading(true);
        const fetchListing = async()=> {
            const docRef = doc(db, 'listings', params.listingId);
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()) {
                console.log(docSnap.data());
                setListing(docSnap.data());
                setFormData({...docSnap.data(), address:docSnap.data().location})
                setLoading(false);
            } else {
                navigate('/');
                toast.error('Listing is not exist');
            }
        }

        fetchListing();
    },[params.listingId, navigate]);

    useEffect(()=> {
        if(isMounted) {
            onAuthStateChanged(auth, (user)=> {
                if(user) {
                    setFormData({...formData, userRef: user.uid})
                } else {
                    navigate('/sign-in')
                }
            })
        }

        return ()=> {isMounted.current = false};

    }, [isMounted]);

    const onMutate = (e) => {
        let boolean = null;
        
        if(e.target.value === 'true') {
            boolean = true;
        }
        if(e.target.value === 'false') {
            boolean = false;
        }

        if(e.target.files) {
            setFormData((prevState)=> {
                return {
                    ...prevState,
                    images:e.target.files
                }
            })
        }

        if(!e.target.files) {
            setFormData(prevState => {
                return {
                    ...prevState,
                    [e.target.id]: boolean ?? e.target.value
                }
            })
        }
    }

    const onSubmit = async(e)=> {
        e.preventDefault();
        if(discountedPrice >= regularPrice) {
            setLoading(false);
            toast.error('Discounted price needs to be less than regular price');
            return;
        }
        if(images.length > 6) {
            setLoading(false);
            toast.error('Max 6 images');
            return;
        }

        const geolocation = {};
        geolocation.lat = latitude;
        geolocation.lng = longitude;
        const location = address;

        //store image in firebase
        const storeImage = async (image)=> {
            return new Promise((resolve, reject)=> {
                const storage = getStorage();
                const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
                const storageRef = ref(storage, 'images/' + fileName);
                const uploadTask = uploadBytesResumable(storageRef, image);
                uploadTask.on(
                'state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                  
                }, 
                (error) => {
                    reject(error);
                }, 
                () => {
                    
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL)
                    });
                }
                );
            })
            
        }

      
            const imgUrls = await Promise.all(
                [...images].map((image)=> storeImage(image))
            ).catch(()=> {
                setLoading(false);
                toast.error('Images not uploaded')
                return;
            })
   
            
               
        
        const formDataCopy = {
            ...formData,
            imgUrls,
            location,
            geolocation,
            timestamp:serverTimestamp(),
        };

        console.log(imgUrls)
        
        formDataCopy.location = address;
        delete formDataCopy.images;
        delete formDataCopy.address;
        
        
        !formDataCopy.offer && delete formDataCopy.discountedPrice;
        
        //update listing
        const docRef = doc(db, 'listings', params.listingId);
        await updateDoc(docRef, formDataCopy)


        setLoading(false);
        toast.success('Listing saved');
        navigate(`/category/${formDataCopy.type}/${docRef.id}`)

    }


    if(loading){
        return <Spinner />
    }


  return (
    <div className='profile'>
        <header>
            <p className='pageHeader'>
                Create a Listing
            </p>
        </header>
        <main>
            <form onSubmit={onSubmit}>
                <label className='formLabel'>Sell / Rent</label>
                <div className='formButtons'>
                    <button
                    type='button'
                    className={type === 'sale' ? 
                    'formButtonActive'
                    : 'formButton'
                    }
                    id='type'
                    value='sale'
                    onClick={onMutate}
                    >
                        Sell
                    </button>
                    <button
                    type='button'
                    className={type === 'rent' ? 
                    'formButtonActive'
                    : 'formButton'
                    }
                    id='type'
                    value='sale'
                    onClick={onMutate}
                    >
                        Rent
                    </button>
                </div>
                <label className="formLabel">
                    Name
                </label>
                <input 
                className='formInputName'
                type='text'
                id='name'
                value={name}
                onChange={onMutate}
                maxLength='32'
                minLength='10'
                required
                />
                <div className="formRooms flex">
                    <div>
                        <label className='formLabel'>Bedrooms</label>
                         <input 
                            className='formInputSmall'
                            type='number'
                            id='bedrooms'
                            value={bedrooms}
                            onChange={onMutate}
                            max='50'
                            min='1'
                            required
                            />
                    </div>
                    <div>
                        <label className='formLabel'>Bathrooms</label>
                         <input 
                            className='formInputSmall'
                            type='number'
                            id='bathrooms'
                            value={bathrooms}
                            onChange={onMutate}
                            max='50'
                            min='1'
                            required
                            />
                    </div>
                </div>
                <label className='formLabel'>Parking spot</label>
                    <div className='formButtons'>
                        <button
                            className={parking ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='parking'
                            value={true}
                            onClick={onMutate}
                            max='50'
                            min='1'
                            required
                        >
                            Yes
                        </button>
                        <button
                            className={!parking && parking !== null ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='parking'
                            value={false}
                            onClick={onMutate}
                            max='50'
                            min='1'
                            required
                        >
                            No
                        </button>
                    </div>
                <label className='formLabel'>Furnished</label>
                    <div className='formButtons'>
                        <button
                            className={furnished ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='furnished'
                            value={true}
                            onClick={onMutate}
            
                        >
                            Yes
                        </button>
                        <button
                            className={!furnished && furnished !== null ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='furnished'
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>
                     <label className='formLabel'>Address</label>
                     <textarea 
                        className='formInputAddress'
                        type='text'
                        id='address'
                        value={address}
                        onChange={onMutate}
                        required
                     />
                     {
                        geolocationEnabled && (
                            <div className='formLatLng flex'>
                                <div>
                                     <label className='formLabel'>Latitude</label>
                                      <input 
                                        className='formInputSmall'
                                        type='number'
                                        id='latitude'
                                        value={latitude}
                                        onChange={onMutate}
                                        required
                                        />
                                </div>
                                <div>
                                     <label className='formLabel'>Longitude</label>
                                      <input 
                                        className='formInputSmall'
                                        type='number'
                                        id='longitude'
                                        value={longitude}
                                        onChange={onMutate}
                                        required
                                        />
                                </div>
                            </div>
                        )
                     }
                     <label className='formLabel'>Offer</label>
                    <div className='formButtons'>
                        <button
                            className={offer ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='offer'
                            value={true}
                            onClick={onMutate}
            
                        >
                            Yes
                        </button>
                        <button
                            className={!offer && offer !== null ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='offer'
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div> 
                    <label className='formLabel'>Regular Price</label>
                    <div className='formPriceDiv'>
                         <input 
                            className='formInputSmall'
                            type='number'
                            id='regularPrice'
                            value={regularPrice}
                            onChange={onMutate}
                            max='7500000'
                            min='50'
                            required
                            />
                            {
                                type === 'rent' && (
                                    <p className='formPriceText'>$ / Month</p>
                                )
                            }
                    </div>
                    {
                        offer && (
                            <>
                                <label className='formLabel'>Discounted Price</label>
                                <input 
                                    className='formInputSmall'
                                    type='number'
                                    id='discountedPrice'
                                    value={discountedPrice}
                                    onChange={onMutate}
                                    max='7500000'
                                    min='50'
                                    required={offer}
                                />
                            </>
                        )
                    }
                    <label className='formLabel'>Images</label>
                    <p className="imagesInfo">
                        The first image will be the cover (max 6).
                    </p>
                    <input 
                        className='formInputFile'
                        type='file'
                        id='images'
                        onChange={onMutate}
                        max='6'
                        accept='.jpg,.png,.jpeg'
                        multiple
                        required
                    />
                    <button 
                    className='primaryButton createListingButton'
                    type='submit'
                    >
                        Create Listing
                    </button>
            </form>
        </main>
    </div>
  )
}

export default EditListing;