/* eslint-disable react-refresh/only-export-components */
import React from 'react'

export const dummyData = {
  projects: [
    { id: 1, title: "AI Dashboard", client: "Nexus Tech", progress: 85, status: "Active", deadline: "Mar 15", priority: "High" },
    { id: 2, title: "Mobile Banking App", client: "SecureFin", progress: 40, status: "Active", deadline: "Apr 02", priority: "Medium" },
    { id: 3, title: "Brand Identity", client: "Lumina Co", progress: 100, status: "Completed", deadline: "Feb 10", priority: "Low" },
    { id: 4, title: "E-commerce SEO", client: "Trendify", progress: 15, status: "Paused", deadline: "May 20", priority: "Medium" },
    { id: 5, title: "Cloud Migration", client: "DataSafe", progress: 60, status: "Active", deadline: "Mar 30", priority: "High" },
    { id: 6, title: "API Integration", client: "ConnectIt", progress: 95, status: "Review", deadline: "Feb 28", priority: "High" },
    { id: 7, title: "Cyber Security Audit", client: "SafeGuard", progress: 30, status: "Active", deadline: "Apr 15", priority: "High" },
    { id: 8, title: "SaaS Landing Page", client: "Streamline", progress: 100, status: "Completed", deadline: "Jan 20", priority: "Medium" },
    { id: 9, title: "iOS Fitness Tracker", client: "FitLife", progress: 55, status: "Active", deadline: "Jun 10", priority: "High" },
    { id: 10, title: "ERP System Update", client: "LogiCorp", progress: 10, status: "Review", deadline: "Jul 05", priority: "Low" },
    { id: 11, title: "Customer Portal", client: "Retailify", progress: 75, status: "Active", deadline: "May 12", priority: "Medium" },
    { id: 12, title: "Blockchain Wallet", client: "CryptoNode", progress: 20, status: "Paused", deadline: "Aug 22", priority: "High" },
    { id: 13, title: "Email Marketing Bot", client: "MailSwift", progress: 90, status: "Active", deadline: "Mar 28", priority: "Medium" },
    { id: 14, title: "VR Real Estate Tour", client: "SkyView", progress: 45, status: "Review", deadline: "Sep 01", priority: "Low" },
    { id: 15, title: "Auto-Trade Algorithm", client: "FinVise", progress: 65, status: "Active", deadline: "Apr 30", priority: "High" }
  ],
  clients: [
    { id: 1, name: "Sarah Jenkins", company: "Pixelflow", revenue: "$12,400", country: "USA", projects: 4, type: "Enterprise" },
    { id: 2, name: "Dr. Elena Rodriguez", company: "Global Corp", revenue: "$45,200", country: "Spain", projects: 12, type: "Enterprise" },
    { id: 3, name: "Jasmine Low", company: "Trendify", revenue: "$2,100", country: "Singapore", projects: 1, type: "Startup" },
    { id: 4, name: "Alex Rivera", company: "TechSolutions", revenue: "$8,900", country: "Mexico", projects: 3, type: "Standard" },
    { id: 5, name: "Michael Vance", company: "OpenCloud", revenue: "$31,000", country: "Canada", projects: 7, type: "Enterprise" },
    { id: 6, name: "David Smith", company: "Freelance UX", revenue: "$500", country: "UK", projects: 1, type: "Individual" },
    { id: 7, name: "Marcus Thorne", company: "Ironclad Security", revenue: "$18,200", country: "Germany", projects: 5, type: "Enterprise" },
    { id: 8, name: "Sophia Chen", company: "Zenith Apps", revenue: "$9,400", country: "China", projects: 2, type: "Startup" },
    { id: 9, name: "Lucas Meyer", company: "BioHealth systems", revenue: "$62,000", country: "Switzerland", projects: 15, type: "Enterprise" },
    { id: 10, name: "Emma Watson", company: "Creative Pulse", revenue: "$4,500", country: "Australia", projects: 3, type: "Standard" },
    { id: 11, name: "Omar Farooq", company: "Desert Bloom", revenue: "$15,700", country: "UAE", projects: 6, type: "Enterprise" },
    { id: 12, name: "Isabella Rossi", company: "Veloce Motors", revenue: "$27,800", country: "Italy", projects: 9, type: "Enterprise" },
    { id: 13, name: "Liam O'Connor", company: "Emerald Isle Tech", revenue: "$3,200", country: "Ireland", projects: 2, type: "Startup" },
    { id: 14, name: "Yuki Tanaka", company: "Neon Future", revenue: "$51,000", country: "Japan", projects: 11, type: "Enterprise" },
    { id: 15, name: "Amara Okafor", company: "Lagos Logistics", revenue: "$11,200", country: "Nigeria", projects: 4, type: "Standard" },
    { id: 16, name: "Gabriel Silva", company: "Amazonia Green", revenue: "$7,900", country: "Brazil", projects: 3, type: "Startup" },
    { id: 17, name: "Noah Williams", company: "Skyline Realty", revenue: "$35,400", country: "USA", projects: 8, type: "Enterprise" },
    { id: 18, name: "Chloe Dubois", company: "Lumiere Fashion", revenue: "$22,100", country: "France", projects: 6, type: "Enterprise" },
    { id: 19, name: "Arjun Gupta", company: "Indus Innovate", revenue: "$13,500", country: "India", projects: 5, type: "Standard" },
    { id: 20, name: "Zoe Bakker", company: "Nordic Design", revenue: "$6,800", country: "Netherlands", projects: 3, type: "Individual" }
  ],
  analytics: [
    { id: 1, label: "Page Views", value: "1.2M", change: "+14%", trend: "up", color: "blue" },
    { id: 2, label: "Bounce Rate", value: "32%", change: "-2%", trend: "down", color: "green" },
    { id: 3, label: "Conversion", value: "4.8%", change: "+0.5%", trend: "up", color: "indigo" },
    { id: 4, label: "Avg. Session", value: "4m 12s", change: "+12s", trend: "up", color: "purple" },
    { id: 5, label: "Active Users", value: "12,403", change: "-5%", trend: "down", color: "orange" },
    { id: 6, label: "Revenue", value: "$92,400", change: "+22%", trend: "up", color: "emerald" },
    { id: 7, label: "New Leads", value: "842", change: "+8%", trend: "up", color: "pink" },
    { id: 8, label: "Social Shares", value: "15.2K", change: "+31%", trend: "up", color: "sky" },
    { id: 9, label: "Ad Spend", value: "$4,200", change: "-12%", trend: "down", color: "red" },
    { id: 10, label: "Email Open Rate", value: "24.5%", change: "+2.1%", trend: "up", color: "yellow" },
    { id: 11, label: "Return Rate", value: "5.4%", change: "-0.8%", trend: "down", color: "violet" },
    { id: 12, label: "Store Visits", value: "45.1K", change: "+15%", trend: "up", color: "teal" },
    { id: 13, label: "Direct Traffic", value: "310K", change: "+4%", trend: "up", color: "slate" },
    { id: 14, label: "Search Rank", value: "#2.4", change: "+0.6", trend: "up", color: "lime" },
    { id: 15, label: "Customer LTV", value: "$1,120", change: "+5%", trend: "up", color: "rose" }
  ],
  testimonials: [
    { id: 1, author: "Sarah J.", rating: 5, text: "Incredible workflow transformation!", date: "2 days ago", status: "Published" },
    { id: 2, author: "Elena R.", rating: 5, text: "Best analytics dashboard on the market.", date: "1 week ago", status: "Published" },
    { id: 3, author: "Jasmine L.", rating: 4, text: "Clean UI and very responsive support.", date: "Feb 14", status: "Published" },
    { id: 4, author: "Alex R.", rating: 4, text: "Promising automation modules.", date: "Feb 10", status: "Pending" },
    { id: 5, author: "Michael V.", rating: 5, text: "Seamless tech stack integration.", date: "Jan 28", status: "Published" },
    { id: 6, author: "David S.", rating: 3, text: "Needs more custom animations.", date: "Jan 15", status: "Published" },
    { id: 7, author: "Marcus T.", rating: 5, text: "The security features are top-notch.", date: "3 days ago", status: "Published" },
    { id: 8, author: "Sophia C.", rating: 4, text: "Great for scaling startup operations.", date: "Dec 20", status: "Published" },
    { id: 9, author: "Lucas M.", rating: 5, text: "Enterprise data management simplified.", date: "Nov 12", status: "Published" },
    { id: 10, author: "Emma W.", rating: 2, text: "Wait times for support are a bit long.", date: "Oct 05", status: "Pending" },
    { id: 11, author: "Omar F.", rating: 5, text: "Best UI/UX in the industry right now.", date: "Sep 22", status: "Published" },
    { id: 12, author: "Isabella R.", rating: 4, text: "Love the mobile app functionality.", date: "Aug 15", status: "Published" },
    { id: 13, author: "Liam O.", rating: 3, text: "The learning curve is a bit steep.", date: "Jul 10", status: "Pending" },
    { id: 14, author: "Yuki T.", rating: 5, text: "Perfect for international teams.", date: "Jun 02", status: "Published" },
    { id: 15, author: "Amara O.", rating: 4, text: "Very reliable cloud syncing.", date: "May 20", status: "Published" }
  ],
  products: [
    { id: 1, name: "CMS Enterprise", price: "$299", stock: 142, category: "Software", sales: 850, rating: 4.9 },
    { id: 2, name: "Analytics Pro", price: "$99", stock: 0, category: "Plugins", sales: 1200, rating: 4.7 },
    { id: 3, name: "UI Kit Bundle", price: "$49", stock: 850, category: "Design", sales: 340, rating: 4.8 },
    { id: 4, name: "SEO Optimizer", price: "$149", stock: 210, category: "Software", sales: 620, rating: 4.5 },
    { id: 5, name: "Security Shield", price: "$199", stock: 55, category: "Security", sales: 120, rating: 4.9 },
    { id: 6, name: "Support Plan", price: "$599", stock: 1000, category: "Service", sales: 45, rating: 5.0 },
    { id: 7, name: "Logo Pack", price: "$29", stock: 500, category: "Design", sales: 1100, rating: 4.6 },
    { id: 8, name: "CRM Plugin", price: "$89", stock: 120, category: "Plugins", sales: 450, rating: 4.8 },
    { id: 9, name: "Hosting Plus", price: "$19", stock: 1000, category: "Service", sales: 2300, rating: 4.9 },
    { id: 10, name: "API Key Gen", price: "$39", stock: 0, category: "Software", sales: 900, rating: 4.4 },
    { id: 11, name: "Icon Set", price: "$15", stock: 2000, category: "Design", sales: 5000, rating: 5.0 },
    { id: 12, name: "Backup Cloud", price: "$59", stock: 340, category: "Security", sales: 780, rating: 4.7 },
    { id: 13, name: "Theme Builder", price: "$129", stock: 88, category: "Software", sales: 310, rating: 4.3 },
    { id: 14, name: "Chat Widget", price: "$45", stock: 150, category: "Plugins", sales: 640, rating: 4.8 },
    { id: 15, name: "Legal Pack", price: "$199", stock: 100, category: "Service", sales: 150, rating: 4.9 }
  ],
  support: {
    faqs: [
      { id: 1, question: "How do I reset my account password?", answer: "Go to Settings > Profile and click on the 'Reset Password' button." },
      { id: 2, question: "How can I export my analytics data?", answer: "Navigate to the Analytics dashboard and click 'Download Report' at the top right." },
      { id: 3, question: "Is there a limit on active projects?", answer: "Enterprise users have unlimited projects, while Standard users are limited to 10." },
      { id: 4, question: "Can I add custom branding to my dashboard?", answer: "Yes, this feature is available under Settings > Customization." }
    ],
    tickets: [
      { id: "TK-102", subject: "Billing issue", status: "Open", priority: "High", date: "Feb 20" },
      { id: "TK-105", subject: "API documentation error", status: "In Progress", priority: "Medium", date: "Feb 18" },
      { id: "TK-108", subject: "Feature request: Dark mode", status: "Closed", priority: "Low", date: "Feb 15" }
    ],
    categories: [
      { id: 1, title: "Account & Security", icon: "Shield", count: 12 },
      { id: 2, title: "Billing & Plans", icon: "CreditCard", count: 8 },
      { id: 3, title: "Technical Support", icon: "Cpu", count: 24 },
      { id: 4, title: "Feature Requests", icon: "Zap", count: 15 }
    ]
  }
}

const Dumydata = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Sample Data Inventory</h2>
      <pre className="bg-secondary p-4 rounded-xl overflow-auto max-h-[500px] text-xs">
        {JSON.stringify(dummyData, null, 2)}
      </pre>
    </div>
  )
}

export default Dumydata