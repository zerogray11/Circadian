import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, Save, AlertCircle, Clock, Check } from 'lucide-react';

const QuestionnaireUI = ({
  formData,
  currentStep,
  questions,
  handleChange,
  handleTimeChange,
  handleNext,
  handlePrevious,
  handleSubmit,
  notification,
}) => {
  // Progress percentage
  const progressPercentage = ((currentStep + 1) / questions.length) * 100;

  // Get current question
  const currentQuestion = questions[currentStep];
  
  // State for tracking if the current question is valid
  const [isValid, setIsValid] = useState(true);
  const [isTouched, setIsTouched] = useState(false); // Track if the field has been interacted with
  
  // References for closing dropdowns when clicking outside
  const timePickerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Time picker states
  const [timePickerState, setTimePickerState] = useState({
    activeField: null,
    hour: '7',
    minute: '00',
    period: 'AM',
    isOpen: false
  });

  // Custom time picker handler
  const handleTimePickerChange = (field, value) => {
    setTimePickerState(prev => ({ ...prev, [field]: value }));
    
    // Convert to 24-hour format for the form data
    let hours = parseInt(field === 'hour' ? value : timePickerState.hour, 10);
    const minutes = field === 'minute' ? value : timePickerState.minute;
    const period = field === 'period' ? value : timePickerState.period;
    
    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
    handleTimeChange(currentQuestion.id, formattedTime);
    setIsTouched(true); // Mark as touched when time is changed
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setTimePickerState(prev => ({ ...prev, activeField: null }));
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Close any other dropdowns if needed
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update time picker state when moving between time questions
  useEffect(() => {
    if (currentQuestion.type === 'time') {
      const currentTime = formData[currentQuestion.id];
      if (currentTime) {
        const [hours, minutes] = currentTime.split(':');
        const parsedHours = parseInt(hours, 10);
        const period = parsedHours >= 12 ? 'PM' : 'AM';
        const hour = (parsedHours % 12 || 12).toString();
        
        setTimePickerState({
          activeField: null,
          hour,
          minute: minutes,
          period,
          isOpen: false
        });
      }
    }
    // Reset touched state when changing questions
    setIsTouched(false);
  }, [currentStep, formData, currentQuestion.id, currentQuestion.type]);

  // Validate current question
  useEffect(() => {
    const value = formData[currentQuestion.id];
    if (currentQuestion.validation) {
      setIsValid(currentQuestion.validation(value));
    } else {
      setIsValid(true);
    }
  }, [formData, currentQuestion.id, currentQuestion.validation]);

  // Handle input changes and mark as touched
  const handleInputChange = (e) => {
    setIsTouched(true);
    handleChange(e);
  };

  // Should show error based on touched state and validity
  const shouldShowError = !isValid && isTouched;

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      {/* Background with blur effect */}
      <div className="fixed inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 to-orange-100 backdrop-blur-lg z-0"></div>

      <div className="w-full max-w-md bg-white/90 rounded-xl shadow-lg overflow-visible transition-all duration-300 ease-in-out relative z-10">
        {/* Glistening gradient header */}
        <div className="h-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 to-orange-200 rounded-t-xl"></div>

        {/* Progress bar with gradient */}
        <div className="w-full h-2 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 to-orange-300 transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Step counter with gradient background */}
        <div className="p-4 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 text-white text-sm font-medium">
  
  
          Step {currentStep + 1} of {questions.length}
        </div>

        {/* Question area */}
        <div className="px-6 pt-8 pb-6 min-h-64">
        <h2 className="text-2xl font-black text-gray-600 mb-8 font-outfit leading-relaxed">{currentQuestion.question}</h2>

          <div className="space-y-4">
            {/* Dynamic input based on question type */}
            {currentQuestion.type === 'text' && (
              <div className="relative">
                <input
                  type="text"
                  name={currentQuestion.id}
                  value={formData[currentQuestion.id] || ''}
                  onChange={handleInputChange}
                  placeholder={currentQuestion.placeholder}
                  required
                  className="w-full p-4 text-lg border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-300 transition-colors"
                />
                {shouldShowError && (
                  <p className="text-red-500 text-sm mt-1">
                    {currentQuestion.errorMessage || 'This field is required'}
                  </p>
                )}
              </div>
            )}

            {currentQuestion.type === 'number' && (
              <div className="relative">
                <input
                  type="number"
                  name={currentQuestion.id}
                  value={formData[currentQuestion.id] || ''}
                  onChange={handleInputChange}
                  placeholder={currentQuestion.placeholder}
                  required
                  className="w-full p-4 text-lg border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-300 transition-colors pr-12"
                />
                {currentQuestion.suffix && (
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black pointer-events-none">
                    {currentQuestion.suffix}
                  </span>
                )}
                {shouldShowError && (
                  <p className="text-red-500 text-sm mt-1">
                    {currentQuestion.errorMessage || 'Please enter a valid number'}
                  </p>
                )}
              </div>
            )}

            {currentQuestion.type === 'select' && (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      setIsTouched(true);
                      handleChange({ target: { name: currentQuestion.id, value: option.value } });
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData[currentQuestion.id] === option.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {option.label}
                  </div>
                ))}
                {shouldShowError && (
                  <p className="text-red-500 text-sm mt-1">
                    {currentQuestion.errorMessage || 'Please select an option'}
                  </p>
                )}
              </div>
            )}

            {currentQuestion.type === 'time' && (
              <div className="relative" ref={timePickerRef}>
                <div className="flex items-center space-x-2 p-4 border-2 border-blue-200 rounded-lg bg-white">
                  <Clock className="w-5 h-5 text-blue-500" />
                  
                  {/* Hour dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTouched(true);
                        setTimePickerState(prev => ({
                          ...prev,
                          activeField: prev.activeField === 'hour' ? null : 'hour'
                        }));
                      }}
                      className="w-16 py-2 px-3 text-center border border-blue-100 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus:border-blue-300"
                    >
                      {timePickerState.hour}
                    </button>
                    
                    {timePickerState.activeField === 'hour' && (
                      <div className="absolute z-10 mt-1 w-16 max-h-44 overflow-y-auto bg-white border border-blue-200 rounded shadow-lg">
                        {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(hour => (
                          <div
                            key={hour}
                            onClick={() => handleTimePickerChange('hour', hour)}
                            className={`px-2 py-1 cursor-pointer hover:bg-blue-100 ${
                              timePickerState.hour === hour ? 'bg-gradient-to-r from-blue-400 to-pink-300 text-white' : ''
                            }`}
                          >
                            {hour}
                            {timePickerState.hour === hour && <Check className="inline w-4 h-4 ml-1" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-lg font-medium">:</span>
                  
                  {/* Minute dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTouched(true);
                        setTimePickerState(prev => ({
                          ...prev,
                          activeField: prev.activeField === 'minute' ? null : 'minute'
                        }));
                      }}
                      className="w-16 py-2 px-3 text-center border border-blue-100 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus:border-blue-300"
                    >
                      {timePickerState.minute}
                    </button>
                    
                    {timePickerState.activeField === 'minute' && (
                      <div className="absolute z-10 mt-1 w-16 max-h-44 overflow-y-auto bg-white border border-blue-200 rounded shadow-lg">
                        {['00', '15', '30', '45'].map(minute => (
                          <div
                            key={minute}
                            onClick={() => handleTimePickerChange('minute', minute)}
                            className={`px-2 py-1 cursor-pointer hover:bg-blue-100 ${
                              timePickerState.minute === minute ? 'bg-gradient-to-r from-blue-400 to-pink-300 text-white' : ''
                            }`}
                          >
                            {minute}
                            {timePickerState.minute === minute && <Check className="inline w-4 h-4 ml-1" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* AM/PM dropdown */}
                  <div className="relative ml-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTouched(true);
                        setTimePickerState(prev => ({
                          ...prev,
                          activeField: prev.activeField === 'period' ? null : 'period'
                        }));
                      }}
                      className="w-16 py-2 px-3 text-center border border-blue-100 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus:border-blue-300"
                    >
                      {timePickerState.period}
                    </button>
                    
                    {timePickerState.activeField === 'period' && (
                      <div className="absolute z-10 mt-1 w-16 max-h-44 overflow-y-auto bg-white border border-blue-200 rounded shadow-lg">
                        {['AM', 'PM'].map(period => (
                          <div
                            key={period}
                            onClick={() => handleTimePickerChange('period', period)}
                            className={`px-2 py-1 cursor-pointer hover:bg-blue-100 ${
                              timePickerState.period === period ? 'bg-gradient-to-r from-blue-400 to-pink-300 text-white' : ''
                            }`}
                          >
                            {period}
                            {timePickerState.period === period && <Check className="inline w-4 h-4 ml-1" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {shouldShowError && (
                  <p className="text-red-500 text-sm mt-1">
                    {currentQuestion.errorMessage || 'Please select a time'}
                  </p>
                )}
              </div>
            )}

            {/* Height dropdown */}
            {currentQuestion.type === 'height' && (
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name={currentQuestion.id}
                    value={formData[currentQuestion.id] || ''}
                    onChange={handleInputChange}
                    placeholder={currentQuestion.placeholder}
                    required
                    className="w-full p-4 text-lg border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-300 transition-colors pr-12"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black font-outfit font-bold pointer-events-none">
                    {currentQuestion.suffix || 'cm'}
                  </span>
                </div>
                {shouldShowError && (
                  <p className="text-red-500 text-sm mt-1">
                    {currentQuestion.errorMessage || 'Please enter a valid height'}
                  </p>
                )}
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
                : 'text-black hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>

          {currentStep < questions.length - 1 ? (
            <button
              onClick={() => {
                setIsTouched(true);
                if (isValid) handleNext();
              }}
              disabled={!isValid}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors font-outfit ${
                isValid
                  ? 'bg-black text-white font-bold hover:opacity-90 shadow-sm'
                  : 'bg-gray-300 text-white cursor-not-allowed font-medium opacity-75'
              }`}
            >
              Next
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={() => {
                setIsTouched(true);
                if (isValid) handleSubmit();
              }}
              disabled={!isValid}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                isValid
                  ? 'bg-gradient-to-r from-black to-gray-800 text-white hover:opacity-90'
                  : 'bg-gray-300 text-white cursor-not-allowed'
              }`}
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
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-blue-400 to-pink-300 text-white'
        } transition-all duration-300 ease-in-out animate-fade-in`}>
          {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
          <p>{notification.message}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionnaireUI;