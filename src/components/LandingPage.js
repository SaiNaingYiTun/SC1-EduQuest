import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { UserRole } from '../App';
import { GraduationCap, Users, Sword, BookOpen } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';



export function LandingPage({ onRoleSelect }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-30">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1686747517763-f9d694bda04d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwcnBnJTIwbWVkaWV2YWx8ZW58MXx8fHwxNzU5MTY4ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Fantasy RPG Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Sword className="w-12 h-12 text-yellow-400 mr-4" />
            <h1 className="text-6xl font-bold text-white">
              Mini RPG Study Quest
            </h1>
            <BookOpen className="w-12 h-12 text-yellow-400 ml-4" />
          </div>
          <p className="text-xl text-gray-200 max-w-3xl">
            Embark on an epic learning adventure! Transform your education into an exciting RPG experience where knowledge is power and quests await.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Student Card */}
          <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Student</h2>
              <p className="text-gray-200 mb-6">
                Level up your knowledge, complete quests, earn XP, and compete with friends in an epic learning adventure!
              </p>
              <ul className="text-left text-gray-200 mb-8 space-y-2">
                <li>• Create your character avatar</li>
                <li>• Complete educational quests</li>
                <li>• Earn XP and level up</li>
                <li>• Compete on leaderboards</li>
                <li>• Unlock achievements</li>
              </ul>
              <Button 
                onClick={() => onRoleSelect('student')}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Start Your Quest
              </Button>
            </div>
          </Card>

          {/* Teacher Card */}
          <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Teacher</h2>
              <p className="text-gray-200 mb-6">
                Create engaging quests, monitor student progress, and make learning an epic adventure for your students!
              </p>
              <ul className="text-left text-gray-200 mb-8 space-y-2">
                <li>• Design custom quests</li>
                <li>• Create quiz content</li>
                <li>• Monitor student progress</li>
                <li>• Track class performance</li>
                <li>• Gamify your curriculum</li>
              </ul>
              <Button 
                onClick={() => onRoleSelect('teacher')}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Create Quests
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-300">
            Join thousands of students and teachers already on their learning quest!
          </p>
        </div>
      </div>
    </div>
  );
}