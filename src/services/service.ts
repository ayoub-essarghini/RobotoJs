export class HttpClient {

    async get(endPoint: string): Promise<any> {
        const response = await fetch(endPoint);
        if (!response.ok)
            throw new Error("Response Failed");

        return response.json();
    }
}