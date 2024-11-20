# Package Imports
import uvicorn
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi import FastAPI # type: ignore

# Local Imports

# FastAPI App Declaration
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Include Services
from api import router as mongoservice
app.include_router(mongoservice)

if __name__ == "__main__":
    uvicorn.run("start_server:app", host="localhost", port=8885, reload=True)