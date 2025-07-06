
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Calculator, Beaker, Zap, Leaf, BookOpen, Globe, Monitor } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export function SubjectsSection() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons = {
      BookOpen,
      Calculator,
      Beaker,
      Zap,
      Leaf,
      Globe,
      Monitor,
    };
    return icons[iconName as keyof typeof icons] || BookOpen;
  };

  if (loading) {
    return (
      <section id="subjects" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading subjects...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="subjects" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Explore <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">Subjects</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our comprehensive collection of subjects and start your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject) => {
            const Icon = getIcon(subject.icon || 'BookOpen');
            
            return (
              <Link key={subject.id} to={`/subjects/${subject.id}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 hover:border-yellow-300 border-yellow-200">
                  <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-yellow-100">
                      <Icon className="h-8 w-8 text-black" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-black">{subject.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-center">
                      {subject.description || `Master the fundamentals of ${subject.name}`}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">No subjects available</h3>
            <p className="text-gray-600">Subjects will be added by administrators soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
