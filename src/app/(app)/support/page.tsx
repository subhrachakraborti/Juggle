'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageCircle, FileText, HelpCircle } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Support Center</CardTitle>
                    <CardDescription>
                        Get help with your account and app features
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-auto flex-col gap-2 p-6">
                            <HelpCircle className="h-8 w-8" />
                            <div className="text-center">
                                <div className="font-semibold">FAQ</div>
                                <div className="text-sm text-muted-foreground">
                                    Find answers to common questions
                                </div>
                            </div>
                        </Button>
                        <Button variant="outline" className="h-auto flex-col gap-2 p-6">
                            <FileText className="h-8 w-8" />
                            <div className="text-center">
                                <div className="font-semibold">Documentation</div>
                                <div className="text-sm text-muted-foreground">
                                    Learn how to use the app
                                </div>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
                    <CardDescription>
                        Send us a message and we'll get back to you soon
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="What do you need help with?" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Describe your issue or question..."
                                rows={6}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Other Ways to Reach Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <div className="font-medium">Email</div>
                            <div className="text-sm text-muted-foreground">
                                support@example.com
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <div className="font-medium">Live Chat</div>
                            <div className="text-sm text-muted-foreground">
                                Available Mon-Fri, 9am-5pm
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
