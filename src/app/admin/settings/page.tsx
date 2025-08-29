"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Settings,
  Globe,
  Save,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  Upload,
  Palette,
  Layout,
  FileText,
  Home,
  Info,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type CMSContentItem = {
  _id: Id<"cmsContent">;
  pageType: "home" | "about" | "contact";
  sectionType: string;
  contentType: "text" | "card" | "hero" | "stats";
  identifier: string;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  buttonText?: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  iconName?: string;
  color?: string;
  order: number;
  isActive: boolean;
  metadata?: string;
  createdAt: number;
  updatedAt: number;
};

type SiteSettingItem = {
  _id: Id<"siteSettings">;
  key: string;
  value: string;
  type: "text" | "textarea" | "number" | "boolean" | "url" | "color";
  category: string;
  label: string;
  description?: string;
  isPublic: boolean;
  updatedAt: number;
};

export default function SettingsManagement() {
  const [activeTab, setActiveTab] = useState("general");
  const [editingContent, setEditingContent] = useState<CMSContentItem | null>(
    null
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  // Fetch data
  const allContent = useQuery(api.cms.getAllContent, {});
  const siteSettings = useQuery(api.cms.getSiteSettings, {});

  // Mutations
  const createContent = useMutation(api.cms.createContent);
  const updateContent = useMutation(api.cms.updateContent);
  const deleteContent = useMutation(api.cms.deleteContent);
  const toggleActive = useMutation(api.cms.toggleContentActive);
  const upsertSetting = useMutation(api.cms.upsertSetting);
  const seedInitialContent = useMutation(api.cms.seedInitialContent);

  const [formData, setFormData] = useState<Partial<CMSContentItem>>({});

  // Reset form when editing changes
  useEffect(() => {
    if (editingContent) {
      setFormData(editingContent);
    } else {
      setFormData({
        pageType: "home",
        sectionType: "",
        contentType: "text",
        identifier: "",
        order: 0,
        isActive: true,
      });
    }
  }, [editingContent]);

  // Handle content form submission
  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");

    try {
      if (editingContent) {
        await updateContent({
          id: editingContent._id,
          ...formData,
        });
      } else {
        await createContent({
          pageType: formData.pageType!,
          sectionType: formData.sectionType!,
          contentType: formData.contentType!,
          identifier: formData.identifier!,
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          content: formData.content,
          buttonText: formData.buttonText,
          buttonUrl: formData.buttonUrl,
          secondaryButtonText: formData.secondaryButtonText,
          secondaryButtonUrl: formData.secondaryButtonUrl,
          imageUrl: formData.imageUrl,
          imageAlt: formData.imageAlt,
          iconName: formData.iconName,
          color: formData.color,
          order: formData.order || 0,
          isActive: formData.isActive,
          metadata: formData.metadata,
        });
      }

      setSaveStatus("success");
      setIsDialogOpen(false);
      setEditingContent(null);
      setFormData({});

      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save content:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const getPageIcon = (pageType: string) => {
    switch (pageType) {
      case "home":
        return <Home className="h-4 w-4" />;
      case "about":
        return <Info className="h-4 w-4" />;
      case "contact":
        return <Phone className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case "saving":
        return <Loader className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  const groupedContent = allContent?.reduce(
    (acc, item) => {
      const key = `${item.pageType}-${item.sectionType}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, CMSContentItem[]>
  );

  const groupedSettings = siteSettings?.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, SiteSettingItem[]>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings & CMS</h1>
          <p className="text-muted-foreground">
            Manage site content, customize pages, and configure platform
            settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus !== "idle" && (
            <div className="flex items-center gap-2 text-sm">
              {getSaveStatusIcon()}
              <span>
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "success" && "Saved successfully!"}
                {saveStatus === "error" && "Save failed"}
              </span>
            </div>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Page Content
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            SEO & Meta
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Configure basic site information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedSettings?.general && (
                <div className="grid gap-4">
                  {groupedSettings.general.map((setting) => (
                    <div key={setting._id} className="grid gap-2">
                      <Label htmlFor={setting.key}>{setting.label}</Label>
                      {setting.description && (
                        <p className="text-xs text-muted-foreground">
                          {setting.description}
                        </p>
                      )}
                      {setting.type === "textarea" ? (
                        <Textarea
                          id={setting.key}
                          value={setting.value}
                          onChange={(e) =>
                            upsertSetting({
                              ...setting,
                              value: e.target.value,
                            })
                          }
                          className="min-h-[100px]"
                        />
                      ) : setting.type === "boolean" ? (
                        <Switch
                          checked={setting.value === "true"}
                          onCheckedChange={(checked) =>
                            upsertSetting({
                              ...setting,
                              value: checked.toString(),
                            })
                          }
                        />
                      ) : (
                        <Input
                          id={setting.key}
                          type={
                            setting.type === "number"
                              ? "number"
                              : setting.type === "url"
                                ? "url"
                                : setting.type === "color"
                                  ? "color"
                                  : "text"
                          }
                          value={setting.value}
                          onChange={(e) =>
                            upsertSetting({
                              ...setting,
                              value: e.target.value,
                            })
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Settings can be managed directly through the form inputs above */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Management Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Page Content Management
              </h2>
              <p className="text-muted-foreground">
                Edit content sections across your website pages
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingContent(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Content Section
            </Button>
          </div>

          {/* Content Sections by Page */}
          {groupedContent &&
            Object.entries(groupedContent).map(([key, items]) => {
              const [pageType, sectionType] = key.split("-");
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getPageIcon(pageType)}
                      {pageType.charAt(0).toUpperCase() +
                        pageType.slice(1)}{" "}
                      Page -{" "}
                      {sectionType.charAt(0).toUpperCase() +
                        sectionType.slice(1)}
                    </CardTitle>
                    <CardDescription>
                      {items.length} content item{items.length !== 1 ? "s" : ""}{" "}
                      in this section
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  item.isActive ? "default" : "secondary"
                                }
                              >
                                {item.contentType}
                              </Badge>
                              {!item.isActive && (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {item.title || item.identifier}
                              </div>
                              {item.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {item.description.length > 100
                                    ? `${item.description.substring(0, 100)}...`
                                    : item.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActive({ id: item._id })}
                            >
                              {item.isActive ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingContent(item);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Content
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this content
                                    section? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deleteContent({ id: item._id })
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand & Appearance</CardTitle>
              <CardDescription>
                Customize your platform&apos;s visual appearance and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedSettings?.appearance && (
                <div className="grid gap-4">
                  {groupedSettings.appearance.map((setting) => (
                    <div key={setting._id} className="grid gap-2">
                      <Label htmlFor={setting.key}>{setting.label}</Label>
                      {setting.description && (
                        <p className="text-xs text-muted-foreground">
                          {setting.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          id={setting.key}
                          type={setting.type === "color" ? "color" : "text"}
                          value={setting.value}
                          onChange={(e) =>
                            upsertSetting({
                              ...setting,
                              value: e.target.value,
                            })
                          }
                          className={
                            setting.type === "color" ? "w-20 h-10 p-1" : ""
                          }
                        />
                        {setting.type === "color" && (
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: setting.value }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO & Meta Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Meta Information</CardTitle>
              <CardDescription>
                Manage search engine optimization and social media metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedSettings?.seo && (
                <div className="grid gap-4">
                  {groupedSettings.seo.map((setting) => (
                    <div key={setting._id} className="grid gap-2">
                      <Label htmlFor={setting.key}>{setting.label}</Label>
                      {setting.description && (
                        <p className="text-xs text-muted-foreground">
                          {setting.description}
                        </p>
                      )}
                      {setting.type === "textarea" ? (
                        <Textarea
                          id={setting.key}
                          value={setting.value}
                          onChange={(e) =>
                            upsertSetting({
                              ...setting,
                              value: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={setting.key}
                          type={setting.type === "url" ? "url" : "text"}
                          value={setting.value}
                          onChange={(e) =>
                            upsertSetting({
                              ...setting,
                              value: e.target.value,
                            })
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Content Editing Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingContent ? "Edit Content Section" : "Add Content Section"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editingContent
                ? "Update the content section details"
                : "Create a new content section for your website"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={handleContentSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pageType">Page</Label>
                <Select
                  value={formData.pageType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      pageType: value as "home" | "about" | "contact",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home Page</SelectItem>
                    <SelectItem value="about">About Page</SelectItem>
                    <SelectItem value="contact">Contact Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sectionType">Section</Label>
                <Input
                  id="sectionType"
                  value={formData.sectionType}
                  onChange={(e) =>
                    setFormData({ ...formData, sectionType: e.target.value })
                  }
                  placeholder="e.g., hero, features, values"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      contentType: value as "text" | "card" | "hero" | "stats",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Block</SelectItem>
                    <SelectItem value="card">Card/Feature</SelectItem>
                    <SelectItem value="hero">Hero Section</SelectItem>
                    <SelectItem value="stats">Statistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier">Identifier</Label>
                <Input
                  id="identifier"
                  value={formData.identifier}
                  onChange={(e) =>
                    setFormData({ ...formData, identifier: e.target.value })
                  }
                  placeholder="unique-content-id"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2 flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Section title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="Section subtitle"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Section description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Rich Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Rich text content (HTML supported)"
                  rows={5}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonText: e.target.value })
                    }
                    placeholder="Button text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buttonUrl">Button URL</Label>
                  <Input
                    id="buttonUrl"
                    value={formData.buttonUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonUrl: e.target.value })
                    }
                    placeholder="/path or https://example.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="secondaryButtonText">
                    Secondary Button Text
                  </Label>
                  <Input
                    id="secondaryButtonText"
                    value={formData.secondaryButtonText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryButtonText: e.target.value,
                      })
                    }
                    placeholder="Secondary button text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryButtonUrl">
                    Secondary Button URL
                  </Label>
                  <Input
                    id="secondaryButtonUrl"
                    value={formData.secondaryButtonUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryButtonUrl: e.target.value,
                      })
                    }
                    placeholder="/path or https://example.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageAlt">Image Alt Text</Label>
                  <Input
                    id="imageAlt"
                    value={formData.imageAlt}
                    onChange={(e) =>
                      setFormData({ ...formData, imageAlt: e.target.value })
                    }
                    placeholder="Description of the image"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="iconName">Icon Name (Lucide)</Label>
                  <Input
                    id="iconName"
                    value={formData.iconName}
                    onChange={(e) =>
                      setFormData({ ...formData, iconName: e.target.value })
                    }
                    placeholder="Heart, Shield, Users, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-20 h-10 p-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metadata">Additional Data (JSON)</Label>
                <Textarea
                  id="metadata"
                  value={formData.metadata}
                  onChange={(e) =>
                    setFormData({ ...formData, metadata: e.target.value })
                  }
                  placeholder='{"key": "value"} - Additional configuration'
                  rows={3}
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                disabled={saveStatus === "saving"}
              >
                {saveStatus === "saving" ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingContent ? "Update" : "Create"} Content
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common content management tasks and utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Upload className="h-6 w-6" />
                  <span>Seed Initial Data</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Initialize CMS Content</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will populate the CMS with default content for your
                    homepage, about page, and FAQ section. This action should
                    only be done once when setting up the site.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        setSaveStatus("saving");
                        await seedInitialContent();
                        setSaveStatus("success");
                        setTimeout(() => setSaveStatus("idle"), 2000);
                      } catch (error) {
                        console.error("Failed to seed content:", error);
                        setSaveStatus("error");
                        setTimeout(() => setSaveStatus("idle"), 3000);
                      }
                    }}
                  >
                    Initialize Content
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => window.open("/", "_blank")}
            >
              <Globe className="h-6 w-6" />
              <span>Preview Site</span>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <Upload className="h-6 w-6" />
              <span>Export Content</span>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <RotateCcw className="h-6 w-6" />
              <span>Backup Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
