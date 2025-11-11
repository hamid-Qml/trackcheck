import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NeonCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  glowing?: boolean;
}

const NeonCard: React.FC<NeonCardProps> = ({ 
  title, 
  description, 
  children, 
  className = "", 
  glowing = false 
}) => {
  return (
    <Card className={cn(
      "bg-card/60 border-primary/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:bg-card/80",
      glowing && "neon-glow",
      className
    )}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-foreground">{title}</CardTitle>}
          {description && <CardDescription className="text-muted-foreground">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default NeonCard;