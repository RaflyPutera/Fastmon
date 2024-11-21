# Package Imports
import uvicorn
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from fastapi import FastAPI  # type: ignore
import os

# FastAPI App Declaration
app = FastAPI()

# Define allowed origins (your front-end URLs)
origins = [
    "https://fastmon.onrender.com",  # Replace with your production front-end domain
    "http://localhost:5555",  # If you are running the front-end locally
]

# Add CORS middleware with allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Only allow the domains listed in origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Include Services (Your routes or API)
from api import router as mongoservice
app.include_router(mongoservice)

if __name__ == "__main__":
    uvicorn.run("start_server:app", host="0.0.0.0", port=int(os.getenv("PORT", 8885)), reload=True)
