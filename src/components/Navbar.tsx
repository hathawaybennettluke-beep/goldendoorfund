"use client";
import { Menu, ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AuthButtons } from "@/components/ui/auth-buttons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface NavbarProps {
  logo: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu: MenuItem[];
  auth?: {
    login: {
      title: string;
      url: string;
    };
    signup: {
      title: string;
      url: string;
    };
  };
}

const Navbar = ({
  logo,
  menu,
  auth = {
    login: { title: "Login", url: "#" },
    signup: { title: "Sign up", url: "#" },
  },
}: NavbarProps) => {
  const isAdminRoute = usePathname().includes("/admin");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  if (isAdminRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex py-3">
          <div className="flex items-center gap-10">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-5 group ml-8">
              <Image
                src={logo.src}
                className="h-24 w-auto transition-transform duration-300 group-hover:scale-105"
                alt={logo.alt}
                width={192}
                height={120}
              />
              <span className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {logo.title}
              </span>
            </a>
            
            {/* Navigation Menu */}
            <div className="flex items-center gap-4">
              {menu.map((item) => (
                <div key={item.title} className="relative">
                  {item.items ? (
                    <div>
                      <button
                        className="group px-4 py-2 text-xl font-medium text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300 flex items-center gap-2"
                        onClick={() => setOpenDropdown(openDropdown === item.title ? null : item.title)}
                        onMouseEnter={() => setOpenDropdown(item.title)}
                      >
                        {item.title}
                        <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${openDropdown === item.title ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openDropdown === item.title && (
                        <div 
                          className="absolute top-full left-0 mt-2 w-[500px] bg-background/95 backdrop-blur border border-border/50 shadow-xl rounded-xl z-50"
                          onMouseEnter={() => setOpenDropdown(item.title)}
                          onMouseLeave={() => setOpenDropdown(null)}
                        >
                          <div className="grid grid-cols-1 gap-2 p-6">
                            {item.items.map((subItem) => (
                              <a
                                key={subItem.title}
                                href={subItem.url}
                                className="group flex select-none flex-row gap-4 rounded-lg p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <div className="text-foreground group-hover:text-primary transition-colors duration-300">
                                  {subItem.icon}
                                </div>
                                <div>
                                  <div className="text-base font-semibold group-hover:text-primary transition-colors duration-300">
                                    {subItem.title}
                                  </div>
                                  {subItem.description && (
                                    <p className="text-muted-foreground text-sm leading-snug group-hover:text-foreground transition-colors duration-300">
                                      {subItem.description}
                                    </p>
                                  )}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={item.url}
                      className="group inline-flex h-10 w-max items-center justify-center rounded-lg px-4 py-2 text-xl font-medium text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                    >
                      {item.title}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <AuthButtons
              loginUrl={auth.login.url}
              signupUrl={auth.signup.url}
              loginText={auth.login.title}
              signupText={auth.signup.title}
            />
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between py-3 px-4 sm:px-6">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-3 sm:gap-4 ml-2 sm:ml-6">
              <img
                src={logo.src}
                className="h-16 w-auto sm:h-20"
                alt={logo.alt}
              />
            </a>
            
            {/* Mobile Menu Button */}
            <div className="flex gap-2 sm:gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="border-border/50 h-10 w-10 sm:h-12 sm:w-12">
                    <Menu className="size-4 sm:size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto w-[300px] sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle>
                      <a href={logo.url} className="flex items-center gap-3">
                        <img
                          src={logo.src}
                          className="h-8 w-auto sm:h-10"
                          alt={logo.alt}
                        />
                      </a>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-3 sm:gap-4"
                    >
                      {menu.map((item) => renderMobileMenuItem(item))}
                    </Accordion>

                    <AuthButtons
                      loginUrl={auth.login.url}
                      signupUrl={auth.signup.url}
                      loginText={auth.login.title}
                      signupText={auth.signup.title}
                      isMobile={true}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b border-border/30">
        <AccordionTrigger className="text-base sm:text-lg py-3 sm:py-4 font-semibold hover:no-underline hover:text-primary transition-colors">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          <div className="space-y-2">
            {item.items.map((subItem) => (
              <SubMenuLink key={subItem.title} item={subItem} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a 
      key={item.title} 
      href={item.url} 
      className="block py-3 sm:py-4 text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors border-b border-border/30"
    >
      {item.title}
    </a>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="group flex select-none flex-row gap-3 sm:gap-4 rounded-lg p-3 sm:p-4 leading-none no-underline outline-none transition-all duration-300 hover:bg-primary/10 hover:text-primary"
      href={item.url}
    >
      <div className="text-foreground group-hover:text-primary transition-colors duration-300">
        {item.icon}
      </div>
      <div>
        <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">
          {item.title}
        </div>
        {item.description && (
          <p className="text-muted-foreground text-xs sm:text-sm leading-snug group-hover:text-foreground transition-colors duration-300">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { Navbar };
