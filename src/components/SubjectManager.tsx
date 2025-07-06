import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Edit, Trash2, Calculator, Beaker, Zap, Leaf, Globe, Monitor } from 'lucide-react';

interface SubjectManagerProps {
  selectedClass: string;
}

export function SubjectManager({ selectedClass }: SubjectManagerProps) {
  const [subjects, setSubjects] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'BookOpen',
    class: selectedClass
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
  }, [selectedClass]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, class: selectedClass }));
  }, [selectedClass]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('class', selectedClass)
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const subjectData = {
        ...formData,
        class: selectedClass
      };

      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update(subjectData)
          .eq('id', editingSubject.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert([subjectData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Subject created successfully",
        });
      }

      setFormData({ name: '', description: '', color: '#3B82F6', icon: 'BookOpen', class: selectedClass });
      setEditingSubject(null);
      setIsAddDialogOpen(false);
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast({
        title: "Error",
        description: "Failed to save subject",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (subjectId) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      color: subject.color || '#3B82F6',
      icon: subject.icon || 'BookOpen',
      class: subject.class || selectedClass
    });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Subjects - Class {selectedClass}</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
              <DialogDescription>
                {editingSubject ? 'Update the subject details.' : `Create a new subject for Class ${selectedClass}.`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon Name</Label>
                <select
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="BookOpen">Book Open</option>
                  <option value="Calculator">Calculator</option>
                  <option value="Beaker">Beaker</option>
                  <option value="Zap">Zap</option>
                  <option value="Leaf">Leaf</option>
                  <option value="Globe">Globe</option>
                  <option value="Monitor">Monitor</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingSubject(null);
                  setFormData({ name: '', description: '', color: '#3B82F6', icon: 'BookOpen', class: selectedClass });
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSubject ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => {
          const Icon = getIcon(subject.icon);
          return (
            <Card key={subject.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" style={{ color: subject.color }} />
                    <span>{subject.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(subject)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(subject.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {subject.description}
                  <div className="text-xs text-gray-500 mt-1">Class {subject.class}</div>
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}