"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export default function Logo({
  size = "md",
  href = "/",
  className,
}: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-16",
  };

  const logoElement = (
    <img
      src="/logotransparent.png"
      alt="ExteriorAI Logo"
      className={cn(sizeClasses[size], "w-52 h-auto", className)}
    />
  );

  if (href) {
    return <Link href={href}>{logoElement}</Link>;
  }

  return logoElement;
}
