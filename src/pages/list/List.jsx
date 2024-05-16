import "./list.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import Datatable from "../../components/datatable/Datatable"
import { useEffect, useState } from "react"
import { getProjectsStream } from "../../helper/firestore"
import { auth } from "../../firebase"
const List = () => {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState("")
  const [projectsCopy, setProjectsCopy] = useState([])
  useEffect(() => {
    if (auth.currentUser === null) {
      return
    }
    getProjectsStream(auth.currentUser.email, setProjects)
  }, [auth.currentUser])

  useEffect(() => {
    setProjectsCopy(projects)
  }, [projects])

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar isShowSearch={true} search={search} setSearch={setSearch} />
        <Datatable
          projects={projects}
          projectsCopy={projectsCopy}
          setProjectsCopy={setProjectsCopy}
          search={search}
        />
      </div>
    </div>
  )
}

export default List
