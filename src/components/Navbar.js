import { useNavigate, useLocation } from "react-router-dom";
import {ReactComponent as OfferIcon} from '../assets/svg/localOfferIcon.svg';
import {ReactComponent as ExploreIcon} from '../assets/svg/exploreIcon.svg';
import {ReactComponent as PersonOutlineIcon} from '../assets/svg/personOutlineIcon.svg';


const Navbar = () => {
     const navigate = useNavigate();
     const location = useLocation();

const pathMatchRouter = (router)=> {
     if(router === location.pathname) {
          return true;
     }
}

  return (
    <footer className="navbar">
          <nav className="navbarNav">
               <ul className="navbarListItems">
                    <li
                     className="navbarListItem"
                     onClick={()=> navigate('/')}
                     >
                         <ExploreIcon
                              fill={pathMatchRouter('/') ? '#2c2c2c': '#8f8f8f'}
                              width='36px'
                              height='36px'
                           />
                         <p
                          className={pathMatchRouter('/') ?
                           'navbarListItemNameActive'
                         : 'NavbarListItemName'
                         }>
                              Explore
                         </p>
                    </li>
                    <li 
                    className="navbarListItem"
                    onClick={()=> navigate('/offers')}
                    >
                         <OfferIcon
                              fill={pathMatchRouter('/offers') ? '#2c2c2c': '#8f8f8f'}
                              width='36px'
                              height='36px'
                           />
                         <p
                         className={pathMatchRouter('/offers') ?
                           'navbarListItemNameActive'
                         : 'NavbarListItemName'
                         }>
                              Offers
                         </p>
                    </li>
                    <li 
                    className="navbarListItem"
                    onClick={()=> navigate('/profile')}
                    >
                         <PersonOutlineIcon
                              fill={pathMatchRouter('/profile') ? '#2c2c2c': '#8f8f8f'}
                              width='36px'
                              height='36px'
                           />
                         <p
                         className={pathMatchRouter('/profile') ?
                           'navbarListItemNameActive'
                         : 'NavbarListItemName'
                         }>
                              Profile
                         </p>
                    </li>
               </ul>
          </nav>
     </footer>
  )
}

export default Navbar;