import { createElement, useState } from "../core/roboto.js";

export const App = () => {
    const [count, setCount] = useState(0);
 
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white p-6">
        <div className="w-full max-w-md p-8 bg-gray-700 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Counter App</h1>
          
          <div className="flex justify-center">
            <p className="text-7xl font-extrabold text-teal-400 mb-10 py-6 px-8 bg-gray-800 rounded-lg shadow-inner">
              {count}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-8">
            <button 
              className="py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-bold text-lg shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-200"
              onclick={() => setCount(c => c + 1)}
            >
              Increment
            </button>
            
            <button 
              className="py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-bold text-lg shadow-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-all duration-200"
              onclick={() => setCount(c => c - 1)}
            >
              Decrement
            </button>
          </div>
          
          <button 
            className="w-full py-3 px-6 mt-6 bg-gray-600 rounded-lg text-gray-300 font-semibold shadow-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-all duration-200"
            onclick={() => setCount(c=> c = 0)}
          >
            Reset
          </button>
          
          <div className="mt-8 pt-6 border-t border-gray-600 text-center text-gray-400 text-sm">
            Built with Roboto Framework
          </div>
        </div>
      </div>
    );
  };