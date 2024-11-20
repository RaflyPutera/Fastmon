import json
import logging
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from service import Mongo

# Initialize router and MongoDB service
router = APIRouter(prefix="/db", tags=["Database Endpoints"])
mongo = Mongo()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
class MongoUrl(BaseModel):
    username: str
    password: str
    host: str
    port: int
    default_db: str

class Create(BaseModel):
    collection: str
    document: str

class Collection(BaseModel):
    option: str
    collection_name: str
    new_name: Optional[str] = None

class Document(BaseModel):
    option: str
    collection: str
    selected_ids: Optional[list] = None
    document_id: Optional[str] = None
    document_update: Optional[str] = None

# Routes
@router.post("/connect")
async def connect(model: MongoUrl):
    """
    Connect to MongoDB using the provided credentials and database configuration.
    """
    try:
        await mongo.connect(**model.model_dump())
        return {"message": "Connected to MongoDB Server"}
    except Exception as e:
        logger.error(f"Connection error: {e}")
        if "Authentication failed" in str(e):
            raise HTTPException(status_code=422, detail="Authentication failed")
        if "getaddrinfo failed" in str(e):
            raise HTTPException(status_code=422, detail="Host not found")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create")
async def create(model: Create):
    """
    Create a new document in the specified MongoDB collection.
    """
    try:
        document = json.loads(model.document)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON document: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    try:
        result = await mongo.create_document(model.collection, document)
        return result
    except Exception as e:
        logger.error(f"Error creating document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list_collections")
async def list_collections():
    """
    List all non-system collections in the MongoDB database.
    """
    try:
        result = await mongo.list_collections()
        return result
    except Exception as e:
        logger.error(f"Error listing collections: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/select_collection")
async def get_collection(collection: str = Query(..., description="Name of the collection to retrieve")):
    """
    Retrieve all documents from the specified MongoDB collection.
    """
    try:
        result = await mongo.get_collection(collection)
        return result
    except Exception as e:
        logger.error(f"Error retrieving collection {collection}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/collection/edit")
async def edit_collection(model: Collection):
    """
    Edit a MongoDB collection by either renaming or deleting it.
    """
    try:
        collections = await mongo.list_collections()
        collection_names = collections.get("collections", [])

        if model.option == "delete":
            if model.collection_name not in collection_names:
                raise HTTPException(status_code=404, detail="Collection not found")
            result = await mongo.delete_collection(model.collection_name)
            return result

        elif model.option == "rename":
            if model.collection_name not in collection_names:
                raise HTTPException(status_code=404, detail="Collection not found")
            if model.new_name in collection_names:
                raise HTTPException(status_code=409, detail="New name already exists")
            result = await mongo.rename_collection(model.collection_name, model.new_name)
            return result

        else:
            raise HTTPException(status_code=422, detail="Invalid option")
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_document")
async def get_document(collection: str = Query(..., description="Name of the collection to retrieve"), document_id:str =Query(...,description="Id of document")):
    """
    Retrieve all documents from the specified MongoDB collection.
    """
    try:
        result = await mongo.get_document(collection,document_id)
        return result
    except Exception as e:
        logger.error(f"Error retrieving document {collection}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/document/edit")
async def edit_document(model:Document):
    """
    Edit or delete a document in the specified MongoDB collection.
    """
    try:
        if model.option == "delete":
            if not model.selected_ids:
                raise HTTPException(status_code=422, detail="No document IDs provided for deletion")
            result = await mongo.delete_documents(model.collection, model.selected_ids)
            return result

        elif model.option == "update":
            if not model.document_id or not model.document_update:
                raise HTTPException(status_code=422, detail="Document ID and update data are required for update")
            result = await mongo.update_document(model.collection, model.document_id, model.document_update)
            return result

        else:
            raise HTTPException(status_code=422, detail="Invalid option")
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))