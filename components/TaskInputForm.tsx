import React, { useState } from 'react';
import { ArrowRightIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';

interface TaskInputFormProps {
    onSubmit: (task: string) => void;
    isLoading: boolean;
}

export const TaskInputForm: React.FC<TaskInputFormProps> = ({ onSubmit, isLoading }) => {
    const [task, setTask] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (task.trim()) {
            onSubmit(task.trim());
        }
    };

    return (
        <div className="space-y-6">
            <form
                onSubmit={handleSubmit}
                className="flex items-center bg-neutral-800 border border-neutral-700 rounded-xl transition-all focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-black focus-within:ring-indigo-500"
            >
                <label htmlFor="task-input" className="sr-only">Describe what you want to do</label>
                <input
                    id="task-input"
                    type="text"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Describe what you want to do (e.g. 'I want to design a logo')..."
                    className="flex-grow bg-transparent py-3 px-4 text-white placeholder-neutral-500 focus:outline-none"
                    disabled={isLoading}
                    autoComplete="off"
                />
                <button
                    type="submit"
                    disabled={!task.trim() || isLoading}
                    className="flex-shrink-0 p-3 text-neutral-500 hover:text-white disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
                    aria-label="Submit task"
                >
                    {isLoading ? (
                        <div className="w-5 h-5"><LoadingSpinner /></div>
                    ) : (
                        <ArrowRightIcon className="w-5 h-5" />
                    )}
                </button>
            </form>
        </div>
    );
};
