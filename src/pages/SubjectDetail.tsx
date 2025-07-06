
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Calculator, Beaker, Zap, Leaf, Globe, Monitor } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

interface Chapter {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  order_index: number;
}

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [subject, setSubject] = useState<{ id: string; name: string; description: string; icon: string } | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubject();
    fetchChapters();
  }, [id]);

  const fetchSubject = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSubject(data);
    } catch (error) {
      console.error('Error fetching subject:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('subject_id', id)
        .order('order_index');

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading subject and chapters...</div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Subject not found.</div>
        </div>
      </div>
    );
  }

  const Icon = getIcon(subject.icon || 'BookOpen');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/subjects">
          <Button variant="outline" className="mb-8 flex items-center gap-2">
            ← Back to Subjects
          </Button>
        </Link>

        {/* Subject Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Icon className="h-8 w-8 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
              {subject.description && (
                <p className="text-gray-600 mt-2">{subject.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Chapters</h2>
          
          {chapters.length > 0 ? (
            <div className="space-y-4">
              {chapters.map((chapter, index) => (
                <Link key={chapter.id} to={`/subjects/${id}/chapters/${chapter.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center font-semibold text-gray-700">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{chapter.title}</h3>
                          {chapter.description && (
                            <p className="text-gray-600 mt-1">{chapter.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters available</h3>
              <p className="text-gray-600">Chapters will be added by administrators soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
