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
  
    return response.data;
  } catch (err) {
    console.error("Error in createReport:", err);
    return { success: false, error: err.message }; 
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


export async function editClient(data, token) {
  try {
    const response = await axios.put(`${URL}/cli/settings/edit`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    console.log("Axios response: ", response)
    return response.data;
  } catch (err){
    console.error("Error fetching reports:", err);
    return { results: [] };
  }
}

export async function editPasswordClient(data, token) {
  try {
    const response = await axios.put(`${URL}/cli/settings/pass`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    console.log("Axios response: ", response)
    return response.data;
  } catch (err){
    console.error("Error fetching reports:", err);
    return { results: [] };
  }
}

export async function logOutUser(token){
  const response = await axios.post(`${URL}/users/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    return response.data;
  
}

export async function getSearchReport(report, token) {
  try {
    const response = await axios.post(`${URL}/cli/search/item`, report, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      
    });
    return response.data;
  } catch (err) {
    console.error("Error fetching search: ", err.response?.data || err.message);
    return { success: false, results: [] };
  }
}
  

export async function createClaim(formData, token) {
  try {
    const response = await axios.post(`${URL}/cli/claim`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (err) {
    console.error("Error in createClaim:", err);
    return { success: false, error: err.message };
  }
}



/*export async function getClaimReport() {
  const response = await axios.get(`${URL}/cli/claim-items`);
  return response.data;
}*/

//ADMIN

export async function getFoundReport() {
  try {
      const response = await axios.get(`${URL}/main/found-items`);
      return response.data; // expects { success: true, results: [...] }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return { success: false, results: [] }; // safe fallback
    }
}

export async function getLostReport() {
  try {
      const response = await axios.get(`${URL}/main/lost-items`);
      return response.data; // expects { success: true, results: [...] }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return { success: false, results: [] }; // safe fallback
    }
}

export async function getClaimReport() {
  try {
      const response = await axios.get(`${URL}/main/claim-items`);
      return response.data; // expects { success: true, results: [...] }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return { success: false, results: [] }; // safe fallback
    }
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





