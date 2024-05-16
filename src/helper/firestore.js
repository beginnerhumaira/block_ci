import {
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  getDocs,
} from "firebase/firestore"
import { db } from "../firebase"
import {
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"

// create organization

const createOrganization = async (email) => {
  // starting email only
  try {
    // const organizationRef = collection(db, "organization_data")
    // Use the provided email as the document ID
    await setDoc(doc(db, "organization_data", email), {
      org_email: email,
      org_name: "",
      org_phone_number: "",
      org_verified: false,
      org_logo: "",
      projects: [],
    })
  } catch (error) {
    console.error("Error adding document: ", error)
  }
}

// Organization details
const updateOrganization = async (email, formData) => {
  // starting email only
  try {
    // const organizationRef = collection(db, "organization_data")
    // Use the provided email as the document ID
    await setDoc(doc(db, "organization_data", email), formData, { merge: true })
  } catch (error) {
    console.error("Error adding document: ", error)
  }
}

const checkOrganizationExists = async (email) => {
  try {
    const organizationRef = doc(db, "organization_data", email)
    const docSnapshot = await getDoc(organizationRef)

    return docSnapshot.exists()
  } catch (error) {
    console.error("Error checking document existence: ", error)
    return false // Return false in case of an error
  }
}

const appendProject = async (email, formData) => {
  try {
    // Check if the organization exists
    const organizationRef = doc(db, "organization_data", email)
    const organizationSnapshot = await getDoc(organizationRef)

    if (organizationSnapshot.exists()) {
      // Organization exists, append the project to the existing organization
      await updateDoc(organizationRef, {
        projects: arrayUnion(formData),
      })
    } else {
      // Organization doesn't exist, create a new organization and append the project
      await createOrganization(email)
      await updateDoc(organizationRef, {
        projects: arrayUnion(formData),
      })
    }

    console.log("Project appended successfully")
  } catch (error) {
    console.error("Error appending project: ", error)
  }
}

const getProjectsStream = async (email, setProjects) => {
  const docRef = doc(db, "organization_data", email)

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data())
      const updatedProjects = docSnap.data().projects.map((project, index) => {
        return { ...project, id: index }
      })
      setProjects(updatedProjects)
    } else {
      console.log("No such document!")
      setProjects([])
    }
  })

  return unsubscribe
}

const getProjects = async (email) => {
  const docRef = doc(db, "organization_data", email)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data())
    return docSnap.data()
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!")
  }
}

const deleteProject = async (email, project) => {
  delete project.id

  console.log(email, project)
  try {
    const organizationRef = doc(db, "organization_data", email)
    const organizationSnapshot = await getDoc(organizationRef)

    if (organizationSnapshot.exists()) {
      // Organization exists, remove the project from the existing organization
      await updateDoc(organizationRef, {
        projects: arrayRemove(project),
      })
    } else {
      console.error("Organization doesn't exist")
    }
  } catch (error) {
    console.error("Error deleting project: ", error)
  }
}

const updateMilestones = async (email, project, milestones) => {
  console.log(email, project, milestones)
  console.log(typeof(milestones[0].image))
  try {
    const organizationRef = doc(db, "organization_data", email)
    const organizationSnapshot = await getDoc(organizationRef)

    if (organizationSnapshot.exists()) {
      // Organization exists, update the project milestones
      const updatedProjects = organizationSnapshot.data().projects.map((p) => {
        if (p.projectname === project.projectname) {
          p.milestones = milestones
        }
        return p
      })
      console.log(updatedProjects)
      await updateDoc(organizationRef, {
        projects: updatedProjects,
      })
    } else {
      console.error("Organization doesn't exist")
    }
  } catch (error) {
    console.error("Error updating milestones: ", error)
  }
}

export {
  createOrganization,
  updateOrganization,
  checkOrganizationExists,
  appendProject,
  getProjectsStream,
  getProjects,
  deleteProject,
  updateMilestones
}
