import { Menu, School } from "lucide-react";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "../DarkMode";

import {
  useLogoutUserMutation
} from "../features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess, isLoading, error }] = useLogoutUserMutation();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    if (isLoading) return;
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "User logged out successfully.");
      navigate("/login");
    }
  
    if (error) {
      let errorMessage = "Logout failed.";
  
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (typeof error?.error === "string") {
        errorMessage = error.error;
      }
  
      toast.error(errorMessage);
    }
  }, [isSuccess, data, navigate, error]);
  
  return (
    <div className="h-16 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10">
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full px-4">
        <div className="flex items-center gap-2">
          <School size={"30"} className="text-blue-500" />
          <Link to="/">
            <h1 className="font-extrabold text-2xl">
              Skill-Matrix
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-8">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={user?.photoUrl || ""}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback>{user?.name?.charAt(0) || "CN"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="my-learning">My learning</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="profile">Edit Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logoutHandler} disabled={isLoading}>
                    {isLoading ? "Logging out..." : "Log out"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {user?.role === "instructor" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/login")}>Signup</Button>
            </div>
          )}
          <DarkMode />
        </div>
      </div>
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <Link to="/">
          <h1 className="font-extrabold text-2xl">Skill-Matrix</h1>
        </Link>
        <MobileNavbar user={user} logoutHandler={logoutHandler} isLoadingLogout={isLoading} />
      </div>
    </div>
  );
};

export default Navbar;

const MobileNavbar = ({ user, logoutHandler, isLoadingLogout }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="rounded-full hover:bg-gray-200"
          variant="outline"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between mt-2">
          <SheetClose asChild>
            <Link to="/">
              <SheetTitle>Skill-Matrix</SheetTitle>
            </Link>
          </SheetClose>
          <DarkMode />
        </SheetHeader>
        <Separator className="my-4" />
        <nav className="flex flex-col space-y-4 flex-grow">
          {user ? (
            <>
              <SheetClose asChild>
                <Link to="/my-learning" className="text-base font-medium">
                  My Learning
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/profile" className="text-base font-medium">
                  Edit Profile
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={logoutHandler}
                  disabled={isLoadingLogout}
                >
                  {isLoadingLogout ? "Logging out..." : "Log out"}
                </Button>
              </SheetClose>
            </>
          ) : (
            <>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleNavigation("/login")}
                >
                  Login
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  className="w-full"
                  onClick={() => handleNavigation("/login")}
                >
                  Signup
                </Button>
              </SheetClose>
            </>
          )}
        </nav>
        {user?.role === "instructor" && (
          <>
            <Separator className="my-4" />
            <SheetClose asChild>
              <Button
                className="w-full"
                onClick={() => handleNavigation("/admin/dashboard")}
              >
                Dashboard
              </Button>
            </SheetClose>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

