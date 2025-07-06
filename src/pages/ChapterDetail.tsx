import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, FileText, Download, Lock, Coins } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { ChapterUnlockModal } from '@/components/ChapterUnlockModal';

interface Chapter {
  id: string;
  title: string;
  description: string;
  order_index: number;
  subject_id: string;
  coin_price: number | null;
}

interface Subject {
  id: string;
  name: string;
  description: string;
}

interface CardData {
  id: string;
  title: string;
  description: string | null;
  page_number: number | null;
  pdf_url: string | null;
  order_index: number;
}

export default function ChapterDetail() {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    console.log('ChapterDetail useEffect triggered');
    console.log('authLoading:', authLoading);
    console.log('user:', user);
    console.log('subjectId:', subjectId);
    console.log('chapterId:', chapterId);

    if (authLoading) {
      console.log('Still loading auth, waiting...');
      return;
    }
    
    if (!user) {
      console.log('No user found, redirecting to auth');
      navigate('/auth');
      return;
    }

    if (subjectId && chapterId) {
      console.log('Both IDs present, fetching chapter data');
      fetchChapterData();
    }
  }, [subjectId, chapterId, user, authLoading, navigate]);

  const checkChapterAccess = async (chapterData: Chapter) => {
    if (!chapterData.coin_price || !user) {
      setIsUnlocked(true);
      return;
    }

    // Check if user has already unlocked this chapter
    const { data: progressData, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterData.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking chapter access:', error);
    }

    setIsUnlocked(!!progressData);
  };

  const fetchChapterData = async () => {
    console.log('Starting fetchChapterData');
    try {
      // Fetch chapter details
      console.log('Fetching chapter with ID:', chapterId);
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .single();

      if (chapterError) {
        console.error('Chapter fetch error:', chapterError);
        throw chapterError;
      }
      console.log('Chapter data fetched:', chapterData);
      setChapter(chapterData);

      // Check if chapter is unlocked
      await checkChapterAccess(chapterData);

      // Fetch subject details
      console.log('Fetching subject with ID:', subjectId);
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();

      if (subjectError) {
        console.error('Subject fetch error:', subjectError);
        throw subjectError;
      }
      console.log('Subject data fetched:', subjectData);
      setSubject(subjectData);

      // Only fetch cards if chapter is unlocked
      if (isUnlocked || !chapterData.coin_price) {
        console.log('Fetching cards for chapter ID:', chapterId);
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('id, title, description, page_number, pdf_url, order_index')
          .eq('chapter_id', chapterId)
          .order('order_index');

        if (cardsError) {
          console.error('Cards fetch error:', cardsError);
          throw cardsError;
        }
        console.log('Cards data fetched:', cardsData);
        setCards(cardsData || []);
      }
    } catch (error) {
      console.error('Error fetching chapter details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    console.log('Handle unlock called');
    // Re-check chapter access and fetch updated data
    if (chapter) {
      await checkChapterAccess(chapter);
      
      // Fetch cards if now unlocked
      if (isUnlocked || !chapter.coin_price) {
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('id, title, description, page_number, pdf_url, order_index')
          .eq('chapter_id', chapter.id)
          .order('order_index');

        if (!cardsError) {
          setCards(cardsData || []);
        }
      }
    }
    
    // Force a page refresh to get updated profile data
    window.location.reload();
  };

  const canAffordChapter = chapter?.coin_price && profile && profile.coins >= chapter.coin_price;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading chapter details...</div>
        </div>
      </div>
    );
  }

  if (!chapter || !subject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Chapter not found</h1>
            <Button onClick={() => navigate(`/subjects/${subjectId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subject
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/subjects/${subjectId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {subject?.name || 'Subject'}
        </Button>

        {/* Chapter Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100">
              {chapter?.coin_price && !isUnlocked ? (
                <Lock className="h-8 w-8 text-yellow-600" />
              ) : (
                <FileText className="h-8 w-8 text-black" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">{chapter?.title}</h1>
                {chapter?.coin_price && (
                  <div className="flex items-center space-x-1 text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                    <Coins className="h-4 w-4" />
                    <span className="text-sm font-medium">{chapter.coin_price}</span>
                  </div>
                )}
              </div>
              <p className="text-lg text-gray-600 mt-2">{subject?.name}</p>
              {chapter?.description && (
                <p className="text-gray-600 mt-2">{chapter.description}</p>
              )}
            </div>
          </div>

          {chapter?.coin_price && !isUnlocked && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">This chapter is locked</span>
                </div>
                {canAffordChapter && (
                  <Button 
                    onClick={() => setShowUnlockModal(true)}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Unlock for {chapter.coin_price} coins
                  </Button>
                )}
                {!canAffordChapter && profile && profile.coins < (chapter.coin_price || 0) && (
                  <div className="text-red-600 text-sm">
                    Need {(chapter.coin_price || 0) - profile.coins} more coins
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cards */}
        {isUnlocked || !chapter?.coin_price ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Study Cards</h2>
            
            {cards.length > 0 ? (
              <div className="grid gap-4">
                {cards.map((card) => (
                  <Card key={card.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{card.title}</span>
                        {card.page_number && (
                          <span className="text-sm text-gray-500">Page {card.page_number}</span>
                        )}
                      </CardTitle>
                      {card.description && (
                        <CardDescription className="text-gray-700">
                          {card.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    {card.pdf_url && (
                      <CardContent>
                        <a 
                          href={card.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </a>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cards available</h3>
                <p className="text-gray-600">Study cards for this chapter will be added soon.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chapter Locked</h3>
            <p className="text-gray-600">Unlock this chapter to access the study materials.</p>
          </div>
        )}
      </div>

      {chapter && canAffordChapter && (
        <ChapterUnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          chapter={{
            id: chapter.id,
            title: chapter.title,
            coin_price: chapter.coin_price || 0,
            subject_id: subjectId
          }}
          onUnlock={handleUnlock}
        />
      )}
    </div>
  );
}
