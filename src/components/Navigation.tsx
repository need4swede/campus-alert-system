
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertCircle, BarChart, Home, LogOut, Settings } from 'lucide-react';
import { useAlert } from '@/context/AlertContext';

const Navigation = () => {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const { currentAlert } = useAlert();
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <AlertCircle className="h-8 w-8 text-primary mr-2" />
              <div>
                <h1 className="text-xl font-semibold">
                  <span className="acronym">R</span>apid{" "}
                  <span className="acronym">E</span>mergency{" "}
                  <span className="acronym">A</span>lert{" "}
                  <span className="acronym">C</span>ommunication{" "}
                  <span className="acronym">T</span>ool
                </h1>
              </div>
            </Link>
          </div>

          {currentAlert && currentAlert.active && (
            <div className={`status-banner ${currentAlert.type}`}>
              Active {currentAlert.type?.toUpperCase()} alert initiated by {currentAlert.initiatedBy.name}
            </div>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex space-x-2">
                  <Button
                    variant={location.pathname === '/' ? 'default' : 'ghost'}
                    size="sm"
                    asChild
                  >
                    <Link to="/">
                      <Home className="h-4 w-4 mr-1" />
                      Dashboard
                    </Link>
                  </Button>

                  <Button
                    variant={location.pathname === '/protocol' ? 'default' : 'ghost'}
                    size="sm"
                    asChild
                  >
                    <Link to="/protocol">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Protocols
                    </Link>
                  </Button>

                  {isAdmin && (
                    <Button
                      variant={location.pathname === '/stats' ? 'default' : 'ghost'}
                      size="sm"
                      asChild
                    >
                      <Link to="/stats">
                        <BarChart className="h-4 w-4 mr-1" />
                        Statistics
                      </Link>
                    </Button>
                  )}

                  {isSuperAdmin && (
                    <Button
                      variant={location.pathname === '/settings' ? 'default' : 'ghost'}
                      size="sm"
                      asChild
                    >
                      <Link to="/settings">
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Link>
                    </Button>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full h-10 w-10 p-0">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                        <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="md:hidden">
                      <Link to="/">
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="md:hidden">
                      <Link to="/protocol">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Protocols
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="md:hidden">
                        <Link to="/stats">
                          <BarChart className="h-4 w-4 mr-2" />
                          Statistics
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isSuperAdmin && (
                      <DropdownMenuItem asChild className="md:hidden">
                        <Link to="/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="md:hidden" />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
