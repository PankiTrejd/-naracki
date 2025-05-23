import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { PlusCircle, LayoutDashboard, CheckCircle, List } from "lucide-react";
import { Badge } from "./ui/badge";

interface NavigationProps {
  newOrderCount?: number;
}

const Navigation = ({ newOrderCount = 0 }: NavigationProps) => {
  const location = useLocation();

  return (
    <nav className="border-b sticky top-0 z-10 bg-background">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Company Logo" className="h-12 w-12 object-contain" />
        </div>
        <div className="flex gap-2">
          <Button
            variant={location.pathname === "/dashboard" ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link to="/dashboard" className="flex items-center gap-1">
              <LayoutDashboard className="h-4 w-4" />
              Контролен
            </Link>
          </Button>
          <Button
            variant={location.pathname === "/orders" ? "default" : "outline"}
            size="sm"
            asChild
            className="relative"
          >
            <Link to="/orders" className="flex items-center gap-1">
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
          >
            <Link to="/new-order" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Нова Нарачка
            </Link>
          </Button>
          <Button
            variant={location.pathname === "/completed" ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link to="/completed" className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Готови
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
