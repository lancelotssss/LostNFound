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
export async function createReport(report) {
  const token = sessionStorage.getItem("token");
  const response = await axios.post(`${URL}/cli/report`, report, 
    { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function getLostReport() {
  const response = await axios.get(`${URL}/cli/main/lost-items`);
  return response.data;
}

export async function getFoundReport() {
  const response = await axios.get(`${URL}/cli/main/found-items`);
  return response.data;
}

export async function getClaimReport() {
  const response = await axios.get(`${URL}/cli/main/claim-items`);
  return response.data;
}

/*export async function verifyUser(user) {
  try {
    const response = await axios.post(`${URL}/users/login`, user);
    console.log("Raw response:", response);
    console.log("Response data:", response.data);

    // If your backend sends { success: true, data: {...} }
    if (response.data.success) {
      return response.data; // return full backend data
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (err) {
    console.error("verifyUser error:", err);
    throw err;
  }
}
  */






// USERS
/*
export async function getUsers(){
    //"http//localhost:3000/users"
    const response = await axios.get(`${URL}/users`)

    if (response.status === 200){
        return response.data
    }
    else {
        return
    }
}

export async function getUser(id){
    //"http//localhost:3000/users/12345"
    const response = await axios.get(`${URL}/users/${id}`)

    if (response.status === 200){
        return response.data
    }
    else {
        return
    }
}
export async function getPosts(){
    const response = await axios.get(`${URL}/posts`)

    if (response.status === 200){
        return response.data
    }
    else {
        return
    }
}

export async function getPost(id){
    const response = await axios.get(`${URL}/posts/${id}`)

    if (response.status === 200){
        return response.data
    }
    else {
        return
    }
}

export async function createPost(post){
    const response = await axios.post(`${URL}/posts`, post)
    return response
}

export async function updatePost(id, post){
    const response = await axios.put(`${URL}/posts/${id}`, post)
    return response
}

export async function deletePost(id){
    const response = await axios.delete(`${URL}/posts/${id}`)
    return response
}

export async function updateUser(id, user){
    //"http://localhost:3000/users/12345"
    const response = await axios.put(`${URL}/users/${id}`, user)
    return response
}

export async function verifyUser(user) {
  try {
    const response = await axios.post(`${URL}/users/login`, user);
    console.log("Raw response:", response);
    console.log("Response data:", response.data);
    
    if (response.data && response.data.success) {
      return response.data.token;
    } else {
      throw new Error(response.data?.message || "Login failed");

*/



