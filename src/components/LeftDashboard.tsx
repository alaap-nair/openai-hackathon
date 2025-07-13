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
    <div className={`fixed top-0 left-0 ${widthClass} h-full overflow-y-auto transition-all duration-500 ease-out`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 backdrop-blur-3xl bg-black/10"></div>
      </div>

      {/* Content */}
      <div className={`relative z-10 p-8 space-y-8 ${!sidebarVisible ? 'max-w-7xl mx-auto' : ''}`}>
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-4xl font-bold shadow-2xl backdrop-blur-xl border border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <span className="relative z-10">📊</span>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl -z-10"></div>
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
              StudyFlow
            </h1>
            <p className="text-white/70 text-xl font-medium">Your Learning Analytics</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid gap-6 ${!sidebarVisible ? 'grid-cols-4' : 'grid-cols-2'}`}>
          {[
            { value: '847', label: 'Problems Solved', gradient: 'from-blue-400/80 to-cyan-400/80', glow: 'blue' },
            { value: '94%', label: 'Success Rate', gradient: 'from-emerald-400/80 to-green-400/80', glow: 'emerald' },
            { value: '12', label: 'Study Streak', gradient: 'from-purple-400/80 to-pink-400/80', glow: 'purple' },
            { value: '4.2h', label: 'Today', gradient: 'from-orange-400/80 to-yellow-400/80', glow: 'orange' }
          ].map((item, index) => (
            <div key={index} className="group relative">
              <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500`}></div>
              <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:bg-white/15">
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-2">{item.value}</div>
                  <div className="text-sm text-white/60 font-semibold uppercase tracking-wider">{item.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rest of content in a grid when full width */}
        <div className={`${!sidebarVisible ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : 'space-y-8'}`}>
          {/* Weekly Progress */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Weekly Progress</h3>
                <div className="bg-emerald-500/20 backdrop-blur-xl text-emerald-300 px-4 py-2 rounded-full text-sm font-bold border border-emerald-400/30">
                  +15% ↗
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { day: 'Mon', progress: 85, color: 'from-blue-400 to-blue-500', shadow: 'shadow-blue-500/50' },
                  { day: 'Tue', progress: 92, color: 'from-emerald-400 to-emerald-500', shadow: 'shadow-emerald-500/50' },
                  { day: 'Wed', progress: 78, color: 'from-yellow-400 to-yellow-500', shadow: 'shadow-yellow-500/50' },
                  { day: 'Thu', progress: 96, color: 'from-purple-400 to-purple-500', shadow: 'shadow-purple-500/50' },
                  { day: 'Fri', progress: 88, color: 'from-pink-400 to-pink-500', shadow: 'shadow-pink-500/50' },
                  { day: 'Sat', progress: 74, color: 'from-indigo-400 to-indigo-500', shadow: 'shadow-indigo-500/50' },
                  { day: 'Sun', progress: 82, color: 'from-teal-400 to-teal-500', shadow: 'shadow-teal-500/50' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <span className="text-white/80 font-bold w-12 text-right">{item.day}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-4 backdrop-blur-sm border border-white/20 overflow-hidden">
                      <div 
                        className={`h-4 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out ${item.shadow} shadow-lg`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-white/60 font-bold w-12">{item.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Performance */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/40 to-pink-400/40 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <h3 className="text-2xl font-bold text-white mb-8">Subject Performance</h3>
              <div className="space-y-6">
                {[
                  { subject: 'Algebra', score: 94, icon: '📐', color: 'from-blue-400 to-blue-500', shadow: 'shadow-blue-500/50' },
                  { subject: 'Calculus', score: 87, icon: '∫', color: 'from-emerald-400 to-emerald-500', shadow: 'shadow-emerald-500/50' },
                  { subject: 'Geometry', score: 91, icon: '△', color: 'from-purple-400 to-purple-500', shadow: 'shadow-purple-500/50' },
                  { subject: 'Statistics', score: 78, icon: '📊', color: 'from-orange-400 to-orange-500', shadow: 'shadow-orange-500/50' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl ${item.shadow} border border-white/20`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white font-bold text-lg">{item.subject}</span>
                        <span className="text-white/80 font-bold">{item.score}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm border border-white/20 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out ${item.shadow} shadow-lg`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/40 to-blue-400/40 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <h3 className="text-2xl font-bold text-white mb-8">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { action: 'Solved quadratic equation', time: '2 min ago', icon: '✅', color: 'emerald' },
                  { action: 'Completed calculus quiz', time: '15 min ago', icon: '🎯', color: 'blue' },
                  { action: 'Reviewed geometry theorems', time: '1 hour ago', icon: '📚', color: 'purple' },
                  { action: 'Earned "Problem Solver" badge', time: '2 hours ago', icon: '🏆', color: 'yellow' }
                ].map((item, index) => (
                  <div key={index} className="relative group/item">
                    <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur opacity-0 group-hover/item:opacity-100 transition duration-300"></div>
                    <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 flex items-center space-x-4">
                      <span className="text-3xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="text-white font-semibold">{item.action}</div>
                        <div className="text-white/50 text-sm">{item.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Study Goals */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/40 to-pink-400/40 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <h3 className="text-2xl font-bold text-white mb-8">Today's Goals</h3>
              <div className="space-y-6">
                {[
                  { goal: 'Complete 5 algebra problems', progress: 80, completed: 4, total: 5 },
                  { goal: 'Study for 2 hours', progress: 70, completed: 84, total: 120 },
                  { goal: 'Review calculus notes', progress: 100, completed: 1, total: 1 }
                ].map((item, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">{item.goal}</span>
                      <div className="bg-white/10 backdrop-blur-xl px-3 py-1 rounded-full border border-white/20">
                        <span className="text-white/80 font-bold text-sm">{item.completed}/{item.total}</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm border border-white/20 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ease-out shadow-lg ${
                          item.progress === 100 
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-emerald-500/50' 
                            : 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-blue-500/50'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Always full width */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/40 via-purple-400/40 to-pink-400/40 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <h3 className="text-2xl font-bold text-white mb-8">Quick Actions</h3>
            <div className={`grid gap-6 ${!sidebarVisible ? 'grid-cols-4' : 'grid-cols-2'}`}>
              {[
                { label: '📝 New Quiz', gradient: 'from-blue-500/80 to-blue-600/80', shadow: 'shadow-blue-500/50' },
                { label: '📊 View Stats', gradient: 'from-emerald-500/80 to-emerald-600/80', shadow: 'shadow-emerald-500/50' },
                { label: '🎯 Set Goals', gradient: 'from-purple-500/80 to-purple-600/80', shadow: 'shadow-purple-500/50' },
                { label: '📚 Resources', gradient: 'from-orange-500/80 to-orange-600/80', shadow: 'shadow-orange-500/50' }
              ].map((item, index) => (
                <button key={index} className="group/btn relative">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur opacity-40 group-hover/btn:opacity-80 transition duration-300`}></div>
                  <div className={`relative backdrop-blur-2xl bg-gradient-to-r ${item.gradient} border border-white/20 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${item.shadow} shadow-xl hover:shadow-2xl`}>
                    {item.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 