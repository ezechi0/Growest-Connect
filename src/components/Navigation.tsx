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
import { Menu, LogOut, User, Settings, Home, Target, Briefcase, TrendingUp, BarChart3, Shield } from "lucide-react";

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
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 }
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:inline-block">
              Growest Connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
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
                 <div className="hidden md:block">
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
                          <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarImage src={profile?.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          {!isKycApproved() && profile?.kyc_status !== 'approved' && (
                            <Badge variant="outline" className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 border-primary/30">
                              KYC
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 p-2" align="end">
                         <div className="flex items-center gap-3 p-3 border-b mb-2">
                           <Avatar className="h-12 w-12 border-2 border-primary/20">
                             <AvatarImage src={profile?.avatar_url || ""} />
                             <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                               {getUserInitials()}
                             </AvatarFallback>
                           </Avatar>
                           <div className="flex flex-col space-y-1">
                             <p className="text-sm font-semibold leading-none">
                               {profile?.full_name || user?.email}
                             </p>
                             <p className="text-xs text-muted-foreground">
                               {profile?.user_type === 'entrepreneur' ? 'Porteur de projet' : 
                                profile?.user_type === 'investor' ? 'Investisseur' : 
                                'Utilisateur'}
                             </p>
                             <div className="flex gap-1.5 mt-1.5">
                               {isAdmin() && (
                                 <Badge variant="secondary" className="text-xs">
                                   Admin
                                 </Badge>
                               )}
                               {isKycApproved() && (
                                 <Badge variant="default" className="text-xs">
                                   ✓ Vérifié
                                 </Badge>
                               )}
                             </div>
                           </div>
                         </div>
                       <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer py-2">
                          <Link to="/profile" className="flex items-center">
                            <User className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span>Mon Profil</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer py-2">
                          <Link to="/dashboard" className="flex items-center">
                            <BarChart3 className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span>Tableau de bord</span>
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin() && (
                          <DropdownMenuItem asChild className="cursor-pointer py-2">
                            <Link to="/admin" className="flex items-center">
                              <Shield className="mr-3 h-4 w-4 text-muted-foreground" />
                              <span>Administration</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                       <DropdownMenuSeparator className="my-2" />
                       <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 py-2">
                         <LogOut className="mr-3 h-4 w-4" />
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
                <div className="hidden md:flex items-center space-x-3">
                  <Button variant="ghost" asChild className="text-sm font-medium">
                    <Link to="/auth">Se connecter</Link>
                  </Button>
                  <Button asChild className="text-sm font-medium shadow-md">
                    <Link to="/auth">Commencer gratuitement</Link>
                  </Button>
                </div>

                {/* Mobile - Auth */}
                <div className="md:hidden">
                  <Button size="sm" asChild className="shadow-md">
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