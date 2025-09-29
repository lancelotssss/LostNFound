import axios from "axios";

const URL = "http://localhost:3110"



export async function createUser(user) {
  const response = await axios.post(`${URL}/users/register`, user);
  return response.data;
}

export async function verifyUser(user) {
  try {
    const response = await axios.post(`${URL}/users/login`, user);
    console.log("Raw response:", response);
    console.log("Response data:", response.data);

    if (response.data.success) {
      return response.data; // token + success
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (err) {
    console.error("verifyUser error:", err);
    throw err;
  }
}

// --- REPORTS ---
export async function createReport(report, token) {
  try {
    const response = await axios.post(`${URL}/cli/report`, report, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
    return response.data; // ✅ return the actual data from backend
  } catch (err) {
    console.error("Error in createReport:", err);
    return { success: false, error: err.message }; // optional error handling
  }
}


export async function getAllReport(token) {
  try {
    const response = await axios.get(`${URL}/cli/home`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Axios response:", response);
    return response.data; // { count, results }
  } catch (err) {
    console.error("Error fetching reports:", err);
    return { results: [] };
  }
}


export async function getFoundReport() {
  const response = await axios.get(`${URL}/cli/found-items`);
  return response.data;
}

export async function getClaimReport() {
  const response = await axios.get(`${URL}/cli/claim-items`);
  return response.data;
}


export async function getLostReport() {
  const response = await axios.get(`${URL}/main/lost-items`);
  return response.data;
}

export async function getAuditLogs() {
   try {
    const response = await axios.get(`${URL}/main/logs`);
    return response.data; // expects { success: true, results: [...] }
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return { success: false, results: [] }; // safe fallback
  }
}





