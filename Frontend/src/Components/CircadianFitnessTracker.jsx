import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import CircadianVisualization from './CircadianVisualization';
import ActivityLog from './DailyLog';

const CircadianFitnessTracker = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logEntry, setLogEntry] = useState({ type: '', time: '', note: '' });
  const [showLogForm, setShowLogForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('schedule');
  const navigate = useNavigate();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/');
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const chronotype = calculateChronotype(data);
          setUserData({ ...data, chronotype });
        } else {
          console.log('No user data found in Firestore');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to convert minutes to time
  const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Calculate chronotype
  const calculateChronotype = (formData) => {
    const { wakeTime, sleepTime, bestTime, wakeDifficulty, mentalWorkTime } = formData;

    const wakeHour = parseInt(wakeTime.split(':')[0], 10);
    const sleepHour = parseInt(sleepTime.split(':')[0], 10);
    const bestHour = parseInt(bestTime.split(':')[0], 10);
    const mentalWorkHour = parseInt(mentalWorkTime.split(':')[0], 10);

    let score = 0;

    if (wakeHour <= 6) score += 2;
    else if (wakeHour <= 8) score += 1;
    else if (wakeHour >= 9) score -= 1;

    if (sleepHour >= 23) score -= 2;
    else if (sleepHour >= 22) score -= 1;
    else if (sleepHour <= 21) score += 1;

    if (bestHour < 12) score += 2;
    else if (bestHour >= 12 && bestHour < 16) score += 1;
    else if (bestHour >= 16) score -= 1;

    if (wakeDifficulty >= 4) score += 1;
    else if (wakeDifficulty <= 2) score -= 1;

    if (mentalWorkHour < 12) score += 1;
    else if (mentalWorkHour >= 12 && mentalWorkHour < 16) score += 0;
    else if (mentalWorkHour >= 16) score -= 1;

    if (score >= 5) return 'Morning Lark';
    if (score <= -5) return 'Night Owl';
    return 'Intermediate Type';
  };

  // Calculate ideal schedule based on circadian rhythm
  const calculateIdealSchedule = () => {
    if (!userData) return null;

    const wakeTime = userData.wakeTime || '07:00';
    const sleepTime = userData.sleepTime || '22:00';
    const bestTime = userData.bestTime || '14:00';

    const wakeMinutes = timeToMinutes(wakeTime);
    const sleepMinutes = timeToMinutes(sleepTime);

    // Breakfast: 30 minutes after waking up
    const breakfastTime = minutesToTime(wakeMinutes + 30);

    // Lunch: 4-5 hours after waking up
    const lunchTime = minutesToTime(wakeMinutes + 4.5 * 60);

    // Dinner: 3 hours before sleep
    const dinnerTime = minutesToTime(sleepMinutes - 180);

    // Workout: 6-8 hours after waking up (mid-afternoon)
    const workoutTime = minutesToTime(wakeMinutes + 7 * 60);

    return {
      wake: wakeTime,
      sleep: sleepTime,
      meals: [
        { type: 'Breakfast', time: breakfastTime, icon: 'Utensils', completed: false },
        { type: 'Lunch', time: lunchTime, icon: 'Utensils', completed: false },
        { type: 'Dinner', time: dinnerTime, icon: 'Utensils', completed: false },
      ],
      workouts: [
        { type: 'Workout', time: workoutTime, icon: 'Dumbbell', completed: false },
      ],
      transitions: [
        { type: 'Wake Up', time: wakeTime, icon: 'Sun', completed: false },
        { type: 'Sleep', time: sleepTime, icon: 'Moon', completed: false },
      ],
    };
  };

  // Handle log entry submission
  const handleLogEntry = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const entryWithTimestamp = {
        ...logEntry,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
      };

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        logEntries: [...(userData.logEntries || []), entryWithTimestamp],
      });

      setUserData((prevUserData) => ({
        ...prevUserData,
        logEntries: [...(prevUserData.logEntries || []), entryWithTimestamp],
      }));

      setShowLogForm(false);
      setLogEntry({ type: '', time: '', note: '' });
    } catch (error) {
      console.error('Error logging entry:', error);
    }
  };

  // Update activity status in Firestore
  const updateActivityStatus = async (activityType, newStatus) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const userRef = doc(db, 'users', user.uid);
      const updatedActivities = userData.activities.map((activity) =>
        activity.type === activityType ? { ...activity, completed: newStatus } : activity
      );

      await updateDoc(userRef, { activities: updatedActivities });
      setUserData({ ...userData, activities: updatedActivities });
    } catch (error) {
      console.error('Error updating activity status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-indigo-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <CircadianVisualization
          userData={userData}
          currentTime={currentTime}
          idealSchedule={calculateIdealSchedule()}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          updateActivityStatus={updateActivityStatus}
        />
        <ActivityLog
          userData={userData}
          showLogForm={showLogForm}
          setShowLogForm={setShowLogForm}
          logEntry={logEntry}
          setLogEntry={setLogEntry}
          handleLogEntry={handleLogEntry}
        />
      </div>
    </div>
  );
};

export default CircadianFitnessTracker;