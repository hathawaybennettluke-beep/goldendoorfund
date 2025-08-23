"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Sparkles,
  Award,
  Heart,
  Target,
  TrendingUp,
  Crown,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock user data
const mockUser = {
  id: "user_123",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  bio: "Passionate about making a difference in education and environmental causes. Proud supporter of clean water initiatives worldwide.",
  joinDate: "2023-03-15",
  totalDonated: 2450,
  campaignsSupported: 12,
  impactPoints: 850,
  profileImage:
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
  preferences: {
    newsletter: true,
    donationReminders: true,
    impactUpdates: true,
  },
  badges: [
    {
      name: "First Donation",
      description: "Made your first donation",
      earned: "2023-03-20",
    },
    {
      name: "Education Supporter",
      description: "Donated to 3+ education campaigns",
      earned: "2023-06-15",
    },
    {
      name: "Monthly Donor",
      description: "Set up recurring donations",
      earned: "2023-08-01",
    },
    {
      name: "Community Builder",
      description: "Shared 5+ campaigns",
      earned: "2023-10-12",
    },
  ],
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
    phone: mockUser.phone,
    location: mockUser.location,
    bio: mockUser.bio,
  });

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving profile data:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      phone: mockUser.phone,
      location: mockUser.location,
      bio: mockUser.bio,
    });
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-10 sm:py-14 lg:py-20 px-4 sm:px-6 lg:px-10 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-1/4 right-1/4 h-32 w-32 sm:h-64 sm:w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 h-24 w-24 sm:h-48 sm:w-48 rounded-full bg-secondary/10 blur-2xl" />
        </div>

        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 sm:px-6 sm:py-3 text-sm font-medium text-primary border border-primary/20 mb-6">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Profile
            </div>
            
            <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
              Your Impact Profile
            </h1>
            
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Manage your profile, track your impact, and see how your generosity creates positive change around the world.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                ${mockUser.totalDonated.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Donated</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
              <div className="text-xl sm:text-2xl font-bold text-secondary mb-1">
                {mockUser.campaignsSupported}
              </div>
              <div className="text-xs text-muted-foreground">Campaigns Supported</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
              <div className="text-xl sm:text-2xl font-bold text-accent mb-1">
                {mockUser.impactPoints}
              </div>
              <div className="text-xs text-muted-foreground">Impact Points</div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
        <div className="container">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <Card className="relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={mockUser.profileImage}
                          alt={`${mockUser.firstName} ${mockUser.lastName}`}
                          className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <Crown className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
                          {mockUser.firstName} {mockUser.lastName}
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                          Member since {new Date(mockUser.joinDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="group"
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-6">
                  {/* Bio */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-foreground">About Me</h3>
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="min-h-[100px] bg-background/80 border-border/50"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">{mockUser.bio}</p>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground">Email</h3>
                      </div>
                      <p className="text-muted-foreground">{mockUser.email}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground">Phone</h3>
                      </div>
                      {isEditing ? (
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-background/80 border-border/50"
                        />
                      ) : (
                        <p className="text-muted-foreground">{mockUser.phone}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground">Location</h3>
                      </div>
                      {isEditing ? (
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="bg-background/80 border-border/50"
                        />
                      ) : (
                        <p className="text-muted-foreground">{mockUser.location}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground">Join Date</h3>
                      </div>
                      <p className="text-muted-foreground">
                        {new Date(mockUser.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Edit Actions */}
                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preferences */}
              <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(mockUser.preferences).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge variant={value ? "default" : "secondary"} className="text-xs">
                        {value ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Badges */}
              <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockUser.badges.map((badge, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                        <Star className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-foreground">{badge.name}</h4>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <p className="text-xs text-primary mt-1">Earned {badge.earned}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
