import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSearchReport } from "../api";

export function UserSearch() {
  const [registerData, setRegisterData] = useState({
    category: "",
    keyItem: "",
    itemBrand: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("User");
      if (!token) {
        alert("You must be logged in before searching.");
        return;
      }

      const response = await getSearchReport(registerData, token);

      if (!response.success || !response.results.length) {
        alert("No results found.");
      } else {
        navigate("/main/search/result", { state: { selectedItem: selectedLost } });
      }
    } catch (err) {
      console.error("Error submitting search:", err);
      alert("Error submitting search");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Search for your Item</h1>

      <div>
        <p>
          Category{" "}
          <select
            name="category"
            value={registerData.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option>Gadgets</option>
            <option>Personal Belongings</option>
            <option>School Supplies</option>
            <option>Wearables</option>
            <option>Student ID</option>
            <option>Others</option>
          </select>
        </p>
      </div>

      {registerData.category && (
        <>
          <div>
            <p>
              Item{" "}
              <input
                type="text"
                name="keyItem"
                placeholder="Item"
                value={registerData.keyItem}
                onChange={handleChange}
              />
            </p>
          </div>

          <div>
            <p>
              Item Brand{" "}
              <input
                type="text"
                name="itemBrand"
                placeholder="Brand (optional)"
                value={registerData.itemBrand}
                onChange={handleChange}
              />
            </p>
          </div>
        </>
      )}

      {registerData.keyItem && (
        <div>
          <p>
            Location{" "}
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={registerData.location}
              onChange={handleChange}
            />
          </p>
        </div>
      )}


      {registerData.location && (
        <div>
          <p>
            Start Date{" "}
            <input
              type="date"
              name="startDate"
              value={registerData.startDate}
              onChange={handleChange}
            />
          </p>
          <p>
            End Date{" "}
            <input
              type="date"
              name="endDate"
              value={registerData.endDate}
              onChange={handleChange}
            />
          </p>
        </div>
      )}

      {registerData.startDate && registerData.endDate && (
        <div>
          <button type="submit">SEARCH ITEM</button>
        </div>
      )}
    </form>
  );
}
