
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Edit, Trash2, Coins, Lock } from 'lucide-react';

export function ChapterManager() {
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    order_index: 0,
    coin_price: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchChapters();
    fetchSubjects();
  }, []);

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select(`
          *,
          subjects (
            name
          )
        `)
        .order('order_index');

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast({
        title: "Error",
        description: "Failed to fetch chapters",
        variant: "destructive",
      });
    }
  };

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const chapterData = {
        ...formData,
        coin_price: formData.coin_price ? parseInt(formData.coin_price) : null
      };

      if (editingChapter) {
        const { error } = await supabase
          .from('chapters')
          .update(chapterData)
          .eq('id', editingChapter.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Chapter updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('chapters')
          .insert([chapterData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Chapter created successfully",
        });
      }

      setFormData({ title: '', description: '', subject_id: '', order_index: 0, coin_price: '' });
      setEditingChapter(null);
      setIsAddDialogOpen(false);
      fetchChapters();
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast({
        title: "Error",
        description: "Failed to save chapter",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (chapterId) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Chapter deleted successfully",
      });
      fetchChapters();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast({
        title: "Error",
        description: "Failed to delete chapter",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (chapter) => {
    setEditingChapter(chapter);
    setFormData({
      title: chapter.title,
      description: chapter.description || '',
      subject_id: chapter.subject_id,
      order_index: chapter.order_index,
      coin_price: chapter.coin_price ? chapter.coin_price.toString() : ''
    });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Chapters</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Chapter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingChapter ? 'Edit Chapter' : 'Add New Chapter'}</DialogTitle>
              <DialogDescription>
                {editingChapter ? 'Update the chapter details.' : 'Create a new chapter within a subject.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Chapter Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                <Label htmlFor="order_index">Order</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="coin_price">Coin Price (Optional)</Label>
                <Input
                  id="coin_price"
                  type="number"
                  value={formData.coin_price}
                  onChange={(e) => setFormData({ ...formData, coin_price: e.target.value })}
                  min="0"
                  placeholder="Leave empty for free access"
                />
                <p className="text-xs text-gray-500 mt-1">Set a coin price to lock this chapter. Students need to spend coins to unlock it.</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingChapter(null);
                  setFormData({ title: '', description: '', subject_id: '', order_index: 0, coin_price: '' });
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingChapter ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((chapter) => (
          <Card key={chapter.id} className={chapter.coin_price ? 'border-yellow-300 bg-yellow-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>{chapter.title}</span>
                  {chapter.coin_price && (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Lock className="h-4 w-4" />
                      <Coins className="h-4 w-4" />
                      <span className="text-sm font-medium">{chapter.coin_price}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(chapter)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(chapter.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Subject: {chapter.subjects?.name} | Order: {chapter.order_index}
                {chapter.coin_price && <span className="text-yellow-600"> | Locked Chapter</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{chapter.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
