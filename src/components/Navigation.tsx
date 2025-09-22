import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Menu, LogOut, User, Settings, Home, Target, Briefcase, TrendingUp, BarChart3, Crown } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Navigation = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
          description: "À bientôt sur Invest Connect !"
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

  const getUserInitials = (user: SupabaseUser) => {
    const name = user.user_metadata?.full_name || user.email || "U";
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
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
              Invest Connect
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
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium text-sm">
                            {user.user_metadata?.full_name || "Utilisateur"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profil</span>
                        </Link>
                      </DropdownMenuItem>
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
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.user_metadata?.full_name || "Utilisateur"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
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