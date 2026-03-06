import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../../user/components/Navbar";
import { Footer } from "../../user/components/footer";

export default function UserLayout() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-16">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}