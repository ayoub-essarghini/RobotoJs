export class HttpClient {
    async get(endPoint) {
        const response = await fetch(endPoint);
        if (!response.ok)
            throw new Error("Response Failed");
        return response.json();
    }
    async post(endPoint, data) {
        const response = await fetch(endPoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok)
            throw new Error("Response Failed");
        return response.json();
    }
}
