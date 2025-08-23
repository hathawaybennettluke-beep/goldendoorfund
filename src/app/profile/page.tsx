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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-12 px-10 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">My Profile</h1>
            <p className="text-muted-foreground text-lg">
              Manage your account information and track your impact
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-10">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        {mockUser.firstName} {mockUser.lastName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" />
                        {mockUser.email}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      First Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-foreground">{mockUser.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Last Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-foreground">{mockUser.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Phone
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {mockUser.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Location
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {mockUser.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Bio</label>
                  {isEditing ? (
                    <Textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={3}
                    />
                  ) : (
                    <p className="text-muted-foreground">{mockUser.bio}</p>
                  )}
                </div>

                {/* Member Since */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Member Since
                  </label>
                  <p className="text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(mockUser.joinDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Save/Cancel Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Impact Summary */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Total Donated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(mockUser.totalDonated)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Across all campaigns
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Campaigns Supported</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {mockUser.campaignsSupported}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Different causes helped
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Impact Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {mockUser.impactPoints}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Community recognition
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Badges & Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Badges & Achievements</CardTitle>
                <CardDescription>
                  Recognition for your generous contributions and community
                  involvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {mockUser.badges.map((badge, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 border rounded-lg"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Badge className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {badge.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Earned on{" "}
                          {new Date(badge.earned).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
