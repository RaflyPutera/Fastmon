from bson import ObjectId
import motor.motor_asyncio
from fastapi import HTTPException

class Mongo:
    async def connect(self, username: str, password: str, host: str, port: int, default_db: str):
        """
        Connect to the MongoDB server and set the database.
        """
        try:
            uri = f"mongodb://{username}:{password}@{host}:{port}/{default_db}"
            self.client = motor.motor_asyncio.AsyncIOMotorClient(uri)
            self.db = self.client[default_db]
            await self.client.admin.command('ping')  # Ensure the connection is valid
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to connect to MongoDB: {str(e)}")

    async def create_document(self, collection_name: str, data: dict):
        """
        Insert a document into a specified collection.
        """
        try:
            result = await self.db[collection_name].insert_one(data)
            return {"inserted_id": str(result.inserted_id)}
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Error creating document: {str(e)}")

    async def list_collections(self):
        """
        List all collections in the current database, excluding system collections.
        """
        try:
            collections = await self.db.list_collection_names()
            filtered_collections = [name for name in collections if not name.startswith("system.")]
            return {"collections": filtered_collections}
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Error listing collections: {str(e)}")

    async def get_collection(self, collection_name: str):
        """
        Retrieve all documents from a specified collection.
        """
        try:
            collection = self.db[collection_name]
            documents = await collection.find().to_list(length=None)
            for document in documents:
                if '_id' in document:
                    document['_id'] = str(document['_id'])  # Convert ObjectId to string
            return documents
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Error retrieving collection: {str(e)}")
    
    async def delete_collection(self, collection_name: str):
        """
        Delete a specified collection from the database.
        """
        try:
            await self.db.drop_collection(collection_name)
            return {"message": "Collection deleted successfully"}
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Error deleting collection: {str(e)}")

    async def rename_collection(self, collection_name: str, new_name: str):
        """
        Rename a specified collection.
        """
        try:
            await self.db[collection_name].rename(new_name)
            return {"message": "Collection renamed successfully"}
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Error renaming collection: {str(e)}")
    
    async def get_document(self, collection_name: str, document_id: str):
        """
        Retrieve a single document by its ID from a specified collection.
        """
        try:
            collection = self.db[collection_name]
            document = await collection.find_one({"_id": ObjectId(document_id)})
            if document:
                document['_id'] = str(document['_id'])  # Convert ObjectId to string
                return document
            else:
                raise HTTPException(status_code=404, detail="Document not found")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Error retrieving document: {str(e)}")

    async def delete_documents(self, collection_name: str, document_ids: list):
        """
        Delete documents from a specified collection based on their IDs.
        """
        try:
            collection = self.db[collection_name]
            result = await collection.delete_many({"_id": {"$in": [ObjectId(id) for id in document_ids]}})
            return {"message": f"Deleted {result.deleted_count} document(s)"}
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Error deleting documents: {str(e)}")
    
    async def update_document(self, collection_name: str, document_id: str, update_data: str):
        """
        Update a document in a specified collection by its ID.
        """
        try:
            collection = self.db[collection_name]
            update_data = eval(update_data)  # Convert string to dictionary
            
            update_data.pop('_id', None)
            result = await collection.update_one({"_id": ObjectId(document_id)}, {"$set": update_data})

            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Document not found")

            return {"message": "Document updated successfully"}
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Error updating document: {str(e)}")
