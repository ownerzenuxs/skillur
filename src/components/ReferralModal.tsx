
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy } from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (profile?.scs_number) {
      const link = `https://skillur.netlify.app/auth?ref=${profile.scs_number}`;
      setReferralLink(link);
    }
  }, [profile?.scs_number]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral Link Copied!",
      description: "Share this link with friends to earn coins when they sign up.",
    });
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Skillur with my referral link!',
          text: 'Join me on Skillur and start your learning journey!',
          url: referralLink,
        });
      } catch (error) {
        // If sharing fails, fallback to copy
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-yellow-200">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900">
            <Share2 className="h-5 w-5 text-yellow-500" />
            <span>Your Referral Link</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Share this link with friends and earn 1 coin for every 2 friends who sign up!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600 mb-2">
              Current referrals: <span className="font-medium text-gray-900">{profile?.referral_count || 0}</span>
            </p>
            <p className="text-sm text-gray-600">
              Next coin at: <span className="font-medium text-gray-900">{Math.ceil((profile?.referral_count || 0) / 2) * 2}</span> referrals
            </p>
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900"
            />
            <Button 
              onClick={copyReferralLink} 
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
              size="sm"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={shareReferralLink}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
