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


export async function deleteReport(id, token) {
  try {
    const response = await axios.delete(`${URL}/cli/home/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting report:", error);
    return { success: false };
  }
}

export async function getClaimDetailsClient(token, itemId) {
  const response = await axios.get(`${URL}/cli/claim-items/${itemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getAllClaim(token){
  try {
    const response = await axios.get(`${URL}/cli/claim`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Axios response:", response);
    return response.data;
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



//ADMIN

export async function getAdminDashboard(token) {
  try {
    const response = await axios.get(`${URL}/main/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; 
  } catch (err) {
    console.error("Error fetching admin dashboard:", err);
    return { statusCounts: null };
  }
}


export async function getFoundReport(token) {
  try {
    const response = await axios.get(`${URL}/main/found-items`, {
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

export async function approveFound(itemObjectId, status, approvedBy, token) {
  try {
    const response = await axios.put(`${URL}/main/found/approve`,
      { itemObjectId, status, approvedBy },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err) {
    console.error("Error updating found item:", err);
    throw err;
  }
}

export async function approveLost(itemObjectId, status, approvedBy, token) {
  try {
    const response = await axios.put(`${URL}/main/lost/approve`,
      { itemObjectId, status, approvedBy },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err) {
    console.error("Error updating lost item:", err);
    throw err;
  }
}


export async function getLostReport(token) {
  try {
    const response = await axios.get(`${URL}/main/lost-items`, {
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

export async function getStorage(token) {
  try {
    const response = await axios.get(`${URL}/main/storage`, {
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

export async function approveStorage(claimPayload, token) {
  try {
    const response = await axios.post(
      `${URL}/main/storage/approve`, // make sure this matches your backend mount
      claimPayload,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error creating claim report:", err.response?.data || err.message);
    throw err;
  }
}

export async function getHistory(token) {
  try {
    const response = await axios.get(`${URL}/main/history`, {
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

export async function editAdmin(data, token) {
  try {
    const response = await axios.put(`${URL}/main/settings/edit`, data, {
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

export async function editPasswordAdmin(data, token) {
  try {
    const response = await axios.put(`${URL}/main/settings/pass`, data, {
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



export async function getClaimReport(token) {
  try {
    const response = await axios.get(`${URL}/main/claim-items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    console.error("Error fetching claim report:", err);
    return { results: [] };
  }
}

export async function getClaimDetails(token, claimId) {
  try {
    const response = await axios.get(`${URL}/main/claim-items/${claimId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      claim: response.data.claim,
      foundItem: response.data.foundItem,
      lostItem: response.data.lostItem,
    };
  } catch (err) {
    console.error("Error fetching claim details:", err);
    return { claim: null, foundItem: null, lostItem: null };
  }
}

export async function approveClaim(token, claimId, status, approvedBy) {
  try {
    const response = await axios.put(
      `${URL}/main/claim-items/approve`,
      { claimId, status, approvedBy },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err) {
    console.error("Error approving claim:", err);
    return { success: false };
  }
}

export async function completeTransaction(token, claimId, status, approvedBy) {
  try {
    const response = await axios.put(
      `${URL}/main/claim-items/complete`,
      { claimId, status, approvedBy },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err) {
    console.error("Error approving claim:", err);
    return { success: false };
  }
}

export async function getAuditLogs(token) {
   try {
    const response = await axios.get(`${URL}/main/logs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // { count, results }
  } catch (err) {
    console.error("Error fetching reports:", err);
    return { results: [] };
  }
}



export async function getUsers(token){
  try {
    const response = await axios.get(`${URL}/main/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // { count, results }
  } catch (err) {
    console.error("Error fetching reports:", err);
    return { results: [] };
  }
}

export async function updateUser(itemObjectId, status, approvedBy, token) {
  try {
    const response = await axios.put(`${URL}/main/users/update`,
      { itemObjectId, status, approvedBy },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err) {
    console.error("Error updating found item:", err);
    throw err;
  }
}

