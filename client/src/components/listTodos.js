import React, { useEffect, useState, useContext } from "react";
import EditTodo from "./editTodo";
import { AuthContext } from "../AuthContext";

const ListTodos = ({ todosChange }) => {
  const [todos, setTodos] = useState([]);
  const { token } = useContext(AuthContext);

  const getTodos = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/todos`, {
        method: "GET",
        headers: {
          "x-auth-token": token,
        },
      });
      const jsonData = await response.json();
      setTodos(jsonData);
    } catch (err) {
      console.error(err.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/todos/${id}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
        },
      });
      setTodos(todos.filter((todo) => todo.todo_id !== id));
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getTodos();
  }, [todosChange]);

  return (
    <div className="shadow-lg rounded-lg overflow-hidden">
      <table className="w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Task
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {todos.map((todo) => (
            <tr
              key={todo.todo_id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 text-sm text-gray-800">
                {todo.description}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {/* Removed the wrapping button */}
                <EditTodo todo={todo} />
                <button
                  onClick={() => deleteTodo(todo.todo_id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListTodos;
