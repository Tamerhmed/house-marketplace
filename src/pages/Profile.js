import { useState,useEffect } from "react";
import { getAuth } from "firebase/auth";

const Profile = () => {

  const [user, setUser] = useState(null);

  const auth = getAuth();

  useEffect(()=> {
    setUser(auth.currentUser)
  }, []);


  return (
    <div>
          {user? <h1>{user.displayName}</h1>: 'Not Logged in'}
     </div>
  )
}

export default Profile