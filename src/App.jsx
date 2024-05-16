import Home from "./pages/home/Home"
import Login from "./pages/login/Login"
import List from "./pages/list/List"
import Single from "./pages/single/Single"
import New from "./pages/new/New"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { productInputs, userInputs } from "./formSource"
import "./style/dark.scss"
import { useContext, useState } from "react"
import { DarkModeContext } from "./context/darkModeContext"
import { useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"
import Signup from "./pages/signup/Signup"
import Profile from './pages/profile/profile'

function App() {
  const { darkMode } = useContext(DarkModeContext)
  // get auth
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
          >
            <Route index element={user? <Home />: <Navigate to={'login'} />} />
            <Route path="dashboard" 
            element={!user? <Login />: <Navigate to={'/'} />} 
              
            />            <Route path="login" 
            element={!user? <Login />: <Navigate to={'/'} />} 
              
            />
            <Route path="signup" 
            element={<Signup />} 
              
            />
            <Route path="users"> 
              <Route index element={<Profile />} />
              <Route path=":userId" element={<Single />} />
              <Route
                path="new"
                element={<New inputs={userInputs} title="Add Details" />}
              />
            </Route>
            <Route path="projects">
              <Route index element={<List />} />
              <Route path=":projectId" element={<Single />} />
              <Route
                path="new"
                element={<New inputs={productInputs} title="Add New Project" />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
