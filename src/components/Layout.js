import { NavBar } from "./NavBar"
import { Outlet } from "react-router-dom"

export function Layout() {
    return (
        <>
            <NavBar/>
            <Outlet/>
        </>
    )
} 