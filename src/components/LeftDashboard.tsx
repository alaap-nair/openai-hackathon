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
    <div className={`fixed top-0 left-0 ${widthClass} h-full bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 overflow-y-auto transition-all duration-300`}>
      <div className={`p-8 space-y-8 ${!sidebarVisible ? 'max-w-7xl mx-auto' : ''}`}>
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-3xl font-bold shadow-2xl backdrop-blur-xl">
            📊
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">StudyFlow</h1>
            <p className="text-gray-600 text-lg">Your Learning Analytics</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid gap-6 ${!sidebarVisible ? 'grid-cols-4' : 'grid-cols-2'}`}>
          <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-1">847</div>
              <div className="text-sm text-gray-600 font-medium">Problems Solved</div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-1">94%</div>
              <div className="text-sm text-gray-600 font-medium">Success Rate</div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-1">12</div>
              <div className="text-sm text-gray-600 font-medium">Study Streak</div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-1">4.2h</div>
              <div className="text-sm text-gray-600 font-medium">Today</div>
            </div>
          </div>
        </div>

        {/* Rest of content in a grid when full width */}
        <div className={`${!sidebarVisible ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : 'space-y-8'}`}>
          {/* Weekly Progress */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Weekly Progress</h3>
              <span className="bg-green-500/20 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border border-green-200">+15% from last week</span>
            </div>
            <div className="space-y-4">
              {[
                { day: 'Mon', progress: 85, color: 'bg-gradient-to-r from-blue-400 to-blue-500' },
                { day: 'Tue', progress: 92, color: 'bg-gradient-to-r from-green-400 to-green-500' },
                { day: 'Wed', progress: 78, color: 'bg-gradient-to-r from-yellow-400 to-yellow-500' },
                { day: 'Thu', progress: 96, color: 'bg-gradient-to-r from-purple-400 to-purple-500' },
                { day: 'Fri', progress: 88, color: 'bg-gradient-to-r from-pink-400 to-pink-500' },
                { day: 'Sat', progress: 74, color: 'bg-gradient-to-r from-indigo-400 to-indigo-500' },
                { day: 'Sun', progress: 82, color: 'bg-gradient-to-r from-teal-400 to-teal-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <span className="text-sm font-semibold text-gray-700 w-10">{item.day}</span>
                  <div className="flex-1 bg-gray-200/50 rounded-full h-3 backdrop-blur-sm">
                    <div 
                      className={`h-3 rounded-full ${item.color} transition-all duration-1000 ease-out shadow-lg`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-10">{item.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Performance */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Subject Performance</h3>
            <div className="space-y-6">
              {[
                { subject: 'Algebra', score: 94, icon: '📐', color: 'from-blue-400 to-blue-500' },
                { subject: 'Calculus', score: 87, icon: '∫', color: 'from-green-400 to-green-500' },
                { subject: 'Geometry', score: 91, icon: '△', color: 'from-purple-400 to-purple-500' },
                { subject: 'Statistics', score: 78, icon: '📊', color: 'from-orange-400 to-orange-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-800 font-semibold">{item.subject}</span>
                      <span className="text-sm text-gray-600 font-medium">{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-2 backdrop-blur-sm">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out shadow-sm`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: 'Solved quadratic equation', time: '2 min ago', icon: '✅', color: 'text-green-600' },
                { action: 'Completed calculus quiz', time: '15 min ago', icon: '🎯', color: 'text-blue-600' },
                { action: 'Reviewed geometry theorems', time: '1 hour ago', icon: '📚', color: 'text-purple-600' },
                { action: 'Earned "Problem Solver" badge', time: '2 hours ago', icon: '🏆', color: 'text-yellow-600' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 backdrop-blur-sm bg-white/20 rounded-2xl border border-white/10 hover:bg-white/30 transition-all duration-200">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium">{item.action}</div>
                    <div className="text-gray-500 text-sm">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Goals */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Today's Goals</h3>
            <div className="space-y-6">
              {[
                { goal: 'Complete 5 algebra problems', progress: 80, completed: 4, total: 5 },
                { goal: 'Study for 2 hours', progress: 70, completed: 84, total: 120 },
                { goal: 'Review calculus notes', progress: 100, completed: 1, total: 1 }
              ].map((item, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-medium">{item.goal}</span>
                    <span className="text-sm text-gray-600 font-medium bg-gray-100/50 px-3 py-1 rounded-full backdrop-blur-sm">{item.completed}/{item.total}</span>
                  </div>
                  <div className="w-full bg-gray-200/50 rounded-full h-3 backdrop-blur-sm">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ease-out shadow-sm ${
                        item.progress === 100 
                          ? 'bg-gradient-to-r from-green-400 to-green-500' 
                          : 'bg-gradient-to-r from-blue-400 to-blue-500'
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
        <div className="backdrop-blur-xl bg-white/40 border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
          <div className={`grid gap-4 ${!sidebarVisible ? 'grid-cols-4' : 'grid-cols-2'}`}>
            <button className="backdrop-blur-xl bg-gradient-to-r from-blue-500/80 to-blue-600/80 hover:from-blue-600/90 hover:to-blue-700/90 border border-blue-300/30 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">
              📝 New Quiz
            </button>
            <button className="backdrop-blur-xl bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-600/90 hover:to-green-700/90 border border-green-300/30 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">
              📊 View Stats
            </button>
            <button className="backdrop-blur-xl bg-gradient-to-r from-purple-500/80 to-purple-600/80 hover:from-purple-600/90 hover:to-purple-700/90 border border-purple-300/30 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">
              🎯 Set Goals
            </button>
            <button className="backdrop-blur-xl bg-gradient-to-r from-orange-500/80 to-orange-600/80 hover:from-orange-600/90 hover:to-orange-700/90 border border-orange-300/30 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg">
              📚 Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 