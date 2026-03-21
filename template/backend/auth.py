import os
import httpx
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

PB_URL = os.getenv("POCKETBASE_URL", "http://127.0.0.1:8090")
bearer = HTTPBearer()


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Security(bearer),
):
    """
    Validate a PocketBase token by calling PocketBase's auth-refresh endpoint.
    Returns the user record on success, raises 401 on failure.
    """
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{PB_URL}/api/collections/users/auth-refresh",
            headers={"Authorization": creds.credentials},
        )

    if r.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid or expired token",
        )

    return r.json().get("record")
