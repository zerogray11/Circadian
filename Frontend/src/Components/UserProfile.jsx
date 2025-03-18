import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, signOut } from './firebase';
import { User, Moon, Sun, Activity, Target, Clock, Brain, Scale, Ruler, Calendar, Edit, Check, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    activityLevel: 'sedentary',
    fitnessGoal: 'weightLoss',
    sleepTime: '',
    wakeTime: '',
    bestTime: '',
    wakeDifficulty: '',
    mentalWorkTime: '',
  });

  const navigate = useNavigate();

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12HourFormat = (time) => {
    if (!time) return 'Not set';
    
    try {
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours, 10);

      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Convert 0 to 12 for AM

      return `${hours}:${minutes} ${period}`;
    } catch (e) {
      return time;
    }
  };

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/'); // Redirect to AuthPage if not authenticated
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setFormData(data); // Pre-fill form data
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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save updated data to Firestore
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, formData);

      setUserData(formData); // Update local state
      setEditMode(false); // Exit edit mode
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    setFormData(userData); // Reset form data
    setEditMode(false); // Exit edit mode
  };

  // Handle sign-out
  const handleSignOut = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate('/'); // Redirect to AuthPage (login page)
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out.');
    }
  };

  // Helper function to format activity level
  const formatActivityLevel = (level) => {
    switch(level) {
      case 'sedentary': return 'Sedentary';
      case 'lightlyActive': return 'Lightly Active';
      case 'moderatelyActive': return 'Moderately Active';
      case 'veryActive': return 'Very Active';
      default: return level;
    }
  };

  // Helper function to format fitness goal
  const formatFitnessGoal = (goal) => {
    switch(goal) {
      case 'weightLoss': return 'Weight Loss';
      case 'muscleGain': return 'Muscle Gain';
      case 'generalWellness': return 'General Wellness';
      default: return goal;
    }
  };

  // Render editable fields
  const renderEditableField = (label, name, type = 'text') => (
    <div className="flex items-center gap-3">
      <label className="w-24 text-sm text-gray-500">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
      />
    </div>
  );

  // Profile cards configuration
  const profileCards = userData ? [
    {
      title: 'Personal',
      icon: <User className="w-6 h-6 text-indigo-700" />,
      color: 'bg-indigo-50',
      borderColor: 'border-indigo-300',
      items: [
        { label: 'Name', value: userData.name || 'Not set', icon: <User className="w-4 h-4 text-indigo-700" /> },
        { label: 'Age', value: `${userData.age} years`, icon: <Calendar className="w-4 h-4 text-indigo-700" /> },
        { label: 'Height', value: `${userData.height} cm`, icon: <Ruler className="w-4 h-4 text-indigo-700" /> },
        { label: 'Weight', value: `${userData.weight} kg`, icon: <Scale className="w-4 h-4 text-indigo-700" /> }
      ]
    },
    {
      title: 'Activity',
      icon: <Activity className="w-6 h-6 text-indigo-700" />,
      color: 'bg-indigo-50',
      borderColor: 'border-indigo-300',
      items: [
        { 
          label: 'Level', 
          value: formatActivityLevel(userData.activityLevel),
          icon: <Activity className="w-4 h-4 text-indigo-700" />
        },
        { 
          label: 'Goal', 
          value: formatFitnessGoal(userData.fitnessGoal),
          icon: <Target className="w-4 h-4 text-indigo-700" />
        }
      ]
    },
    {
      title: 'Circadian Rhythm',
      icon: <Moon className="w-6 h-6 text-indigo-700" />,
      color: 'bg-indigo-50',
      borderColor: 'border-indigo-300',
      items: [
        { 
          label: 'Sleep Time', 
          value: convertTo12HourFormat(userData.sleepTime),
          icon: <Moon className="w-4 h-4 text-indigo-700" />
        },
        { 
          label: 'Wake Time', 
          value: convertTo12HourFormat(userData.wakeTime || 'Not set'),
          icon: <Sun className="w-4 h-4 text-indigo-700" />
        }
      ]
    },
    {
      title: 'Productivity',
      icon: <Brain className="w-6 h-6 text-indigo-700" />,
      color: 'bg-indigo-50',
      borderColor: 'border-indigo-300',
      items: [
        { 
          label: 'Best Time of Day', 
          value: convertTo12HourFormat(userData.bestTime || 'Not set'),
          icon: <Clock className="w-4 h-4 text-indigo-700" />
        },
        { 
          label: 'Mental Work Time', 
          value: convertTo12HourFormat(userData.mentalWorkTime || 'Not set'),
          icon: <Brain className="w-4 h-4 text-indigo-700" />
        },
        { 
          label: 'Wake Difficulty', 
          value: userData.wakeDifficulty || 'Not set',
          icon: <Sun className="w-4 h-4 text-indigo-700" />
        }
      ]
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-200 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6 bg-indigo-800 text-white">
            <h1 className="text-2xl font-bold">Your Fitness Profile</h1>
            <p className="mt-1 opacity-90">View and manage your personal information</p>
          </div>
          
          {/* Edit Mode Toggle and Sign Out Button */}
          <div className="p-6 flex justify-between items-center">
            {editMode ? (
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button 
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-indigo-200 h-16 w-16 mb-4"></div>
              <div className="h-4 bg-indigo-200 rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-indigo-100 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-indigo-50 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        ) : userData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editMode ? (
              <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
                <h2 className="text-xl font-bold mb-4 text-indigo-900">Edit Your Profile</h2>
                <div className="space-y-4">
                  {renderEditableField('Name', 'name')}
                  {renderEditableField('Age', 'age', 'number')}
                  {renderEditableField('Height', 'height', 'number')}
                  {renderEditableField('Weight', 'weight', 'number')}
                  {/* Add more fields as needed */}
                </div>
              </div>
            ) : (
              profileCards.map((card, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-xl shadow-lg overflow-hidden border-l-4 ${card.borderColor} transition-transform duration-300 hover:transform hover:scale-102 hover:shadow-xl`}
                >
                  <div className={`p-5 ${card.color} flex items-center gap-3`}>
                    {card.icon}
                    <h2 className="font-bold text-indigo-900">{card.title}</h2>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-4">
                      {card.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center">
                          <div className="mr-3">{item.icon}</div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">{item.label}</p>
                            <p className="font-medium text-gray-800">{item.value || 'Not set'}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Profile Data Found</h3>
            <p className="text-gray-600 mb-6">Please complete the questionnaire to see your profile.</p>
            <button className="bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg hover:bg-indigo-800 transition-colors">
              Go to Questionnaire
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;