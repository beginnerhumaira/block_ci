import "./new.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined"
import React, { useState, useEffect } from "react"
import { appendProject,  } from "../../helper/firestore"
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

  // web3 state and contract instance
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

        // new web3 instance
        const newWeb3 = new Web3(window.ethereum);
        setWeb3(newWeb3);

        // Get network ID
        const networkId = await newWeb3.eth.net.getId();

        // contract ABI and address
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
      const campaign = await donationContract.methods.campaigns(campaignId).call();
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

    getDonationsForCampaign(campaignIdToRetrieve)
    // Check if start date is after end date
    if (new Date(formData.startdate) > new Date(formData.enddate)) {
      alert("End date should be after start date");
      return;
  }

    try {
      // Check if any field is empty
      for (const key in formData) {
        if (formData.hasOwnProperty(key) && !formData[key]) {
          alert(`${key} is required`);
          return; 
        }
      }
    
      // endDate to uint256
      const endDate = Date.parse(formData.enddate) / 1000;
      console.log("endDate:", endDate);
    
      const formattedMilestones = [
        { name: formData.milestone1, image: null },
        { name: formData.milestone2, image: null },
        { name: formData.milestone3, image: null },
      ];
    
      // milestones as uint256
      const milestonesAsUint256 = formattedMilestones.map(milestone => {
        const hash = web3.utils.sha3(milestone.name, { encoding: 'hex' });
        return hash;
      });
      console.log("milestonesAsUint256:", milestonesAsUint256);
    
      console.log("Creating campaign with data:", {
        projectname: formData.projectname,
        targetamount: formData.targetamount,
        endDate: endDate,
        milestones: milestonesAsUint256,
      });
    
      // contract method to create a new campaign
      const result = await donationContract.methods.createCampaign(
        formData.projectname,
        formData.targetamount,
        endDate,
        milestonesAsUint256
      ).send({ from: accounts[0] });
    
      console.log("Transaction result:", result);
    
      // Firebase update
      const nonFormattedFormData = { ...formData, milestones: formattedMilestones }; 
      delete nonFormattedFormData.milestone1;
      delete nonFormattedFormData.milestone2;
      delete nonFormattedFormData.milestone3;
    
      // pass data
      appendProject(auth.currentUser.email, nonFormattedFormData);
    
      // Reset form data
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
    
  // function to handle CampaignCreated event
  const handleCampaignCreated = (campaignId, organizer, title, goalAmount) => {
      console.log(`Campaign Created(listened to event campaign created):
      Campaign ID: ${campaignId}
      Organizer: ${organizer}
      Title: ${title}
      Goal Amount: ${goalAmount}`)
  
  }

  // listen for CampaignCreated event
  useEffect(() => {
    const listenToCampaignCreated = async () => {
      try {
        if (!donationContract) {
          console.log("Donation contract is not initialized yet")
          return
        }

        donationContract.events
          .CampaignCreated()
          .on("data", (event) => {
            console.log("Campaign created event : ",event)
            const { campaignId, organizer, title, goalAmount } = event.returnValues
            handleCampaignCreated(campaignId, organizer, title, goalAmount)
          })
          .on("error", (error) => {
            console.error("Error listening for CampaignCreated event:", error)
            alert("Error listening for CampaignCreated event:", error)
          })
      } catch (error) {
        console.error("Error setting up CampaignCreated listener:", error)
        alert("Error setting up CampaignCreated listener:", error)
      }
    }

    listenToCampaignCreated()
  }, [donationContract])

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
                    name={input.key} 
                    value={formData[input.key] || ""} 
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
