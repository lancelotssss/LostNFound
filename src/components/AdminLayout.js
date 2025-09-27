import { NavBarAdmin } from "./NavBarAdmin"
import { Outlet } from "react-router-dom"

export function AdminLayout() {
    return (
        <>
            <NavBarAdmin/>
            <Outlet/>
        </>
    )
} 