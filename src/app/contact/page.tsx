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
  Sparkles,
  Star,
  CheckCircle,
  Loader2,
  AlertCircle
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
import { Footer } from "@/components/Footer";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const submitContactForm = useAction(api.contactFormAction.submitContactForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Basic client-side validation
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.name.length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }

      if (formData.message.length < 10) {
        throw new Error('Message must be at least 10 characters long');
      }

      // Get user's IP and user agent for security
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;
      
      const result = await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: `Subject: ${formData.subject || 'No subject'}\nCategory: ${formData.category || 'General'}\n\nMessage:\n${formData.message.trim()}`,
        ipAddress: ipData?.ip,
        userAgent: navigator.userAgent,
      });

      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          name: "",
          email: "",
          subject: "",
          category: "",
          message: "",
        });
        toast.success(result.message || 'Message sent successfully!');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      const message = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      setErrorMessage(message);
      setSubmitStatus('error');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+1 (555) 123-4567",
      availability: "Mon-Fri, 9AM-6PM EST",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Live Chat",
      description: "Instant help for urgent questions",
      contact: "Available on all pages",
      availability: "24/7 automated, live agents 9AM-6PM EST",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
    },
  ];

  const supportCategories = [
    {
      icon: <HeadphonesIcon className="h-6 w-6" />,
      title: "General Support",
      description: "Account help, donation questions, technical issues",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Organization Partnerships",
      description: "Register your nonprofit, campaign management",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Media & Press",
      description: "Press inquiries, partnership opportunities",
      color: "from-pink-500 to-pink-600",
    },
  ];

  const features = [
    "24/7 Customer Support",
    "Real-time Chat Assistance",
    "Multilingual Support",
    "Expert Team Members",
    "Quick Response Times",
    "Comprehensive Help Center"
  ];

  return (
    <div className="flex flex-col">
      {/* Enhanced Hero Section */}
      <section className="relative py-32 px-10 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 h-48 w-48 rounded-full bg-secondary/10 blur-2xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 blur-3xl opacity-30" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-sm font-semibold text-primary border border-primary/20 mb-8 shadow-lg backdrop-blur-sm">
              <MessageCircle className="h-4 w-4" />
              We&apos;re Here to Help
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              We&apos;re here to help you make a difference. Whether you have
              questions about donating, need technical support, or want to
              partner with us, our team is ready to assist.
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Methods */}
      <section className="py-32 px-10">
        <div className="container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Star className="h-4 w-4" />
              Get In Touch
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
              Choose Your Preferred Method
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Choose the contact method that works best for you. Our support
              team is available to help with any questions or concerns.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/30 hover:bg-card/80"
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${method.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${method.color} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">{method.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {method.description}
                  </p>
                  <p className="font-bold text-primary mb-2 text-lg">
                    {method.contact}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {method.availability}
                  </p>
                </div>
                
                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Form & Info */}
      <section className="py-32 px-10 bg-gradient-to-br from-muted/30 to-muted/50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Enhanced Contact Form */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
                <Send className="h-4 w-4" />
                Send Message
              </div>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
                Send Us a Message
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Fill out the form below and we&apos;ll get back to you as soon
                as possible. For urgent matters, please use our phone or live
                chat support.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold mb-2 text-foreground"
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
                      className="h-12 border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold mb-2 text-foreground"
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
                      className="h-12 border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold mb-2 text-foreground"
                  >
                    Category
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger className="h-12 border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300">
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
                    className="block text-sm font-semibold mb-2 text-foreground"
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
                    className="h-12 border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold mb-2 text-foreground"
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
                    className="border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 resize-none"
                  />
                </div>

                {/* Success Message */}
                {submitStatus === 'success' && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-green-800 font-medium">
                      Thank you! Your message has been sent successfully. We'll get back to you soon.
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {submitStatus === 'error' && errorMessage && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-800 font-medium">{errorMessage}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Enhanced Contact Info & Support Categories */}
            <div className="space-y-8">
              {/* Office Info */}
              <div className="p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">Our Office</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Address</p>
                      <p className="text-muted-foreground leading-relaxed">
                        123 Impact Street
                        <br />
                        Suite 400
                        <br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Business Hours</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Monday - Friday: 9:00 AM - 6:00 PM PST
                        <br />
                        Saturday - Sunday: Emergency support only
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Support Categories */}
              <div className="p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">Support Categories</h3>
                <div className="space-y-4">
                  {supportCategories.map((category, index) => (
                    <div
                      key={index}
                      className="group flex items-start gap-4 p-4 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                    >
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {category.icon}
                      </div>
                      <div>
                        <h4 className="font-bold mb-1 group-hover:text-primary transition-colors duration-300">{category.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Emergency Contact */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-red-800 text-xl">Emergency Support</h4>
                </div>
                <p className="text-red-700 mb-4 leading-relaxed">
                  For urgent issues affecting active donations or security
                  concerns, contact our emergency hotline:
                </p>
                <p className="font-bold text-red-800 text-lg mb-2">
                  📞 +1 (555) 911-HELP
                </p>
                <p className="text-sm text-red-600">
                  Available 24/7 for critical issues only
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Link Section */}
      <section className="py-32 px-10 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4" />
              Need Quick Answers?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
              Find Answers Instantly
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Check out our comprehensive FAQ section for instant answers to
              common questions about donations, accounts, security, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" asChild>
                <Link href="/#faq">View FAQ</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300" asChild>
                <Link href="/help">Help Center</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
