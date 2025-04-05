import React, { useState, useContext } from "react";
import { AuthContext } from "../AuthContext";

const EditTodo = ({ todo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState(todo ? todo.description : "");
  const { token } = useContext(AuthContext);

  const openModal = () => {
    setDescription(todo ? todo.description : "");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const updateDesc = async (e) => {
    e.preventDefault();
    try {
      const body = { description };
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/todos/${todo.todo_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        setIsOpen(false);
        window.location = "/";
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <>
      <button
        className="text-blue-600 hover:text-blue-800 transition-colors"
        onClick={openModal}
      >
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Edit Task
            </h2>
            <form>
              <input
                type="text"
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={updateDesc}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditTodo;
