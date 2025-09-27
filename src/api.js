import axios from "axios";

const URL = "http://localhost:3110"



export async function createUser(user){
    const response = await axios.post(`${URL}/register`, user)
    return response
}

export async function createReport(report){
    const response = await axios.post(`${URL}/cli/report`, report)
    return response
}

export async function getMissingReport(){
    const response = await axios.get(`${URL}/main/lost-items`)
    if (response.status === 200){
        return response.data
    }
    else {
        return
    }
}

export async function verifyUser(user) {
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

export async function verifyUser(user) {
  try {
    const response = await axios.post(`${URL}/users/login`, user);
    console.log("Raw response:", response);
    console.log("Response data:", response.data);

    if (response.data.success) {
      return response.data; 
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (err) {
    console.error("verifyUser error:", err);
    throw err;
  }
}


