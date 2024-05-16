import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns,  } from "../../datatablesource";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { deleteProject } from "../../helper/firestore";
import { auth } from "../../firebase"

const Datatable = ({projects, setProjectsCopy, projectsCopy, search}) => {
  // const [data, setData] = useState(userRows);

  useEffect(() => {

    const searchLowerCase = search.trim().toLowerCase();

    // Filter projects based on the search keyword (ignoring case)
    if (searchLowerCase === '') {
      // If search is empty, show all projects
      setProjectsCopy(projects);
    } else {
      // Otherwise, filter projects based on the search keyword
      setProjectsCopy(projects.filter((project) => project.projectname.toLowerCase().includes(searchLowerCase)));
    }
  }, [search]);

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/projects/${params.row.id}`}
             style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              // onClick={() => handleDelete(params.row.id)}
              onClick={() => {

                deleteProject(auth.currentUser.email, params.row)
              }}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <div className="datatable">
      <div className="datatableTitle">
        View Projects
        <Link to="/users/new" className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={projectsCopy}
        columns={userColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        // checkboxSelection
      />
    </div>
  );
};

export default Datatable;
