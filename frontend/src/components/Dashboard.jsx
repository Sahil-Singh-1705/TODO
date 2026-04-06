import React, { useState, useEffect } from "react";
import { ClipboardList, ListTodo, Users, Bell, User, BarChart3 } from 'lucide-react';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }
                const data = await response.json();
                setTasks(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div>
            <h1 className="text-white text-4xl font-semibold mb-7">Welcome To Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-900 shadow rounded-lg p-4 space-y-2 hover:shadow-lg hover:shadow-red-500/50 transition hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-1 text-red-400">
                  <h3 className="text-xl font-semibold flex flex-row gap-1"><ClipboardList /> Task Management</h3>
                </div>
                <p className="text-md text-gray-400 pl-1">
                 Drag and drop tasks to manage them within columns.
                </p>
              </div>

              <div className="bg-gray-900 shadow rounded-lg p-4 space-y-2 hover:shadow-lg hover:shadow-red-500/50 transition hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-1 text-red-400">
                  <h3 className="text-xl font-semibold gap-1 flex items-center"><ListTodo/>Assign Task</h3>
                </div>
                <p className="text-md text-gray-400 pl-1">
                 To assign a task, you may start by selecting a task or a member.
                </p>
              </div>

              <div className="bg-gray-900 shadow rounded-lg p-4 space-y-2 hover:shadow-lg hover:shadow-red-500/50 transition hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-1 text-red-400">
                  <h3 className="text-xl font-semibold gap-1 flex flex-row"><Users/>Teams</h3>
                </div>
                <p className="text-md pl-1 text-gray-400">
                  Easily adjust team composition with drag-and-drop.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 shadow rounded-lg p-4 space-y-2 hover:shadow-lg hover:shadow-red-500/50 transition hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-1 text-red-400">
                  <h3 className="text-xl font-semibold flex flex-row gap-1"><Bell /> Notifications</h3>
                </div>
                <p className="text-md text-gray-400 pl-1">
                 Stay updated with the latest notifications and alerts.
                </p>
              </div>

              <div className="bg-gray-900 shadow rounded-lg p-4 space-y-2 hover:shadow-lg hover:shadow-red-500/50 transition hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-1 text-red-400">
                  <h3 className="text-xl font-semibold gap-1 flex items-center"><User className="mb-1"/>Profile</h3>
                </div>
                <p className="text-md text-gray-400 pl-1">
                 Manage your profile settings and preferences.
                </p>
              </div>

              <div className="bg-gray-900 shadow rounded-lg p-4 space-y-2 hover:shadow-lg hover:shadow-red-500/50 transition hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-1 text-red-400">
                  <h3 className="text-xl font-semibold gap-1 flex flex-row"><BarChart3/>Analytics</h3>
                </div>
                <p className="text-md pl-1 text-gray-400">
                  View detailed analytics and reports on your tasks and teams.
                </p>
              </div>
            </div>

            <div className="bg-gray-900 shadow rounded-lg p-4 text-white">
                <h2 className="text-2xl font-semibold mb-4">Tasks & Milestones</h2>
                {loading ? (
                    <p>Loading tasks...</p>
                ) : error ? (
                    <p className="text-red-500">Error: {error}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-800 rounded-t-lg">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b border-gray-700 text-left text-red-400 text-lg">Tasks</th>
                                    <th className="py-2 px-4 border-b border-gray-700 text-left text-red-400 text-lg">Assign To</th>
                                    <th className="py-2 px-4 border-b border-gray-700 text-left text-red-400 text-lg">Status</th>
                                    <th className="py-2 px-4 border-b border-gray-700 text-left text-red-400 text-lg">Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">No tasks found.</td>
                                    </tr>
                                ) : (
                                    tasks.map((task) => (
                                        <tr key={task._id} className="hover:bg-gray-700 transition">
                                            <td className="py-2 px-4 border-b border-gray-700">{task.title}</td>
                                            <td className="py-2 px-4 border-b border-gray-700">{task.assignedTo ? task.assignedTo.name : 'Unassigned'}</td>
                                            <td className="py-2 px-4 border-b border-gray-700">{task.status}</td>
                                            <td className="py-2 px-4 border-b border-gray-700">{formatDate(task.dueDate)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard;
