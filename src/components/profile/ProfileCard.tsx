import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Globe, Star } from "lucide-react";

interface ProfileCardProps {
  profile: {
    id: string;
    full_name: string;
    bio?: string;
    avatar_url?: string;
    location?: string;
    company?: string;
    website?: string;
    role: string;
    is_verified?: boolean;
  };
}

export const ProfileCard = ({ profile }: ProfileCardProps) => {

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'entrepreneur':
        return 'Entrepreneur';
      case 'investor':
        return 'Investisseur';
      case 'admin':
        return 'Administrateur';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'entrepreneur':
        return 'default';
      case 'investor':
        return 'secondary';
      case 'admin':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight truncate">
                  {profile.full_name}
                  {profile.is_verified && (
                    <Star className="inline h-4 w-4 text-accent ml-1" />
                  )}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant={getRoleBadgeVariant(profile.role)} className="text-xs">
                    {getRoleLabel(profile.role)}
                  </Badge>
                </div>
              </div>
            </div>
            
            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {profile.company && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{profile.company}</span>
            </div>
          )}
          
          {profile.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{profile.location}</span>
            </div>
          )}
          
          {profile.website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="truncate hover:text-primary hover:underline"
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};