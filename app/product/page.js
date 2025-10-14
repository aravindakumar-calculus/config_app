"use client";

import MainLayout from "../main_layout";
import { Button } from "@/app/components/ui/button";

export default function Page() {
  return (
    <div>
      <MainLayout />
      <p className="p-2">Welcome to Product Page.</p>
      <Button className="p-2 mx-2" variant="default">
        Create Account
      </Button>
    </div>
  );
}
