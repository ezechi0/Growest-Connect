import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { Menu, LogOut, User, Settings, Home, Target, Briefcase, TrendingUp, BarChart3, Crown, Shield } from "lucide-react";

const Navigation = () => {
  const { user, profile, isAdmin, isKycApproved } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erreur de déconnexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Déconnexion réussie",
          description: "À bientôt sur Growest Connect !"
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  const navItems = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/mission", label: "Mission", icon: Target },
    { href: "/projects", label: "Projets", icon: Briefcase },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/premium", label: "Premium", icon: Crown }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-primary hidden sm:inline-block">
              Growest Connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive(item.href) 
                      ? "text-primary bg-secondary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                         <Avatar className="h-10 w-10">
                           <AvatarImage src={profile?.avatar_url || ""} />
                           <AvatarFallback className="bg-primary text-primary-foreground">
                             {getUserInitials()}
                           </AvatarFallback>
                         </Avatar>
                         {!isKycApproved() && profile?.kyc_status !== 'approved' && (
                           <Badge variant="outline" className="absolute -top-2 -right-2 text-xs p-1">
                             KYC
                           </Badge>
                         )}
                       </Button>
                     </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                       <div className="flex items-center justify-start gap-2 p-2">
                         <div className="flex flex-col space-y-1 leading-none">
                           <p className="font-medium text-sm">
                             {profile?.full_name || user?.email}
                           </p>
                           <p className="text-xs text-muted-foreground">
                             {profile?.user_type === 'entrepreneur' ? 'Porteur de projet' : 
                              profile?.user_type === 'investor' ? 'Investisseur' : 
                              'Utilisateur'}
                           </p>
                         </div>
                         {isAdmin() && (
                           <Badge variant="secondary" className="text-xs">
                             Admin
                           </Badge>
                         )}
                       </div>
                      <DropdownMenuSeparator />
                       <DropdownMenuItem asChild>
                         <Link to="/profile" className="flex items-center">
                           <User className="mr-2 h-4 w-4" />
                           <span>Profil</span>
                         </Link>
                       </DropdownMenuItem>
                       {isAdmin() && (
                         <DropdownMenuItem asChild>
                           <Link to="/admin" className="flex items-center">
                             <Shield className="mr-2 h-4 w-4" />
                             <span>Administration</span>
                           </Link>
                         </DropdownMenuItem>
                       )}
                       <DropdownMenuItem>
                         <Settings className="mr-2 h-4 w-4" />
                         <span>Paramètres</span>
                       </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Déconnexion</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                      <div className="flex flex-col h-full">
                        {/* User Info */}
                         <div className="flex items-center space-x-3 p-4 border-b">
                           <Avatar className="h-12 w-12">
                             <AvatarImage src={profile?.avatar_url || ""} />
                             <AvatarFallback className="bg-primary text-primary-foreground">
                               {getUserInitials()}
                             </AvatarFallback>
                           </Avatar>
                           <div className="flex-1">
                             <p className="font-medium">
                               {profile?.full_name || user?.email}
                             </p>
                             <p className="text-sm text-muted-foreground">
                               {profile?.user_type === 'entrepreneur' ? 'Porteur de projet' : 
                                profile?.user_type === 'investor' ? 'Investisseur' : 
                                'Utilisateur'}
                             </p>
                             {!isKycApproved() && profile?.kyc_status !== 'approved' && (
                               <Badge variant="outline" className="text-xs mt-1">
                                 KYC en cours
                               </Badge>
                             )}
                           </div>
                         </div>

                        {/* Mobile Navigation */}
                        <nav className="flex-1 py-6">
                          <div className="space-y-2">
                            {navItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  to={item.href}
                                  onClick={() => setIsOpen(false)}
                                  className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors
                                    ${isActive(item.href) 
                                      ? "text-primary bg-secondary" 
                                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                    }`}
                                >
                                  <Icon className="w-5 h-5" />
                                  <span>{item.label}</span>
                                </Link>
                              );
                            })}
                             <Link
                               to="/profile"
                               onClick={() => setIsOpen(false)}
                               className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors
                                 ${isActive("/profile") 
                                   ? "text-primary bg-secondary" 
                                   : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                 }`}
                             >
                               <User className="w-5 h-5" />
                               <span>Profil</span>
                             </Link>
                             {isAdmin() && (
                               <Link
                                 to="/admin"
                                 onClick={() => setIsOpen(false)}
                                 className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors
                                   ${isActive("/admin") 
                                     ? "text-primary bg-secondary" 
                                     : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                   }`}
                               >
                                 <Shield className="w-5 h-5" />
                                 <span>Administration</span>
                               </Link>
                             )}
                          </div>
                        </nav>

                        {/* Sign Out */}
                        <div className="border-t p-4">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start" 
                            onClick={handleSignOut}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Déconnexion
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <>
                {/* Not authenticated */}
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="outline" asChild>
                    <Link to="/auth">Connexion</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth">Inscription</Link>
                  </Button>
                </div>

                {/* Mobile - Auth */}
                <div className="md:hidden">
                  <Button size="sm" asChild>
                    <Link to="/auth">Connexion</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;