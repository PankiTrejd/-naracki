import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { PlusCircle, LayoutDashboard, CheckCircle, List, Menu } from "lucide-react";
import { Badge } from "./ui/badge";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from "./ui/drawer";

interface NavigationProps {
  newOrderCount?: number;
}

const Navigation = ({ newOrderCount = 0 }: NavigationProps) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Navigation links as a component for reuse
  const NavLinks = (
    <>
      <Button
        variant={location.pathname === "/dashboard" ? "default" : "outline"}
        size="sm"
        asChild
        className="w-full justify-start"
        onClick={() => setDrawerOpen(false)}
      >
        <Link to="/dashboard" className="flex items-center gap-1 w-full">
          <LayoutDashboard className="h-4 w-4" />
          Контролен
        </Link>
      </Button>
      <Button
        variant={location.pathname === "/orders" ? "default" : "outline"}
        size="sm"
        asChild
        className="w-full justify-start relative"
        onClick={() => setDrawerOpen(false)}
      >
        <Link to="/orders" className="flex items-center gap-1 w-full">
          <List className="h-4 w-4" />
          Нарачки
          {newOrderCount > 0 && (
            <Badge className="ml-1 h-5 w-5 flex items-center justify-center p-0">
              {newOrderCount}
            </Badge>
          )}
        </Link>
      </Button>
      <Button
        variant={location.pathname === "/new-order" ? "default" : "outline"}
        size="sm"
        asChild
        className="w-full justify-start"
        onClick={() => setDrawerOpen(false)}
      >
        <Link to="/new-order" className="flex items-center gap-1 w-full">
          <PlusCircle className="h-4 w-4" />
          Нова Нарачка
        </Link>
      </Button>
      <Button
        variant={location.pathname === "/completed" ? "default" : "outline"}
        size="sm"
        asChild
        className="w-full justify-start"
        onClick={() => setDrawerOpen(false)}
      >
        <Link to="/completed" className="flex items-center gap-1 w-full">
          <CheckCircle className="h-4 w-4" />
          Готови
        </Link>
      </Button>
    </>
  );

  return (
    <nav className="border-b sticky top-0 z-10 bg-background w-full">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Hamburger menu for mobile */}
        <div className="flex items-center gap-2">
          <div className="block md:hidden">
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button size="icon" variant="outline" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="flex flex-col gap-2 p-4">
                  <img src="/logo.png" alt="Company Logo" className="h-12 w-12 object-contain mx-auto mb-4" />
                  {NavLinks}
                  <DrawerClose asChild>
                    <Button variant="outline" className="mt-4 w-full">Затвори</Button>
                  </DrawerClose>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          <img src="/logo.png" alt="Company Logo" className="h-12 w-12 object-contain hidden md:block" />
        </div>
        {/* Desktop nav */}
        <div className="gap-2 hidden md:flex">
          {NavLinks}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
