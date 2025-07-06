import { Code, Coffee, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function DevelopersSection() {
  const developers = [
    {
      name: "Owner Zenuxs",
      role: "Full Stack Developer",
      description: "Passionate about creating seamless learning experiences with modern web technologies.",
      image: "/placeholder.svg",
      skills: ["React", "Node.js", "TypeScript", "Supabase", "Figma"]
    },
    {
      name: "Vivekanand Singh", 
      role: "Designer",
      description: "Focused on creating intuitive and beautiful designs that enhance the looks of website.",
      image: "/placeholder.svg",
      skills: ["Designs", "User Research", "Prototyping", "Poster", "Logo"]
    },
    {
      name: "Rudraksh Chauhan",
      role: "Content Finder",
      description: "Helped in contents.",
      image: "/placeholder.svg",
      skills: ["Content", "Notes"]
    }
  ];

  return (
    <section id="developers" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The passionate developers behind Skillur, dedicated to revolutionizing education through technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {developers.map((developer, index) => (
            <Card key={index} className="bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                    <Code className="h-10 w-10 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold">{developer.name}</CardTitle>
                <CardDescription className="text-blue-600 font-medium">{developer.role}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">{developer.description}</p>
                
                <div className="flex flex-wrap justify-center gap-2">
                  {developer.skills.map((skill, skillIndex) => (
                    <span 
                      key={skillIndex}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Stats */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Coffee className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">48+</div>
                <div className="text-gray-600">Hours of Code</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">10k+</div>
                <div className="text-gray-600">Lines of Code</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-red-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-gray-600">Made with Love</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
