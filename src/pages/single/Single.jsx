import "./single.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import Chart from "../../components/chart/Chart"
import List from "../../components/table/Table"
import { useParams } from "react-router-dom"
import { auth } from "../../firebase"
import { useEffect, useState } from "react"
import { getProjects } from "../../helper/firestore"
import Milestones from "../../components/milestones/milestone.jsx"

const Single = () => {
  const { projectId } = useParams()
  console.log(projectId)

  const [project, setProject] = useState({})
  const [data, setData] = useState([])
  useEffect(() => {
    if (auth.currentUser === null) {
      return
    }
    console.log(auth.currentUser)
    getProjects(auth.currentUser.email)
      .then((data) => {
        setData(data)
        const project = data.projects[projectId] ?? null
        if (project) {
          setProject(project)
        }
        console.log(project)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [auth.currentUser])

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            {/* <div className="editButton">Edit</div> */}
            <h1 className="title">Project Information</h1>
            <div className="item">
            {/* {data.org_logo} */}
              <img
                src={
                  data.org_logo ??
                  "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
                }
                alt=""
                className="itemImg"
              />
              <div className="details">
                <h1 className="itemTitle">{project.projectname ?? ""}</h1>
                <div className="detailItem">
                  <span className="itemKey">Email:</span>
                  <span className="itemValue">
                    {auth?.currentUser?.email ?? ""}
                  </span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Current Released Amount:</span>
                  <span className="itemValue">
                    {project.currentamount ?? 0}
                  </span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Pledge Amount:</span>
                  <span className="itemValue">{project.pledgeamount ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="right">
            <Chart aspect={3 / 1} title="Donations ( Last 7 Days)" />
          </div>
        </div>
        <div className="bottom">
        
        <h1 className="title">Milestones</h1>
        {project && <Milestones project={project}/>}
        {/* <List/> */}
        </div>
      </div>
    </div>
  )
}

export default Single
