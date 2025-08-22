"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  HeadphonesIcon,
  FileText,
  Users,
  Send,
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
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // You would typically send this to your backend
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      description: "Get help with donations, accounts, and technical issues",
      contact: "support@donatenow.com",
      availability: "24/7 response within 2 hours",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+1 (555) 123-4567",
      availability: "Mon-Fri, 9AM-6PM EST",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Live Chat",
      description: "Instant help for urgent questions",
      contact: "Available on all pages",
      availability: "24/7 automated, live agents 9AM-6PM EST",
    },
  ];

  const supportCategories = [
    {
      icon: <HeadphonesIcon className="h-6 w-6" />,
      title: "General Support",
      description: "Account help, donation questions, technical issues",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Organization Partnerships",
      description: "Register your nonprofit, campaign management",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Media & Press",
      description: "Press inquiries, partnership opportunities",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-24 px-10 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We&apos;re here to help you make a difference. Whether you have
              questions about donating, need technical support, or want to
              partner with us, our team is ready to assist.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-24 px-10">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the contact method that works best for you. Our support
              team is available to help with any questions or concerns.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg border bg-card"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  {method.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {method.description}
                </p>
                <p className="font-medium text-primary mb-2">
                  {method.contact}
                </p>
                <p className="text-sm text-muted-foreground">
                  {method.availability}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-24 px-10 bg-muted/50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form below and we&apos;ll get back to you as soon
                as possible. For urgent matters, please use our phone or live
                chat support.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium mb-2"
                  >
                    Category
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Support</SelectItem>
                      <SelectItem value="donation">Donation Help</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="partnership">
                        Partnership Inquiry
                      </SelectItem>
                      <SelectItem value="press">Media & Press</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-2"
                  >
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Info & Support Categories */}
            <div className="space-y-8">
              {/* Office Info */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Our Office</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">
                        123 Impact Street
                        <br />
                        Suite 400
                        <br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM PST
                        <br />
                        Saturday - Sunday: Emergency support only
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Categories */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Support Categories</h3>
                <div className="space-y-4">
                  {supportCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                    >
                      <div className="text-primary mt-1">{category.icon}</div>
                      <div>
                        <h4 className="font-semibold mb-1">{category.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-6 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Emergency Support
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  For urgent issues affecting active donations or security
                  concerns, contact our emergency hotline:
                </p>
                <p className="font-medium text-red-800 dark:text-red-200">
                  📞 +1 (555) 911-HELP
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Available 24/7 for critical issues only
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Link Section */}
      <section className="py-24 px-10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Need Quick Answers?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Check out our comprehensive FAQ section for instant answers to
              common questions about donations, accounts, security, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/#faq">View FAQ</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/help">Help Center</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
