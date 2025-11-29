'use client';

import { UpcomingEvents } from '@/components/dashboard/upcoming-events';
import { ShoppingEventsList } from '@/components/events/ShoppingEventsList';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import shoppingData from '@/lib/shopping-events.json';

export default function EventsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Events & Shopping</CardTitle>
        <CardDescription>
          A look at your upcoming financial commitments and shopping ideas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calendar" className="w-full">
          <div className="overflow-x-auto -mx-2 px-2">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="calendar" className="flex-1 min-w-[100px]">
                Calendar
              </TabsTrigger>
              <TabsTrigger value="birthdays" className="flex-1 min-w-[100px]">
                Birthdays
              </TabsTrigger>
              <TabsTrigger
                value="anniversaries"
                className="flex-1 min-w-[120px]">
                Anniversaries
              </TabsTrigger>
              <TabsTrigger value="weddings" className="flex-1 min-w-[100px]">
                Weddings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calendar" className="mt-6">
            <UpcomingEvents />
          </TabsContent>

          <TabsContent value="birthdays" className="mt-6">
            <ShoppingEventsList items={shoppingData.birthdays} />
          </TabsContent>

          <TabsContent value="anniversaries" className="mt-6">
            <ShoppingEventsList items={shoppingData.anniversaries} />
          </TabsContent>

          <TabsContent value="weddings" className="mt-6">
            <ShoppingEventsList items={shoppingData.weddings} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
