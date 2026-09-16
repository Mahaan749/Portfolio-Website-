"use client";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./style.module.scss";
import Nav from "./nav";
import { cn } from "@/lib/utils";
import FunnyThemeToggle from "../theme/funny-theme-toggle";
import { Button } from "../ui/button";
import { config } from "@/data/config";
import OnlineUsers from "../realtime/online-users";
import { GitHubStarsButton } from "../ui/shadcn-io/github-stars-button";

interface HeaderProps {
  loader?: boolean;
}

const Header = ({ loader }: HeaderProps) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const isHome = usePathname() === "/";
  return (
    <header
      className={cn(
        styles.header,
        "transition-colors delay-100 duration-500 ease-in z-[1000]"
      )}
      style={{
        background: isActive ? "hsl(var(--background) / .8)" : "transparent",
        // backgroundImage:
        //   "linear-gradient(0deg, rgba(0, 0, 0, 0), rgb(0, 0, 0))",
      }}
    >
      {/* <div
        className="absolute inset-0 "
        style={{
          mask: "linear-gradient(rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 12.5%)",
        }}
      >
      </div> */}
      <div className={cn(styles.bar, "flex items-center justify-between")}>
        <Link href="/" className="flex items-center justify-center">
          <Button variant={"link"} className="text-md">
            {config.author}
          </Button>
        </Link>

        <FunnyThemeToggle className="w-6 h-6 mr-4 hidden md:flex" />
        {isHome && process.env.NEXT_PUBLIC_WS_URL && <OnlineUsers />}
        {config.githubUsername && config.githubRepo && (
          <GitHubStarsButton
            username={config.githubUsername}
            repo={config.githubRepo}
            className="mr-4"
          />
        )}
        <Button
          variant={"ghost"}
          onClick={() => setIsActive(!isActive)}
          aria-label={isActive ? "Close menu" : "Open menu"}
          aria-expanded={isActive}
          className={cn(
            styles.el,
            "m-0 p-0 h-6 bg-transparent flex items-center justify-center"
          )}
        >
          <div className="relative hidden md:flex items-center">
            <p>{isActive ? "Close" : "Menu"}</p>
          </div>
          <div
            className={`${styles.burger} ${isActive ? styles.burgerActive : ""
              }`}
          ></div>
        </Button>
      </div>
      <div
        onClick={() => setIsActive(false)}
        className={styles.background}
        style={{ height: isActive ? "100vh" : 0 }}
      ></div>
      <AnimatePresence mode="wait">
        {isActive && <Nav setIsActive={setIsActive} />}
      </AnimatePresence>
    </header>
  );
};

export default Header;
