from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    identifier: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    display_name: str


class UserSignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    education: str
    password: str


class AuthenticatedIdentity(BaseModel):
    role: str
    id: int
    identifier: str
    display_name: str
