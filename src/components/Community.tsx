import { ArrowUpRight, Sparkles, Heart, Users, Globe, Star, MessageCircle, Share2 } from "lucide-react";
import { FaDiscord, FaLinkedin, FaXTwitter, FaInstagram, FaYoutube } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

const Community = () => {
  const socialPlatforms = [
    {
      name: "Twitter",
      icon: <FaXTwitter className="size-6" />,
      description: "Follow our latest updates and impact stories.",
      url: "#",
      color: "from-blue-400 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin className="size-6" />,
      description: "Connect with us and explore partnership opportunities.",
      url: "#",
      color: "from-blue-600 to-blue-800",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
    },
    {
      name: "Instagram",
      icon: <FaInstagram className="size-6" />,
      description: "See the real impact of your donations through photos and stories.",
      url: "#",
      color: "from-pink-400 to-pink-600",
      bgColor: "from-pink-50 to-pink-100",
      borderColor: "border-pink-200",
    },
    {
      name: "YouTube",
      icon: <FaYoutube className="size-6" />,
      description: "Watch videos about our campaigns and community impact.",
      url: "#",
      color: "from-red-500 to-red-700",
      bgColor: "from-red-50 to-red-100",
      borderColor: "border-red-200",
    },
    {
      name: "Discord",
      icon: <FaDiscord className="size-6" />,
      description: "Join our community discussions and get real-time updates.",
      url: "#",
      color: "from-indigo-500 to-indigo-700",
      bgColor: "from-indigo-50 to-indigo-100",
      borderColor: "border-indigo-200",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Monthly Donor",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
      content: "I've been donating monthly for 2 years and love seeing the real-time updates on how my contributions are making a difference.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Campaign Supporter",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
      content: "The transparency and impact tracking are incredible. I can see exactly where my donations go and the results they achieve.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Volunteer",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
      content: "Being part of this community has shown me the power of collective action. Every donation truly makes a difference.",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-secondary/10 blur-2xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:70px_70px]" />
      </div>

      <div className="container relative z-10">
        {/* Header Section */}
        <div className="mx-auto max-w-4xl text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
            <Users className="h-4 w-4" />
            Join Our Community
          </div>
          
          <h2 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
            Connect, Share, and Make Impact Together
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Join thousands of donors, volunteers, and supporters who are passionate about creating positive change. Share experiences, stay updated, and be part of our global community.
          </p>
        </div>

        {/* Testimonials Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">What Our Community Says</h3>
            <p className="text-muted-foreground">Real stories from real people making a difference</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/30"
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Content */}
                <div className="relative mb-6">
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                </div>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-border/50"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                
                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Social Platforms Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Connect With Us</h3>
            <p className="text-muted-foreground">Follow us on social media for updates, stories, and community engagement</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialPlatforms.map((platform, index) => (
              <a
                key={index}
                href={platform.url}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/30"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${platform.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative">
                  {/* Icon */}
                  <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${platform.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {platform.icon}
                  </div>
                  
                  {/* Content */}
                  <h4 className="mb-3 text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {platform.name}
                  </h4>
                  
                  <p className="mb-6 text-muted-foreground leading-relaxed">
                    {platform.description}
                  </p>
                  
                  {/* Arrow */}
                  <div className="flex items-center gap-2 text-primary font-medium group-hover:text-primary/80 transition-colors duration-300">
                    <span>Follow us</span>
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
                </div>
                
                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </a>
            ))}
          </div>
        </div>

        {/* Community Stats */}
        <div className="mb-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">15K+</div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
              <div className="text-3xl font-bold text-secondary mb-2">450+</div>
              <div className="text-sm text-muted-foreground">Campaigns Supported</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
              <div className="text-3xl font-bold text-accent mb-2">98.5%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support Available</div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="text-center">
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card to-card/80 p-12 shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.02)_25%,rgba(0,0,0,0.02)_75%,transparent_75%)] bg-[size:25px_25px]" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
                <MessageCircle className="h-4 w-4" />
                Stay Connected
              </div>
              
              <h3 className="mb-4 text-3xl font-bold md:text-4xl">
                Get Impact Updates & Stories
              </h3>
              
              <p className="mb-8 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Subscribe to our newsletter for regular updates on campaign progress, impact stories, and ways to get involved.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                />
                <Button 
                  size="lg"
                  className="px-8 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-6 py-3 text-sm text-muted-foreground">
            <Share2 className="h-4 w-4 text-primary" />
            Share your impact story with our community
          </div>
        </div>
      </div>
    </section>
  );
};

export { Community };
