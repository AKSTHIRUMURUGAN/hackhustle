"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Image,
  Button,
  Skeleton
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useUser } from "../app/context/userContext";

export default function Header() {
    const { userProfile, loading } = useUser();
    console.log(userProfile)
//   const [userProfile, setUserProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
  const router=useRouter()
  const Logout=async()=>{
    try {
      await axios.post("/api/user/logout")
      window.location.reload()
    } catch (error) {
      console.log("error")
    }
  }

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const response = await fetch("/api/user/profile");
//         if (response.ok) {
//           const data = await response.json();
//           setUserProfile(data.profile);
//         }
//       } catch (error) {
//         console.error("Failed to fetch user profile:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserProfile();
//   }, []);

  return (
    <Navbar >
      <NavbarBrand>
        <Image
          alt="nextui logo"
          height={40}
          radius="sm"
          src="https://utfs.io/f/a9b8f892-fc28-48d6-be0a-3a22f2dc0d06-d48s3m.png"
          width={40}
          
        />
        <Link color="primary" onClick={()=>{router.push("/")}}><p className="font-bold text-inherit">PARKWIZ</p></Link>
      </NavbarBrand>

      
      <NavbarContent as="div" justify="end">
        {loading ? (
           <Skeleton className="flex rounded-full w-12 h-12"/>
        ) : userProfile ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name={userProfile.name}
                size="sm"
                src={userProfile.avatar}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{userProfile.email}</p>
              </DropdownItem>
              {userProfile.role=="admin"&&<DropdownItem key="dashboard" href="/admin/dashboard">Dashboard</DropdownItem>}
              <DropdownItem key="Homw" href="/">Home</DropdownItem>
              <DropdownItem key="Profile" href="/profile">Profile</DropdownItem>
              <DropdownItem key="live_status" href="/pslive">Live Status</DropdownItem>
              <DropdownItem key="location" href="/location">Location</DropdownItem>
              <DropdownItem key="direction" href="/direction">Direction</DropdownItem>
              <DropdownItem key="navigation" href="/parking_navigation">Navigation</DropdownItem>
              <DropdownItem key="station" href="/station">Station</DropdownItem>
              <DropdownItem key="booking" href="/bookslot">Booking Slot</DropdownItem>
              <DropdownItem key="bookedslot" href="/myorders">BookedSlot</DropdownItem>
              <DropdownItem key="help_and_feedback" href="/contact_us">
                Contact Us
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onClick={Logout}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <Button color="primary" onClick={() => router.push("/user/login")}>
            Sign In
          </Button>
        )}
      </NavbarContent>
    </Navbar>
  );
}
