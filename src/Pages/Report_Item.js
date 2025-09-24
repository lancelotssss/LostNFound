import React, { useState } from "react";

const LostNFoundForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    keyItem: "",
    itemBrand: "",
    description: "",
    status: "",
    reportType: "",
    location: "",
    dateReported: "",
    dateLostOrFound: "",
    photoUrl: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Lost and Found Report</h1>


      <div>
        <p>Title <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange}/></p>
      </div>

      <div>
        <p>Category <select name="category" value={formData.category} onChange={handleChange}> 
          <option>Gadgets</option>
          <option>Personal Belongings</option>
          <option>School Supplies</option>
          <option>Wearables</option>
          <option>Student ID</option>
          <option>Others</option>
        </select></p>
      </div>

      <div>
        <p>Item <input type="text" name="keyItem" placeholder="Item" value={formData.keyItem} onChange={handleChange}/></p>
      </div>

      <div>
        <p>Item Brand <input type="text" name="itemBrand" placeholder="Brand (optional)" value={formData.itemBrand} onChange={handleChange}/></p>
      </div>

      <div>
        <p>Description <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange}/></p>
      </div>

      <div>
        <p>Type of Report <select name="reportType" value={formData.reportType} onChange={handleChange}>
          <option>lost</option>
          <option>found</option>
        </select></p>
      </div>

      <div>
        <p>Location <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange}/></p>
      </div>

      <div>
        <p>Date of Lost/Found <input type="date" name="dateLostOrFound" value={formData.dateLostOrFound} onChange={handleChange}/></p>
      </div>

      <div>
        <p>Photo URL <input type="text" name="photoUrl" placeholder="Photo URL" value={formData.photoUrl} onChange={handleChange}/></p>
      </div>

      <div>
        <button type="submit"> SUBMIT REPORT </button>
      </div>
    </form>
  );
};

export default LostNFoundForm;
