import { createElement, useEffect, useState } from '../core/roboto.js';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then((response) => response.json())
      .then((data: Post[]) => {
        console.log(data); // You can check the data here
        setPosts(d => d = data);
        setIsLoading(f => f = false); // Set loading to false when data is fetched
      })
      .catch((error) => {
        console.error('Error fetching posts:', error);
        setIsLoading(f => f = false); // You may also want to set loading to false in case of an error
      });
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white p-6">
      <div className="w-full max-w-3xl p-8 bg-gray-700 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Posts</h1>
        {loading ? (
          <p className="text-2xl text-center">Loading...</p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {posts.map(post => (
              <li key={post.id} className="py-4">
                <h2 className="text-2xl font-bold">{post.title}</h2>
                <p className="text-lg mt-2">{post.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};