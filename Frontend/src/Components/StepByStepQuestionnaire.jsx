import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ArrowRight, ArrowLeft, Save, AlertCircle } from 'lucide-react';

const StepByStepQuestionnaire = () => {
  // Form data state
  const [formData, setFormData] = useState({
    name: '', 
    age: '',
    height: '',
    weight: '',
    activityLevel: 'sedentary',
    fitnessGoal: 'weightLoss',
    wakeTime: '',
    sleepTime: '',
    bestTime: '',
    wakeDifficulty: '',
    mentalWorkTime: '',
  });

  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  // Define questions
  const questions = [
    {
      id: 'name',
      question: 'What is your name?',
      type: 'text',
      placeholder: 'Enter your full name',
      validation: (value) => value.trim().length > 0,
    },
    {
      id: 'age',
      question: 'How old are you?',
      type: 'number',
      placeholder: 'Enter your age',
      validation: (value) => value > 0 && value < 120,
    },
    {
      id: 'height',
      question: 'What is your height?',
      type: 'number',
      placeholder: 'Height in cm',
      suffix: 'cm',
      validation: (value) => value > 0,
    },
    {
      id: 'weight',
      question: 'What is your weight?',
      type: 'number',
      placeholder: 'Weight in kg',
      suffix: 'kg',
      validation: (value) => value > 0,
    },
    {
      id: 'activityLevel',
      question: 'What is your activity level?',
      type: 'select',
      options: [
        { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
        { value: 'lightlyActive', label: 'Lightly Active (light exercise 1-3 days/week)' },
        { value: 'moderatelyActive', label: 'Moderately Active (moderate exercise 3-5 days/week)' },
        { value: 'veryActive', label: 'Very Active (intense exercise 6-7 days/week)' },
      ],
    },
    {
      id: 'fitnessGoal',
      question: 'What is your primary fitness goal?',
      type: 'select',
      options: [
        { value: 'weightLoss', label: 'Weight Loss' },
        { value: 'muscleGain', label: 'Muscle Gain' },
        { value: 'generalWellness', label: 'General Wellness & Health' },
      ],
    },
    {
      id: 'wakeTime',
      question: 'What time would you prefer to wake up if you had no obligations?',
      type: 'select',
      options: [
        { value: 5, label: 'Before 6 AM' },
        { value: 4, label: '6–7 AM' },
        { value: 3, label: '7–8 AM' },
        { value: 2, label: '8–9 AM' },
        { value: 1, label: 'After 9 AM' },
      ],
    },
    {
      id: 'sleepTime',
      question: 'What time would you prefer to go to sleep if you were free to plan?',
      type: 'select',
      options: [
        { value: 5, label: 'Before 9 PM' },
        { value: 4, label: '9–10 PM' },
        { value: 3, label: '10–11 PM' },
        { value: 2, label: '11 PM–Midnight' },
        { value: 1, label: 'After Midnight' },
      ],
    },
    {
      id: 'bestTime',
      question: 'At what time of day do you feel your best mentally and physically?',
      type: 'select',
      options: [
        { value: 5, label: 'Early morning' },
        { value: 4, label: 'Late morning' },
        { value: 3, label: 'Afternoon' },
        { value: 2, label: 'Evening' },
        { value: 1, label: 'Late night' },
      ],
    },
    {
      id: 'wakeDifficulty',
      question: 'How easy is it for you to wake up in the morning?',
      type: 'select',
      options: [
        { value: 5, label: 'Very easy' },
        { value: 4, label: 'Somewhat easy' },
        { value: 3, label: 'Neutral' },
        { value: 2, label: 'Somewhat difficult' },
        { value: 1, label: 'Very difficult' },
      ],
    },
    {
      id: 'mentalWorkTime',
      question: 'If you had to do 2 hours of hard mental work, when would you prefer to do it?',
      type: 'select',
      options: [
        { value: 5, label: '6–8 AM' },
        { value: 4, label: '8–10 AM' },
        { value: 3, label: '10 AM–2 PM' },
        { value: 2, label: '2–5 PM' },
        { value: 1, label: '5 PM or later' },
      ],
    },
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Navigate to next question
  const handleNext = () => {
    const currentQuestion = questions[currentStep];
    
    // Validate current field if validation function exists
    if (currentQuestion.validation && !currentQuestion.validation(formData[currentQuestion.id])) {
      showNotification('Please enter a valid value', 'error');
      return;
    }
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Calculate chronotype
  const calculateChronotype = (formData) => {
    const scores = [
      formData.wakeTime,
      formData.sleepTime,
      formData.bestTime,
      formData.wakeDifficulty,
      formData.mentalWorkTime,
    ];
    const totalScore = scores.reduce((sum, score) => sum + score, 0);

    if (totalScore >= 20) return 'Morning Type (Lark)';
    if (totalScore >= 15) return 'Intermediate Type';
    return 'Evening Type (Owl)';
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate chronotype
      const chronotype = calculateChronotype(formData);

      // Process data for Firestore
      const processedData = {
        name: formData.name, 
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        activityLevel: formData.activityLevel,
        fitnessGoal: formData.fitnessGoal,
        wakeTime: formData.wakeTime,
        sleepTime: formData.sleepTime,
        bestTime: formData.bestTime,
        wakeDifficulty: formData.wakeDifficulty,
        mentalWorkTime: formData.mentalWorkTime,
        chronotype,
        createdAt: new Date().toISOString(),
      };

      // Save questionnaire data to Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, processedData, { merge: true });

      showNotification('Profile information saved successfully!', 'success');
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      console.error('Error saving data:', error);
      setError(error.message);
      showNotification(error.message, 'error');
    }
  };

  // Get current question
  const currentQuestion = questions[currentStep];

  // Progress percentage
  const progressPercentage = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
        {/* Progress bar */}
        <div className="w-full h-2 bg-blue-100">
          <div 
            className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Step counter */}
        <div className="p-4 bg-blue-600 text-white text-sm font-medium">
          Step {currentStep + 1} of {questions.length}
        </div>
        
        {/* Question area */}
        <div className="px-6 pt-8 pb-6 min-h-64">
          <h2 className="text-2xl font-bold text-blue-800 mb-8">{currentQuestion.question}</h2>
          
          <div className="space-y-4">
            {/* Dynamic input based on question type */}
            {currentQuestion.type === 'number' && (
              <div className="relative">
                <input
                  type="number"
                  name={currentQuestion.id}
                  value={formData[currentQuestion.id]}
                  onChange={handleChange}
                  placeholder={currentQuestion.placeholder}
                  required
                  className="w-full p-4 text-lg border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
                {currentQuestion.suffix && (
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                    {currentQuestion.suffix}
                  </span>
                )}
              </div>
            )}
            
            {currentQuestion.type === 'select' && (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <div 
                    key={option.value}
                    onClick={() => setFormData({...formData, [currentQuestion.id]: option.value})}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData[currentQuestion.id] === option.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="px-6 pb-6 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          
          {currentStep < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
              <Save className="w-5 h-5 ml-1" />
            </button>
          )}
        </div>
      </div>
      
      {/* Notification */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'error' 
            ? 'bg-red-600 text-white' 
            : notification.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white'
        } transition-all duration-300 ease-in-out animate-fade-in`}>
          {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
          <p>{notification.message}</p>
        </div>
      )}
    </div>
  );
};

export default StepByStepQuestionnaire;