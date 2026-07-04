export async function getPhoenixState(fetch = window.fetch) {
    // Always use backend-issued token
    const tokenRes = await fetch("http://127.0.0.1:8000/phoenix/token");
    const { token } = await tokenRes.json();

    const res = await fetch("http://127.0.0.1:8000/phoenix/state/", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Phoenix state");
    }

    return await res.json();
}

