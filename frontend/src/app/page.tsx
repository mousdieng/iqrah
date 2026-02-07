'use client';

import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Heart,
  Moon,
  Sun,
  Award,
} from 'lucide-react';
import Link from 'next/link';


export default function Home() {

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: 'Good Morning', icon: Sun, time: 'morning' };
    if (hour < 17) return { greeting: 'Good Afternoon', icon: Sun, time: 'afternoon' };
    return { greeting: 'Good Evening', icon: Moon, time: 'evening' };
  };

  const { greeting, icon: TimeIcon, time } = getTimeOfDayGreeting();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-emerald-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              إقراء
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <TimeIcon className="h-5 w-5 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">
              {greeting}! Ready for your Quran journey?
            </p>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive digital companion for Quran reading, memorization, and spiritual growth
          </p>
        </section>

        {/* Quick Actions */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/surahs">
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 w-full">
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Browse Surahs</span>
                  </Button>
                </Link>

                <Link href="/mushaf">
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 w-full">
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Mushaf Pages</span>
                  </Button>
                </Link>

                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 w-full">
                  <Heart className="h-6 w-6" />
                  <span className="text-sm">My Favorites</span>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 w-full">
                  <Award className="h-6 w-6" />
                  <span className="text-sm">Achievements</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
