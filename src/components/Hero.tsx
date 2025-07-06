
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Award, Zap } from 'lucide-react';

export function Hero() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      if (profile?.is_admin) {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse transform -translate-x-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
            Welcome to <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">Skillur</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Your digital learning companion for mastering subjects like Maths, Chemistry, Physics, Biology, Hindi, Bengali, and Computer Science.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button onClick={handleGetStarted} size="lg" className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-3">
              {user ? (profile?.is_admin ? 'Go to Admin' : 'Continue Learning') : 'Get Started'}
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById('subjects')?.scrollIntoView({ behavior: 'smooth' })} className="text-lg px-8 py-3 border-black text-black hover:bg-yellow-50">
              Explore Subjects
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-3">
                <BookOpen className="h-6 w-6 text-black" />
              </div>
              <div className="text-2xl font-bold text-black">7</div>
              <div className="text-gray-600">Subjects</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-3">
                <Users className="h-6 w-6 text-black" />
              </div>
              <div className="text-2xl font-bold text-black">1000+</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-3">
                <Award className="h-6 w-6 text-black" />
              </div>
              <div className="text-2xl font-bold text-black">500+</div>
              <div className="text-gray-600">Chapters</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-3">
                <Zap className="h-6 w-6 text-black" />
              </div>
              <div className="text-2xl font-bold text-black">24/7</div>
              <div className="text-gray-600">Access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
