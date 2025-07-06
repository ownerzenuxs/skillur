
import { BookOpen, Users, Award, Zap, Shield, Smartphone } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Subjects",
      description: "Master 7 core subjects: Maths, Chemistry, Physics, Biology, Hindi, Bengali, and Computer Science",
      color: "blue"
    },
    {
      icon: Users,
      title: "Referral System",
      description: "Invite friends and earn coins! Get 1 coin for every 2 successful referrals",
      color: "green"
    },
    {
      icon: Award,
      title: "Premium Plans",
      description: "Choose from our premium plans to get monthly coins and access exclusive content",
      color: "purple"
    },
    {
      icon: Zap,
      title: "Interactive Learning",
      description: "Engage with PDF notes, organized chapters, and structured learning paths",
      color: "yellow"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data is safe with our secure authentication and encrypted storage",
      color: "red"
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Learn anywhere, anytime with our fully responsive design across all devices",
      color: "indigo"
    }
  ];

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    indigo: "bg-indigo-100 text-indigo-600"
  };

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Skillur</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the features that make Skillur the perfect platform for your educational journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg mb-6 ${colorClasses[feature.color]}`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
