import React from 'react';

interface LeftDashboardProps {
  isVisible: boolean;
  sidebarVisible: boolean;
}

export const LeftDashboard: React.FC<LeftDashboardProps> = ({ isVisible, sidebarVisible }) => {
  if (!isVisible) return null;

  // Use full width when sidebar is hidden, otherwise use fixed width
  const widthClass = sidebarVisible ? 'w-[28rem]' : 'w-full';

  return (
    <div className={`fixed top-0 left-0 ${widthClass} h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl z-40 overflow-y-auto transition-all duration-300`}>
      <div className={`p-6 space-y-6 ${!sidebarVisible ? 'max-w-6xl mx-auto' : ''}`}>
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
            📊
          </div>
          <h1 className="text-2xl font-bold text-white">StudyFlow</h1>
          <p className="text-slate-300 text-sm">Your Learning Analytics</p>
        </div>

        {/* Stats Cards */}
        <div className={`grid gap-4 ${!sidebarVisible ? 'grid-cols-4' : 'grid-cols-2'}`}>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">847</div>
              <div className="text-xs text-blue-100">Problems Solved</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">94%</div>
              <div className="text-xs text-green-100">Success Rate</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-purple-100">Study Streak</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">4.2h</div>
              <div className="text-xs text-orange-100">Today</div>
            </div>
          </div>
        </div>

        {/* Rest of content in a grid when full width */}
        <div className={`${!sidebarVisible ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}`}>
          {/* Weekly Progress */}
          <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Weekly Progress</h3>
              <span className="text-green-400 text-sm font-medium">+15% from last week</span>
            </div>
            <div className="space-y-3">
              {[
                { day: 'Mon', progress: 85, color: 'bg-blue-500' },
                { day: 'Tue', progress: 92, color: 'bg-green-500' },
                { day: 'Wed', progress: 78, color: 'bg-yellow-500' },
                { day: 'Thu', progress: 96, color: 'bg-purple-500' },
                { day: 'Fri', progress: 88, color: 'bg-pink-500' },
                { day: 'Sat', progress: 74, color: 'bg-indigo-500' },
                { day: 'Sun', progress: 82, color: 'bg-teal-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-slate-300 w-8">{item.day}</span>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400 w-8">{item.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Performance */}
          <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Subject Performance</h3>
            <div className="space-y-4">
              {[
                { subject: 'Algebra', score: 94, icon: '📐', color: 'from-blue-500 to-blue-600' },
                { subject: 'Calculus', score: 87, icon: '∫', color: 'from-green-500 to-green-600' },
                { subject: 'Geometry', score: 91, icon: '△', color: 'from-purple-500 to-purple-600' },
                { subject: 'Statistics', score: 78, icon: '📊', color: 'from-orange-500 to-orange-600' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{item.subject}</span>
                      <span className="text-sm text-slate-300">{item.score}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'Solved quadratic equation', time: '2 min ago', icon: '✅', color: 'text-green-400' },
                { action: 'Completed calculus quiz', time: '15 min ago', icon: '🎯', color: 'text-blue-400' },
                { action: 'Reviewed geometry theorems', time: '1 hour ago', icon: '📚', color: 'text-purple-400' },
                { action: 'Earned "Problem Solver" badge', time: '2 hours ago', icon: '🏆', color: 'text-yellow-400' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 py-2">
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{item.action}</div>
                    <div className="text-slate-400 text-xs">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Goals */}
          <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Goals</h3>
            <div className="space-y-3">
              {[
                { goal: 'Complete 5 algebra problems', progress: 80, completed: 4, total: 5 },
                { goal: 'Study for 2 hours', progress: 70, completed: 84, total: 120 },
                { goal: 'Review calculus notes', progress: 100, completed: 1, total: 1 }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">{item.goal}</span>
                    <span className="text-xs text-slate-400">{item.completed}/{item.total}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                        item.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions - Always full width */}
        <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className={`grid gap-3 ${!sidebarVisible ? 'grid-cols-4' : 'grid-cols-2'}`}>
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-3 rounded-lg text-white font-medium text-sm transition-all duration-200 transform hover:scale-105">
              📝 New Quiz
            </button>
            <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 p-3 rounded-lg text-white font-medium text-sm transition-all duration-200 transform hover:scale-105">
              📊 View Stats
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 p-3 rounded-lg text-white font-medium text-sm transition-all duration-200 transform hover:scale-105">
              🎯 Set Goals
            </button>
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 p-3 rounded-lg text-white font-medium text-sm transition-all duration-200 transform hover:scale-105">
              📚 Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 