import React, { useState, useContext } from "react";
import { AuthContext } from "../AuthContext";

const InputTodo = ({ refreshTodos }) => {
  const [description, setDescription] = useState("");
  const { token } = useContext(AuthContext);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { description };
      await fetch(`${process.env.REACT_APP_API_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(body),
      });
      setDescription("");
      refreshTodos();
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Todo List
      </h1>
      <form
        className="flex gap-3 shadow-lg rounded-lg p-4 bg-white"
        onSubmit={onSubmitForm}
      >
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={description}
          placeholder="Add a new task..."
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 transform hover:scale-105">
          Add
        </button>
      </form>
    </div>
  );
};

export default InputTodo;
