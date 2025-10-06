import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { editAdmin, editPasswordAdmin } from "../api";

export function AdminSettings() {
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    studentId: "",
    email: "",
    name: "",
    status: "",
    createdAt: "",
    phone: "",
    password: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handlePasswordChange(e) {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      if (!token) return;

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);

      
      setFormData({
        ...formData,
        studentId: decodedUser.studentId || "",
        email: decodedUser.email || "",
        name: decodedUser.name || "",
        status: decodedUser.status || "",
        createdAt: decodedUser.createdAt || "",
        phone: decodedUser.phone || "",
      });
    }
    loadUserData();
    
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (formData.phone === user.phone) {
        alert("No changes detected in phone number.");
        return;
      }

      const token = sessionStorage.getItem("User");
      if (!token) return;

      const response = await editAdmin({ phone: formData.phone }, token);

      if (!response.success) {
        alert("Phone number could not be updated.");
      } else {
        alert("Phone number updated successfully!");
        setUser({ ...user, phone: formData.phone });
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating phone:", err);
      alert("Error updating phone");
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      const token = sessionStorage.getItem("User");
      if (!token) return;

      const response = await editPasswordAdmin(passwordForm, token);

      if (!response.success) {
        alert("Password could not be updated.");
      } else {
        alert("Password updated successfully!");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setIsPasswordEditing(false);
      }
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Error updating password");
    }
  }

  return (
    <>
      <form onSubmit={handleSave}>
        <p>Student ID: </p>
        <p>{user.studentId}</p>

        <p>Email: </p>
        <p>{user.email}</p>

        <p>Name: </p>
        <p>{user.name}</p>

        <p>Status: </p>
        <p>{user.status}</p>

        <p>Joined: {new Date(user.createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Manila"
      }).replace(",", "")}</p>

        <p>Phone: </p>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          readOnly={!isEditing}
        />

        {isEditing ? (
          <>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, phone: user.phone });
                setIsEditing(false);
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Edit Phone
          </button>
        )}
      </form>

      <div className="mt-6">
        {isPasswordEditing ? (
          <form onSubmit={handlePasswordSave}>
            <p>Change Password:</p>
            <input
              type="password"
              name="oldPassword"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              placeholder="Old Password"
              className="border p-2 w-full"
            />
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="New Password"
              className="border p-2 w-full"
            />
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm New Password"
              className="border p-2 w-full"
            />

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Save Password
            </button>
            <button
              type="button"
              onClick={() => setIsPasswordEditing(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded mt-2"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsPasswordEditing(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Change Password
          </button>
        )}
      </div>
    </>
  );
}
