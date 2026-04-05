import { Card, CardContent } from '@/components/ui/card'
import type { Client } from '../types/client.types'
import { Phone, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface ClientCardProps {
  client: Client
}

export const ClientCard = ({ client }: ClientCardProps) => {
  return (
    <Link to={`/clients/${client.id}`} className="block hover:no-underline group">
      <Card className="hover:shadow-md transition-shadow group-hover:border-primary/50">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={client.avatar_url || undefined} alt={client.full_name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary uppercase">
              {client.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
              {client.full_name}
            </h3>
            <div className="flex flex-col gap-1 mt-1 text-sm text-muted-foreground">
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
