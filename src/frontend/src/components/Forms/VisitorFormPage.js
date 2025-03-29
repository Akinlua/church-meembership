import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import VisitorForm from '../Visitors/VisitorForm';
import axios from 'axios';

const VisitorFormPage = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if this was accessed via QR code
  const isQrAccess = location.search.includes('ref=qr');
  
  useEffect(() => {
    // If not accessed via QR code, redirect to login
    if (!isQrAccess) {
      navigate('/login');
    }
    
    // Check local storage to see if they've already submitted a form
    const hasSubmitted = localStorage.getItem('visitorFormSubmitted');
    if (hasSubmitted) {
      setFormSubmitted(true);
      setSubmissionId(localStorage.getItem('visitorFormSubmissionId'));
    }
  }, [isQrAccess, navigate]);
  
  const handleSubmit = async (visitorId) => {
    // Mark as submitted in local storage
    localStorage.setItem('visitorFormSubmitted', 'true');
    localStorage.setItem('visitorFormSubmissionId', visitorId);
    
    setFormSubmitted(true);
    setSubmissionId(visitorId);
  };
  
  const handleNewForm = () => {
    // Clear local storage and reset state
    localStorage.removeItem('visitorFormSubmitted');
    localStorage.removeItem('visitorFormSubmissionId');
    setFormSubmitted(false);
    setSubmissionId(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Church Visitor Registration
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Welcome to our church! Please fill out this form so we can get to know you better.
          </p>
        </div>
        
        {formSubmitted ? (
          <div className="bg-white shadow-lg rounded-lg p-8 mb-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-medium text-gray-900">Thank You for Visiting!</h2>
              <p className="mt-2 text-gray-600">
                Your information has been submitted successfully. We look forward to connecting with you!
              </p>
              <div className="mt-6">
                <button
                  onClick={handleNewForm}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Submit Another Registration
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <VisitorForm 
              onSubmit={handleSubmit}
              isPublicForm={true}
              onClose={() => navigate('/')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorFormPage; 