"use client";
import { useEffect } from "react";
import OtpLogin from "../components/OtpLogin";
import { useUser } from "./context/userContext";
import HomeComponent from "../components/home";

import AOS from "aos";
import "aos/dist/aos.css";

export default function Home() {
  const { userProfile, loading } = useUser();

  useEffect(() => {
    AOS.init({
      duration: 1200, // Animation duration in ms
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") { // Ensure code runs on client side
      if (!userProfile && !loading) {
        window.location.reload();
      }
    }
  }, [userProfile, loading]); // Add dependencies to ensure the effect runs correctly

  return (
    <>
      <HomeComponent />
    </>
  );
}
