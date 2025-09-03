"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut, User, Settings, Heart, Receipt, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function UserButton() {
  const user = useQuery(api.users.getCurrentUser);
  const { signOut } = useClerk();

  if (!user) return null;

  const initials =
    user.name && user.name
      ? `${user.name[0]}${user.name[0]}`
      : user.email[0].toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.profileImage || ""}
              alt={user.name || "User"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/profile" className="cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </a>
        </DropdownMenuItem>
       
        <DropdownMenuItem asChild>
          <a href="/donation-history" className="cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300">
            <Heart className="mr-2 h-4 w-4" />
            <span>Donation History</span>
          </a>
        </DropdownMenuItem>
         <DropdownMenuItem asChild className={`${user.role === 'admin' ? '' : 'hidden'}`}>
          <a href="/admin" className="cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300">
            <Cog className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
