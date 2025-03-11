export type Post = {
    userId: number;
    id: number;
    title: string;
    body: string;
  };
  
  export class ApiService {
    static async getPosts(): Promise<Post[]> {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
    }
  }