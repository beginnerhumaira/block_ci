import "./new.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined"
import React, { useState, useMemo, useEffect } from "react"
import { appendProject, dummytest } from "../../helper/firestore"
import { auth } from "../../firebase"
import { useNavigate } from "react-router-dom"
import Web3 from "web3";


import BlockCi from "../../build/BlockCi.json";

const New = ({ inputs, title }) => {
  const navigate = useNavigate()
  const [file, setFile] = useState("")
  // const MemoizedMilestoneForm = React.memo(MilestoneForm);
  const [main, setMain] = useState("")
  const [description, setDescription] = useState("")
  const [completed, setCompleted] = useState(false)
  const [milestones, setMilestones] = useState([
    { main: main, description: description, completed: completed },
  ])

  const [formData, setFormData] = useState({
    projectname: "",
    projectdesc: "",
    targetamount: "",
    startdate: "",
    enddate: "",
    milestone1: "",
    milestone2: "",
    milestone3: "",
    otherdetails: "",
  })

  // Add web3 state and contract instance
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [donationContract, setDonationContract] = useState(null);
  const campaignIdToRetrieve = 0; // Change this to the campaign ID you want to retrieve donations for

  // Initialize web3 and contract instance
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        // Request accounts from MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(accounts);

        // Create a new web3 instance
        const newWeb3 = new Web3(window.ethereum);
        setWeb3(newWeb3);

        // Get the network ID
        const networkId = await newWeb3.eth.net.getId();

        // Get the contract ABI and address
        const networkData = BlockCi.networks[networkId]
        if (networkData) {
          const contract = new newWeb3.eth.Contract(BlockCi.abi, networkData.address)
          setDonationContract(contract)
        } else {
          console.error("Contract not deployed on this network");
        }
      } catch (error) {
        console.error("Error initializing web3 or contract:", error);
      }
    };

    initWeb3();
  }, []);

  const getDonationsForCampaign = async (campaignId) => {
    try {
      // Call the smart contract method to get the campaign details
      const campaign = await donationContract.methods.campaigns(campaignId).call();

      // Access the totalDonations property from the campaign object
      const totalDonations = campaign.totalDonations;
    
      console.log("Total Donations for Campaign", campaignId, ":", totalDonations);
      return totalDonations;
    } catch (error) {
      console.error("Error retrieving total donations:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    getDonationsForCampaign()

    try {
      // Check if any field is empty
      for (const key in formData) {
        if (formData.hasOwnProperty(key) && !formData[key]) {
          alert(`${key} is required`);
          return; // Prevent form submission if any field is empty
        }
      }
    
      // Convert endDate to uint256
      const endDate = Date.parse(formData.enddate) / 1000; // Convert date to Unix timestamp
      console.log("endDate:", endDate);
    
      const formattedMilestones = [
        { name: formData.milestone1, image: null },
        { name: formData.milestone2, image: null },
        { name: formData.milestone3, image: null },
      ];
    
      // Map milestones to their names as uint256
      const milestonesAsUint256 = formattedMilestones.map(milestone => {
        // Convert milestone names to their hash values
        const hash = web3.utils.sha3(milestone.name, { encoding: 'hex' });
        // Return the hash as string
        return hash;
      });
      console.log("milestonesAsUint256:", milestonesAsUint256);
    
      console.log("Creating campaign with data:", {
        projectname: formData.projectname,
        targetamount: formData.targetamount,
        endDate: endDate,
        milestones: milestonesAsUint256,
      });
    
      // Call the smart contract method to create a new campaign
      const result = await donationContract.methods.createCampaign(
        formData.projectname,
        formData.targetamount,
        endDate,
        milestonesAsUint256
      ).send({ from: accounts[0] });
    
      console.log("Transaction result:", result);
    
      // Now that the Ganache operation is complete, proceed with Firebase update
      const nonFormattedFormData = { ...formData }; // Create a copy of the original form data
      delete nonFormattedFormData.milestone1;
      delete nonFormattedFormData.milestone2;
      delete nonFormattedFormData.milestone3;
      // Remove the milestones from the non-formatted data
    
      // Pass form data and email of logged-in user to appendProject function
      appendProject(auth.currentUser.email, nonFormattedFormData);
    
      // Reset form data after successful submission
      setFormData({
        projectname: "",
        projectdesc: "",
        targetamount: "",
        startdate: "",
        enddate: "",
        otherdetails: "",
      });
      navigate("/projects");
    } catch (error) {
      console.error(error);
    }
  };

    
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
  // Define a function to handle the CampaignCreated event
  const handleCampaignCreated = (campaignId, organizer, title, goalAmount) => {
      console.log(`Campaign Created(listened to event campaign created):
      Campaign ID: ${campaignId}
      Organizer: ${organizer}
      Title: ${title}
      Goal Amount: ${goalAmount}`)
  }

  // Listen for the CampaignCreated event
  useEffect(() => {
    // getDonationsForCampaign(campaignIdToRetrieve);
    const listenToCampaignCreated = async () => {
      try {
        if (!donationContract) {
          console.log("Donation contract is not initialized yet")
          return
        }

        donationContract.events
          .CampaignCreated()
          .on("data", (event) => {
            console.log(event)
            const { campaignId, organizer, title, goalAmount } = event.returnValues
            handleCampaignCreated(campaignId, organizer, title, goalAmount)
          })
          .on("error", (error) => {
            console.error("Error listening for CampaignCreated event:", error)
          })
      } catch (error) {
        console.error("Error setting up CampaignCreated listener:", error)
      }
    }

    listenToCampaignCreated()
  }, [donationContract])



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  const handleInputChange = (e) => {
    // console.log(e.target)
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={handleSubmit}>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>
              <div>
                {/* <h2>Project Milestones</h2>
                <MilestoneForm /> */}
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.key}>
                  <label>{input.label}</label>
                  <input
                    type={input.type}
                    name={input.key} // Use input.key instead of input.label
                    value={formData[input.key] || ""} // Use input.key instead of input.label
                    onChange={handleInputChange}
                    placeholder={input.placeholder}
                  />
                </div>
              ))}
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default New
