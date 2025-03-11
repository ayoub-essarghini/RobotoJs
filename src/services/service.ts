export class HttpClient {
    async get<T>(endPoint: string): Promise<T> {
        const response = await fetch(endPoint);
        if (!response.ok)
            throw new Error("Response Failed");

        return response.json() as Promise<T>;
    }
    
    async post<T>(endPoint: string, data: any): Promise<T> {
        const response = await fetch(endPoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok)
            throw new Error("Response Failed");

        return response.json() as Promise<T>;
    }
}