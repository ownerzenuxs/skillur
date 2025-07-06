
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Coins, Lock } from 'lucide-react';

interface ChapterUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: {
    id: string;
    title: string;
    coin_price: number;
    subject_id?: string;
  };
  onUnlock: () => void;
}

export function ChapterUnlockModal({ isOpen, onClose, chapter, onUnlock }: ChapterUnlockModalProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const handleUnlock = async () => {
    if (!user || !profile) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to unlock chapters.",
        variant: "destructive",
      });
      return;
    }

    if (profile.coins < chapter.coin_price) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${chapter.coin_price} coins but only have ${profile.coins} coins.`,
        variant: "destructive",
      });
      return;
    }

    setIsUnlocking(true);
    try {
      console.log('Starting chapter unlock process for chapter:', chapter.id);
      console.log('Subject ID:', chapter.subject_id);
      console.log('User coins before:', profile.coins);
      console.log('Chapter price:', chapter.coin_price);

      // Check if chapter is already unlocked
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('chapter_id', chapter.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing progress:', checkError);
        throw new Error('Failed to check chapter access');
      }

      if (existingProgress) {
        toast({
          title: "Already Unlocked",
          description: "This chapter is already unlocked.",
        });
        onUnlock();
        onClose();
        return;
      }

      // Start transaction - first record the progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          chapter_id: chapter.id,
          subject_id: chapter.subject_id || '',
        });

      if (progressError) {
        console.error('Progress insert error:', progressError);
        throw new Error('Failed to record chapter access');
      }

      console.log('Progress recorded successfully');

      // Then deduct coins
      const newCoins = profile.coins - chapter.coin_price;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        // If coin deduction fails, remove the progress record
        await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('chapter_id', chapter.id);
        
        throw new Error('Failed to deduct coins');
      }

      console.log('Coins deducted successfully, new balance:', newCoins);

      toast({
        title: "Chapter Unlocked!",
        description: `You've successfully unlocked "${chapter.title}" for ${chapter.coin_price} coins.`,
      });

      onUnlock();
      onClose();
    } catch (error) {
      console.error('Error unlocking chapter:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unlock chapter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const canAfford = (profile?.coins || 0) >= chapter.coin_price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-yellow-600" />
            <span>Unlock Chapter</span>
          </DialogTitle>
          <DialogDescription>
            This chapter requires coins to access.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">{chapter.title}</h3>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span className="text-lg font-bold text-yellow-600">{chapter.coin_price} coins</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span>Your current coins:</span>
              <div className="flex items-center space-x-1">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold">{profile?.coins || 0}</span>
              </div>
            </div>
            {canAfford && (
              <div className="flex justify-between items-center mt-2">
                <span>After purchase:</span>
                <div className="flex items-center space-x-1">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold">
                    {(profile?.coins || 0) - chapter.coin_price}
                  </span>
                </div>
              </div>
            )}
            {!canAfford && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                You need {chapter.coin_price - (profile?.coins || 0)} more coins to unlock this chapter.
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUnlock} 
              disabled={isUnlocking || !canAfford}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
            >
              {isUnlocking ? 'Unlocking...' : 'Unlock Chapter'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
