from fastapi import APIRouter

from .routes import admins, auth, books, health, librarians, users

# Just includes all the routing for all the API for the differnet roles
# The logic for the routers rae kept seperate and this is the main top level import

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(books.router)
api_router.include_router(admins.router)
api_router.include_router(librarians.router)
api_router.include_router(users.router)
