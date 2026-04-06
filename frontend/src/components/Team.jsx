import React, { useEffect, useState } from "react";
import { X, Plus, UserPlus } from "lucide-react";

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("A");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const updateUserTeam = async (userId, team) => {
    try {
      const currentPath = window.location.pathname;
      const isAdminPath = currentPath === "/admin";
      const token = isAdminPath
        ? localStorage.getItem("adminToken")
        : localStorage.getItem("memberToken");

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/team`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ team }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user team");
      }

      const updatedUser = await response.json();
      setUsers(users.map(user => user._id === userId ? updatedUser : user));
    } catch (err) {
      alert(err.message);
    }
  };

  const removeUserFromTeam = async (userId) => {
    await updateUserTeam(userId, null);
  };

  const handleAddMember = async () => {
    if (!selectedUser) {
      alert("Please select a user");
      return;
    }
    await updateUserTeam(selectedUser, selectedTeam);
    setShowAddForm(false);
    setSelectedUser("");
    setSelectedTeam("A");
  };

  const onDragStart = (e, userId) => {
    e.dataTransfer.setData("userId", userId);
  };

  const onDrop = (e, newTeam) => {
    e.preventDefault();
    const userId = e.dataTransfer.getData("userId");
    const user = users.find(u => u._id === userId);
    if (user && user.team !== newTeam) {
      updateUserTeam(userId, newTeam);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const currentPath = window.location.pathname;
    const isAdminPath = currentPath === "/admin";
    const token = isAdminPath
      ? localStorage.getItem("adminToken")
      : localStorage.getItem("memberToken");

    if (token) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setCurrentUser(data);
        })
        .catch((err) => {
          console.error("Error fetching user profile:", err);
        });
    }

    fetchUsers();
  }, []);

  if (loading) return <div className="text-white">Loading users...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const teamAUsers = users.filter(user => user.team === 'A');
  const teamBUsers = users.filter(user => user.team === 'B');
  const unassignedUsers = users.filter(user => !user.team);

  const isAdmin = currentUser && currentUser.role && currentUser.role.toLowerCase() === "admin";
  const isMember = currentUser && currentUser.role && currentUser.role.toLowerCase() === "member";

  const visibleTeamA = isMember && currentUser.team === 'A' ? teamAUsers : isAdmin ? teamAUsers : [];
  const visibleTeamB = isMember && currentUser.team === 'B' ? teamBUsers : isAdmin ? teamBUsers : [];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-white text-4xl font-semibold">Team Members</h1>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg cursor-pointer active:scale-90 flex items-center transition font-semibold text-md"
          >
            <Plus className="mr-1"/>Add Member
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-950 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-96">
            <h2 className="text-white text-2xl mb-4 flex items-center gap-1 underline underline-offset-4"><UserPlus size={30} className="mb-1 text-green-400"/>Add Member to Team</h2>
            <div className="mb-4">
              <label className="block text-white mb-2">Select User :</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 rounded text-black bg-gray-200 outline-red-500 focus:outline-3"
              >
                <option value="">Select a user</option>
                {unassignedUsers.map(user => (
                  <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-white mb-2">Select Team :</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full p-2 rounded text-black bg-gray-200 outline-red-500 focus:outline-3"
              >
                <option value="A">Team A</option>
                <option value="B">Team B</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-2 rounded cursor-pointer flex items-center gap-0.5 font-semibold text-lg transition"
              >
                <X/> Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded cursor-pointer flex items-center gap-0.5 font-semibold text-lg transition"
              >
                <Plus/> Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`grid gap-6 ${isAdmin ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {(isAdmin || (isMember && currentUser.team === 'A')) && (
          <div
            onDrop={(e) => onDrop(e, 'A')}
            onDragOver={onDragOver}
            className="bg-gray-800 p-4 rounded-lg min-h-[400px]"
          >
            <h2 className="text-white text-3xl font-semibold mb-5">Team <span className="text-red-400">A</span> :</h2>
            {visibleTeamA.length === 0 ? (
              <p className="text-gray-400">No members in Team A.</p>
            ) : (
              <ul className="space-y-4">
                {visibleTeamA.map((user) => (
                  <li
                    key={user._id}
                    draggable={isAdmin}
                    onDragStart={(e) => onDragStart(e, user._id)}
                    className={`bg-gray-900 p-4 rounded-lg flex justify-between items-center ${isAdmin ? 'cursor-move' : ''}`}
                  >
                    <div>
                      <p className="text-white font-semibold">
                        <span className="text-red-400">Name:</span> {user.name}
                      </p>
                      <p className="text-white font-semibold">
                        <span className="text-red-400">Email:</span> {user.email}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => removeUserFromTeam(user._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg cursor-pointer active:scale-90 flex items-center transition font-semibold"
                      >
                        <X /> Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {(isAdmin || (isMember && currentUser.team === 'B')) && (
          <div
            onDrop={(e) => onDrop(e, 'B')}
            onDragOver={onDragOver}
            className="bg-gray-800 p-4 rounded-lg min-h-[400px]"
          >
            <h2 className="text-white text-3xl font-semibold mb-5">Team <span className="text-red-400">B</span> :</h2>
            {visibleTeamB.length === 0 ? (
              <p className="text-gray-400">No members in Team B.</p>
            ) : (
              <ul className="space-y-4">
                {visibleTeamB.map((user) => (
                  <li
                    key={user._id}
                    draggable={isAdmin}
                    onDragStart={(e) => onDragStart(e, user._id)}
                    className={`bg-gray-900 p-4 rounded-lg flex justify-between items-center ${isAdmin ? 'cursor-move' : ''}`}
                  >
                    <div>
                      <p className="text-white font-semibold">
                        <span className="text-red-400">Name:</span> {user.name}
                      </p>
                      <p className="text-white font-semibold">
                        <span className="text-red-400">Email:</span> {user.email}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => removeUserFromTeam(user._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg cursor-pointer active:scale-90 flex items-center transition font-semibold"
                      >
                        <X /> Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
