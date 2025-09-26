import axios from 'axios'

export async function getPosts(){
    //"http//localhost:3000/posts"
    const response = await axios.get('${URL}/posts')

    if (response.status === 200){
        return response.data
    }
    else {
        return
    }
}

export async function getPost(id){
    //"http//localhost:3000/posts/12345"
    const response = await axios.get('${URL}/posts/${id}')

    if (response.status === 200){
        return response.data
    }
    else {
        return
    }
}

export async function createPost(post){
    //"http//localhost:3000/posts/12345"
    const response = await axios.get('${URL}/posts', post)
    return response
}

export async function updatePost(id, post){
    //"http://localhost:3000/posts/12345"
    const response = await axios.put('${URL}/posts/${id}', post)
    return response
}

export async function deletePost(id){
    //"http://localhost:3000/posts/12345"
    const response = await axios.delete('${URL}/posts/${id}')
    return response
}


// USERS

export async function getUsers(){
    //"http//localhost:3000/users"
    const response = await axios.get('${URL}/users')

    if (response.status === 200){
        return response.data
    }
    else {
        return
    }
}

export async function getUser(id){
    //"http//localhost:3000/users/12345"
    const response = await axios.get('${URL}/users/${id}')

    if (response.status === 200){
        return response.data
    }
    else {
        return
    }
}

export async function createUser(user){
    //"http//localhost:3000/users/12345"
    const response = await axios.get('${URL}/users', user)
    return response
}

export async function updateUser(id, user){
    //"http://localhost:3000/users/12345"
    const response = await axios.put('${URL}/users/${id}', user)
    return response
}

export async function verifyUser(user){
    const response = axios.post('${URL}/users/login')
    if (response.success) {
        return response.data
    }
    else
    {
        throw new Error(response.statusText)
    }
}
