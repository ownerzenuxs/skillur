
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
import { FileText, Plus, Edit, Trash2, Upload } from 'lucide-react';

export function CardManager() {
  const [cards, setCards] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    chapter_id: '',
    order_index: 0,
    page_number: null,
    pdf_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCards();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchChaptersBySubject(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select(`
          *,
          chapters (
            title,
            subjects (
              name
            )
          )
        `)
        .order('order_index');

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cards",
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

  const fetchChaptersBySubject = async (subjectId) => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index');

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const cardData = {
        ...formData,
        title: formData.title || `Card ${formData.order_index + 1}`,
        page_number: formData.page_number ? parseInt(formData.page_number) : null
      };

      if (editingCard) {
        const { error } = await supabase
          .from('cards')
          .update(cardData)
          .eq('id', editingCard.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Card updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('cards')
          .insert([cardData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Card created successfully",
        });
      }

      setFormData({ title: '', description: '', chapter_id: '', order_index: 0, page_number: null, pdf_url: '' });
      setEditingCard(null);
      setIsAddDialogOpen(false);
      setSelectedSubject('');
      fetchCards();
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        title: "Error",
        description: "Failed to save card",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Card deleted successfully",
      });
      fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: "Error",
        description: "Failed to delete card",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      title: card.title || '',
      description: card.description || '',
      chapter_id: card.chapter_id,
      order_index: card.order_index,
      page_number: card.page_number,
      pdf_url: card.pdf_url || ''
    });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Cards</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCard ? 'Edit Card' : 'Add New Card'}</DialogTitle>
              <DialogDescription>
                {editingCard ? 'Update the card details.' : 'Create a new learning card for a chapter.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject first" />
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
                <Label htmlFor="chapter">Chapter</Label>
                <Select value={formData.chapter_id} onValueChange={(value) => setFormData({ ...formData, chapter_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={chapter.id}>
                        {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Card Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter card title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter card description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="page_number">Page Number</Label>
                  <Input
                    id="page_number"
                    type="number"
                    value={formData.page_number || ''}
                    onChange={(e) => setFormData({ ...formData, page_number: e.target.value })}
                    min="1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pdf_url">PDF URL</Label>
                <Input
                  id="pdf_url"
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingCard(null);
                  setSelectedSubject('');
                  setFormData({ title: '', description: '', chapter_id: '', order_index: 0, page_number: null, pdf_url: '' });
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCard ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span className="truncate">{card.title}</span>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(card)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(card.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {card.chapters?.subjects?.name} - {card.chapters?.title}
                {card.page_number && ` | Page ${card.page_number}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {card.description && (
                <p className="text-sm text-gray-600 mb-2">{card.description}</p>
              )}
              {card.pdf_url && (
                <div className="mt-2">
                  <a 
                    href={card.pdf_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    View PDF
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
