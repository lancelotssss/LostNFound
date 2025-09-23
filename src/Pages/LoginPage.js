function LoginPage() {

    return(
        <>
        <form method="POST">

        
            <div>
                <label>Email: </label>
                <input type="email"  placeholder="Enter email here"></input>
            </div>
            
            <div>
                <label>Password: </label>
                <input type="password"  placeholder="Enter password here"></input>
            </div>

            <div>
                <button type="submit" >LOGIN</button>
            </div>
        </form>
    </>
    )
}

export default LoginPage