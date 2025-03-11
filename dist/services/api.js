export class ApiService {
    static async getPosts() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    }
}
