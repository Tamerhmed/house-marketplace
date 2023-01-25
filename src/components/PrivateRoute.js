import { Navigate, Outlet } from "react-router-dom";
import { useAuthStatus } from "../hooks/useAuthStatus";

const PrivateRoute = () => {
    const {loggedIn, checkingStatus }= useAuthStatus();

    if(checkingStatus) {
        return <h3>Loading ...</h3>
    }

  return (
    <div>
        {loggedIn ? <Outlet /> : <Navigate to='/sign-in' />}
    </div>
  )
}

export default PrivateRoute