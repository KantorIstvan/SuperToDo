import React, { useState, useContext } from "react";
import InputTodo from "./inputTodo";
import ListTodos from "./listTodos";
import { AuthContext } from "../AuthContext";

const Dashboard = () => {
  const [todosChange, setTodosChange] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const refreshTodos = () => {
    setTodosChange(!todosChange);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome {user && user.email}
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
        <InputTodo refreshTodos={refreshTodos} />
        <ListTodos todosChange={todosChange} />
      </div>
    </div>
  );
};

export default Dashboard;
