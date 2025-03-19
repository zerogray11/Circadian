import React, { useState } from 'react';
import { Moon, Sun, Utensils, Dumbbell, Bed, Activity, Coffee, UtensilsCrossed } from 'lucide-react';

const CircadianTimeline = ({ idealSchedule, currentTime }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Helper function to convert time to minutes
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  };

  // Helper function to format time
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    return `${hour % 12 === 0 ? 12 : hour % 12}:${minutes}${hour >= 12 ? 'PM' : 'AM'}`;
  };

  // Calculate sleep duration
  const calculateDuration = (startTime, endTime) => {
    let startMinutes = timeToMinutes(startTime);
    let endMinutes = timeToMinutes(endTime);
    
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // Add 24 hours if end time is on the next day
    }
    
    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  // Process all activities
  const meals = idealSchedule.meals.map(meal => ({
    ...meal,
    category: 'meal',
    icon: meal.type === 'Breakfast' ? <Coffee /> : meal.type === 'Lunch' ? <Utensils /> : <UtensilsCrossed />,
    timeFormatted: formatTime(meal.time),
    minutes: timeToMinutes(meal.time),
    colorClass: meal.type === 'Breakfast' ? 'from-green-400 to-emerald-500' : 
                meal.type === 'Lunch' ? 'from-amber-400 to-orange-500' : 
                'from-purple-400 to-indigo-500'
  }));

  const workouts = idealSchedule.workouts.map(workout => ({
    ...workout,
    category: 'workout',
    icon: <Dumbbell />,
    timeFormatted: formatTime(workout.time),
    minutes: timeToMinutes(workout.time),
    colorClass: 'from-red-400 to-rose-500'
  }));

  const transitions = idealSchedule.transitions.map(transition => ({
    ...transition,
    category: transition.type === 'Wake Up' ? 'wake' : 'sleep',
    icon: transition.type === 'Wake Up' ? <Sun /> : <Moon />,
    timeFormatted: formatTime(transition.time),
    minutes: timeToMinutes(transition.time),
    colorClass: transition.type === 'Wake Up' ? 'from-amber-300 to-yellow-500' : 'from-blue-600 to-indigo-700'
  }));

  // Calculate current position in the day
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentMinutesTotal = currentHour * 60 + currentMinute;
  const currentTimeFormatted = `${currentHour % 12 === 0 ? 12 : currentHour % 12}:${currentMinute.toString().padStart(2, '0')}${currentHour >= 12 ? 'PM' : 'AM'}`;

  // Calculate sleep period
  const sleepStartMinutes = timeToMinutes(idealSchedule.sleep);
  const sleepEndMinutes = timeToMinutes(idealSchedule.wake);
  const sleepDuration = calculateDuration(idealSchedule.sleep, idealSchedule.wake);

  let sleepPercentage = 0;
  let awakePercentage = 0;
  
  if (sleepEndMinutes > sleepStartMinutes) {
    // Sleep period doesn't cross midnight
    sleepPercentage = ((sleepEndMinutes - sleepStartMinutes) / (24 * 60)) * 100;
    awakePercentage = 100 - sleepPercentage;
  } else {
    // Sleep period crosses midnight
    sleepPercentage = ((24 * 60 - sleepStartMinutes + sleepEndMinutes) / (24 * 60)) * 100;
    awakePercentage = 100 - sleepPercentage;
  }

  // Sort all activities by time
  const allActivities = [...meals, ...workouts, ...transitions].sort((a, b) => {
    return a.minutes - b.minutes;
  });

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-gradient-to-br from-slate-100 to-slate-200 backdrop-blur-md rounded-3xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-600 font-outfit">
          Daily Rhythm
        </h2>
        <p className="text-slate-500 text-sm">Current time: {currentTimeFormatted}</p>
      </div>

      {/* Apple Fitness-inspired Sleep/Awake Ring */}
      <div className="relative w-full h-32 mb-6 flex items-center justify-center">
        <svg className="w-32 h-32" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="awakeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <filter id="metallic-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feSpecularLighting result="specOut" specularExponent="20" lightingColor="#ffffff">
                <fePointLight x="60" y="60" z="160" />
              </feSpecularLighting>
              <feComposite in="specOut" in2="SourceGraphic" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
            </filter>
          </defs>

          {/* Background rings */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle cx="60" cy="60" r="38" fill="none" stroke="#e2e8f0" strokeWidth="12" />

          {/* Sleep progress arc */}
          <circle 
            cx="60" 
            cy="60" 
            r="54" 
            fill="none" 
            stroke="url(#sleepGradient)" 
            strokeWidth="12" 
            strokeDasharray={`${sleepPercentage * 3.39} ${(100 - sleepPercentage) * 3.39}`} 
            strokeDashoffset="84.75" 
            strokeLinecap="round"
            style={{ filter: "url(#metallic-glow)" }}
          />

          {/* Awake progress arc */}
          <circle 
            cx="60" 
            cy="60" 
            r="38" 
            fill="none" 
            stroke="url(#awakeGradient)" 
            strokeWidth="12" 
            strokeDasharray={`${awakePercentage * 2.39} ${(100 - awakePercentage) * 2.39}`} 
            strokeDashoffset="59.75" 
            strokeLinecap="round"
            style={{ filter: "url(#metallic-glow)" }}
          />

          {/* Central icons */}
          <foreignObject x="35" y="35" width="50" height="50">
            <div className="flex items-center justify-center w-full h-full">
              <div className="bg-white p-2 rounded-full shadow-md">
                <Moon className="h-6 w-6 text-black" />
              </div>
            </div>
          </foreignObject>
        </svg>
        
        <div className="ml-4 flex flex-col">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mr-2"></div>
            <span className="text-sm font-medium text-slate-700">Sleep: {sleepDuration}</span>
          </div>
          <div className="flex items-center mt-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 mr-2"></div>
            <span className="text-sm font-medium text-slate-700">Awake: {calculateDuration(idealSchedule.wake, idealSchedule.sleep)}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative h-20 mb-6">
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 to-orange-200 rounded-full transform -translate-y-1/2"></div>
        
        {/* Current time indicator */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full shadow-lg"
          style={{ 
            left: `${(currentMinutesTotal / (24 * 60)) * 100}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="absolute -top-6 -left-7 bg-white px-2 py-1 rounded-lg shadow-md text-xs font-medium">
            {currentTimeFormatted}
          </div>
        </div>

        {/* Activity markers */}
        {allActivities.map((activity, index) => {
          const position = (activity.minutes / (24 * 60)) * 100;
          
          return (
            <div 
              key={`activity-${index}`}
              className="absolute cursor-pointer"
              style={{ 
                left: `${position}%`,
                top: index % 2 === 0 ? '0' : '50%',
                transform: 'translateX(-50%)'
              }}
              onClick={() => setSelectedActivity(activity)}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${activity.colorClass} shadow-lg border-2 border-white`}>
                <div className="text-white">
                  {React.cloneElement(activity.icon, { size: 16 })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity details */}
      {selectedActivity && (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-800">{selectedActivity.type}</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${selectedActivity.colorClass}`}>
              {selectedActivity.category.charAt(0).toUpperCase() + selectedActivity.category.slice(1)}
            </div>
          </div>
          <div className="flex items-center text-slate-600">
            <span className="mr-2">{selectedActivity.timeFormatted}</span>
            {selectedActivity.icon}
          </div>
          {selectedActivity.description && (
            <p className="mt-2 text-sm text-slate-500">{selectedActivity.description}</p>
          )}
        </div>
      )}

      {/* Activity list */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Today's Schedule</h3>
        {allActivities.map((activity, index) => (
          <div 
            key={`list-${index}`}
            className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedActivity(activity)}
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${activity.colorClass} shadow-md mr-3`}>
              <div className="text-white">
                {React.cloneElement(activity.icon, { size: 20 })}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-800">{activity.type}</div>
              <div className="text-sm text-slate-500">{activity.timeFormatted}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CircadianTimeline;