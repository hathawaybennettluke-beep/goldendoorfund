"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Upload, Image } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useCampaignImageUpload } from "@/hooks/useCampaignImageUpload";

export default function CreateCampaign() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createCampaign = useMutation(api.campaigns.create);
  const currentUser = useQuery(api.users.getCurrentUser);
  const { uploadImage, isUploading } = useCampaignImageUpload();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalAmount: "",
    organization: "",
    category: "",
    status: "draft" as "active" | "completed" | "upcoming" | "draft",
    urgency: "medium" as "high" | "medium" | "low",
    location: "",
    startDate: "",
    endDate: "",
    featured: false,
    imageUrl: "",
  });

  const [campaignImage, setCampaignImage] = useState<File | null>(null);
  const [campaignImagePreview, setCampaignImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageId = undefined;

      // Upload campaign image if provided
      if (campaignImage) {
        imageId = await uploadImage(campaignImage);
      }

      await createCampaign({
        title: formData.title,
        description: formData.description,
        goalAmount: parseFloat(formData.goalAmount),
        organization: formData.organization,
        category: formData.category,
        status: formData.status,
        urgency: formData.urgency,
        location: formData.location,
        startDate: new Date(formData.startDate).getTime(),
        endDate: new Date(formData.endDate).getTime(),
        featured: formData.featured,
        imageId: imageId || undefined,
        creatorId: currentUser!._id,
      });

      router.push("/admin/campaigns");
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCampaignImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCampaignImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Create New Campaign
          </h1>
          <p className="text-muted-foreground">
            Set up a new donation campaign with all the necessary details.
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter campaign title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="organization">Organization *</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) =>
                      handleInputChange("organization", e.target.value)
                    }
                    placeholder="Enter organization name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Water & Sanitation">
                        Water & Sanitation
                      </SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                      <SelectItem value="Emergency Relief">
                        Emergency Relief
                      </SelectItem>
                      <SelectItem value="Economic Development">
                        Economic Development
                      </SelectItem>
                      <SelectItem value="Animal Welfare">
                        Animal Welfare
                      </SelectItem>
                      <SelectItem value="Arts & Culture">
                        Arts & Culture
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Enter location"
                    required
                  />
                </div>
              </div>

              {/* Campaign Settings */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goalAmount">Goal Amount (USD) *</Label>
                  <Input
                    id="goalAmount"
                    type="number"
                    value={formData.goalAmount}
                    onChange={(e) =>
                      handleInputChange("goalAmount", e.target.value)
                    }
                    placeholder="Enter goal amount"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange(
                        "status",
                        value as "active" | "completed" | "upcoming" | "draft"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="urgency">Urgency Level *</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) =>
                      handleInputChange(
                        "urgency",
                        value as "high" | "medium" | "low"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter campaign description"
                rows={6}
                required
              />
            </div>

            {/* Campaign Image */}
            <div>
              <Label>Campaign Image</Label>
              <div className="space-y-4">
                {campaignImagePreview ? (
                  <div className="relative">
                    <img
                      src={campaignImagePreview}
                      alt="Campaign image preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCampaignImage(null);
                          setCampaignImagePreview("");
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload campaign image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) =>
                  handleInputChange("featured", e.target.checked)
                }
                className="rounded"
              />
              <Label htmlFor="featured">Featured Campaign</Label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || isUploading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading || isUploading ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
