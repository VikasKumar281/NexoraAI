import { useEffect } from "react";
import Home from "./pages/Home.jsx";
import getCurrentUser from "./features/getCurrentUser.js";

function App() {
  useEffect(()=>{
    const getUser = async()=>{
      await getCurrentUser()
    }
    getUser()
  },[])
  return (
    <>
     <Home/>
    </>
  )
}

export default App;