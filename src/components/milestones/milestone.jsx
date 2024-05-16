import React, { useState } from "react"
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage"
import { storage, auth } from "../../firebase"
import { updateMilestones } from "../../helper/firestore"
import { useNavigate } from "react-router-dom"
import "./milestone.scss"
const Milestones = ({ project }) => {
    console.log(project)

    const navigate = useNavigate()
  let milestones = project.milestones ?? []
    console.log(milestones)
  const handleNameChange = (e, index) => {
    const updatedMilestones = [...milestones]
    updatedMilestones[index].name = e.target.value
    milestones = updatedMilestones
    // setMilestones(updatedMilestones)
  }

  const handleImageChange = (e, index) => {
    const file = e.target.files[0]
    const updatedMilestones = [...milestones]
    updatedMilestones[index].image = file
    milestones = updatedMilestones

    // setMilestones(updatedMilestones)
  }

  const handleSave = async () => {
    try {
      const storageRef = ref(storage, auth.currentUser.email);
      const updatedMilestones = [...milestones]; // Clone the original milestones array
      const imageUrls = [];
  
      for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];
        if (milestone.image && typeof milestone.image !== 'string') {
          const milestoneRef = ref(storageRef, `milestone_${i + 1}`);
          const uploadTask = uploadBytesResumable(milestoneRef, milestone.image);
          const snapshot = await uploadTask;
  
          // Get download URL of the uploaded image
          const downloadURL = await getDownloadURL(snapshot.ref);
          imageUrls.push(downloadURL);
          updatedMilestones[i] = { ...milestone, image: downloadURL }; // Update the milestone in the array
        } else {
          imageUrls.push(milestone.image || null); // If no image or image already exists, push existing URL or null
        }
      }
  
      while (updatedMilestones.length < milestones.length) {
        updatedMilestones.push({ name: "", image: null });
      }
  
      // Update the milestones state with the updated array
      milestones = updatedMilestones
  
      // Update milestones in the database
      await updateMilestones(auth.currentUser.email, project, updatedMilestones);
      
      console.log("Milestones updated successfully!");
      navigate(0); // Navigate to desired location after successful update
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };
  

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Milestone</th>
            <th>Upload Image</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {milestones?.map((milestone, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={milestone?.name ?? ""}
                  onChange={(e) => handleNameChange(e, index)}
                />
              </td>
              <td>
                <input
                  type="file"
                  onChange={(e) => handleImageChange(e, index)}
                  accept="image/*"
                />
              </td>
              <td>
                <img className="milestone-img" src={milestone?.image ?? ""} alt={milestone.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSave}>Save</button>
    </div>
  )
}

export default Milestones
