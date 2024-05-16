import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./home.scss";
import Widget from "../../components/widget/Widget";
import Featured from "../../components/featured/Featured";
import Chart from "../../components/chart/Chart";
import Table from "../../components/table/Table";
import { useEffect } from "react";
import { auth } from "../../firebase"
const Home = () => {

    // Define a function to retrieve total donations for a specific campaign
  // const getDonationsForCampaign = async (campaignId) => {
  //   try {
  //     // Call the smart contract method to get total donations for the campaign
  //     const totalDonations = await donationContract.methods.campaigns(campaignId).totalDonations().call();
      
  //     console.log("Total Donations for Campaign", campaignId, ":", totalDonations);
  //     return totalDonations;
  //   } catch (error) {
  //     console.error("Error retrieving total donations:", error);
  //     return null;
  //   }
  // };

  // useEffect(() => {
  //   // Call the getDonationsForCampaign function with the campaign ID
  //   getDonationsForCampaign(1);
  // }, []);


 


  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar isShowSearch={false}/>
        <div className="widgets">
          <Widget type="user" />
          <Widget type="Project" />
          <Widget type="Donation" />
          <Widget type="balance" />
        </div>
        <div className="charts">
          <Featured />
          <Chart title="Last 7 Days (Donations)" aspect={2 / 1} />
        </div>
        {/* <div className="listContainer">
          <div className="listTitle">Latest Donations</div>
          <Table />
        </div> */}
      </div>
    </div>
  );
};

export default Home;
