import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export function UserSettings () {
    const [user, setUser] = useState({});
    const [formData, setFormData] = useState({
            studentId: "",
            email: "",
            name: "",
            status: "",
            createdAt: "",
    
            phone: "",
            password: ""
        })    


const [isEditing, setIsEditing] = useState(false);

function handleChange(e){
    
}

useEffect(() =>{
    async function loadUserData() {
        const token = sessionStorage.getItem("User")
        if (!token) return
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        const decodedUser = jwtDecode(token)
        setUser(decodedUser)

        console.log(user)
    }
    loadUserData()
}, [])

return (
    <>
        <form>


        </form>
    </>
)
}