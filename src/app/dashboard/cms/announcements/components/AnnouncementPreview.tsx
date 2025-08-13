'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar, 
  MapPin, 
  Users, 
  User, 
  Clock,
  Globe,
  Tag,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { type Announcement } from '@/lib/services/announcement.service';

interface AnnouncementPreviewProps {
  announcement: Announcement;
  onClose: () => void;
  language?: 'en' | 'sw';
  onLanguageChange?: (language: 'en' | 'sw') => void;
}

export function AnnouncementPreview({
  announcement,
  onClose,
  language = 'en',
  onLanguageChange
}: AnnouncementPreviewProps) {
  if (!announcement) return null;

  const getTitle = () => {
    return language === 'sw' && announcement.titleSwahili 
      ? announcement.titleSwahili 
      : announcement.title;
  };

  const getContent = () => {
    return language === 'sw' && announcement.contentSwahili 
      ? announcement.contentSwahili 
      : announcement.content;
  };

  const getSummary = () => {
    return language === 'sw' && announcement.summarySwahili 
      ? announcement.summarySwahili 
      : announcement.summary;
  };

  const getVenue = () => {
    return language === 'sw' && announcement.venueSwahili 
      ? announcement.venueSwahili 
      : announcement.venue;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Dialog open={!!announcement} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{getTitle()}</DialogTitle>
              <DialogDescription>
                Preview how this announcement will appear to users
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(announcement.priority)}>
                {announcement.priority}
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Banner */}
          {announcement.bannerUrl && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img
                src={announcement.bannerUrl}
                alt={getTitle()}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Announcement Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{getTitle()}</CardTitle>
                  {getSummary() && (
                    <CardDescription className="mt-2 text-base">
                      {getSummary()}
                    </CardDescription>
                  )}
                </div>
                {announcement.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap">{getContent()}</div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          {(announcement.eventDate || announcement.venue || announcement.registrationRequired) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {announcement.eventDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Event Date</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(announcement.eventDate), 'EEEE, MMMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                  )}

                  {getVenue() && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Venue</div>
                        <div className="text-sm text-muted-foreground">
                          {getVenue()}
                        </div>
                      </div>
                    </div>
                  )}

                  {announcement.maxParticipants && (
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Max Participants</div>
                        <div className="text-sm text-muted-foreground">
                          {announcement.maxParticipants} people
                        </div>
                      </div>
                    </div>
                  )}

                  {announcement.registrationRequired && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="font-medium">Registration Required</div>
                        <div className="text-sm text-muted-foreground">
                          {announcement.registrationDeadline 
                            ? `Deadline: ${format(new Date(announcement.registrationDeadline), 'MMM dd, yyyy')}`
                            : 'Open registration'
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Announcement Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Category:</span>
                    <Badge variant="outline">{announcement.category}</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Target Audience:</span>
                    <Badge variant="outline">{announcement.targetAudience}</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Visibility:</span>
                    <Badge variant="outline">
                      <Globe className="w-3 h-3 mr-1" />
                      {announcement.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  
                  {announcement.tags && (
                    <div className="flex justify-between">
                      <span className="font-medium">Tags:</span>
                      <div className="flex gap-1">
                        {announcement.tags.split(',').map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="w-2 h-2 mr-1" />
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Publish Date:</span>
                    <span>{format(new Date(announcement.publishDate), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  {announcement.expiryDate && (
                    <div className="flex justify-between">
                      <span className="font-medium">Expiry Date:</span>
                      <span>{format(new Date(announcement.expiryDate), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  
                  {announcement.author && (
                    <div className="flex justify-between">
                      <span className="font-medium">Author:</span>
                      <span>{announcement.author.firstName} {announcement.author.lastName}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Created:</span>
                    <span>{announcement.createdAt ? format(new Date(announcement.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language Toggle for Preview */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Button
                variant={language === 'en' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onLanguageChange?.('en')}
              >
                English
              </Button>
              <Button
                variant={language === 'sw' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onLanguageChange?.('sw')}
              >
                Kiswahili
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
