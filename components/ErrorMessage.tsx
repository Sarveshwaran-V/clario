
import React from 'react';
import { ExclamationTriangleIcon } from './icons';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="flex items-center gap-4 bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg">
    <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0" />
    <div>
      <h4 className="font-bold">An Error Occurred</h4>
      <p>{message}</p>
    </div>
  </div>
);
