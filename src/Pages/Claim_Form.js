import React, { useState } from "react";

const ClaimForm = () => {
  const [claimData, setClaimData] = useState({
    reason:"",
    photoUrl:""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClaimData({ ...claimData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Claim Form submitted:", claimData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Claim Report</h1>

      <div>
        <p>Reason: <textarea name="reason" placeholder="Reason" value={claimData.reason} onChange={handleChange}/></p>
      </div>
      
      <div>
        <p>Photo URL <input type="text" name="photoUrl" placeholder="Photo URL" value={claimData.photoUrl} onChange={handleChange}/></p>
      </div>

      <div>
        <button type="submit"> Submit Report </button>
      </div>
    </form>
  );
};

export default ClaimForm;
