
<br/>
<div align="center">
<a href="https://github.com/ShaanCoding/ReadME-Generator">
</a>
<h1 align="center">Fastmon</h1>
<p align="center">
A simple web-based CRUD application for your MongoDB


  


</p>
</div>

## About The Project

![Product Screenshot](https://i.postimg.cc/HxHK58SF/Screenshot-2024-11-21-091215.png)

**Fastmon** is a lightweight, web-based CRUD (Create, Read, Update, Delete) application built for seamlessly interacting with MongoDB databases. This project aims to simplify database management tasks by providing an intuitive interface to perform core operations, making it ideal for both personal and development use cases.

#### Features
- **Create**: Easily add new documents to any MongoDB collection.
- **Read**: Browse and search existing documents in your database with clear formatting.
- **Update**: Modify fields or entire documents directly through the interface, ensuring fast and accurate updates.
- **Delete**: Remove unwanted documents with just a few clicks.

#### Preview
<div align="center">
  <img src="https://i.postimg.cc/02bDspDn/image.png" alt="Product Screenshot" />
</div>

<div align="center">
  <img src="https://i.postimg.cc/gkHJ1jBs/image.png" alt="Product Screenshot" />
</div>

### Why Use Fastmon?

Fastmon eliminates the need for complex database management tools by offering a lightweight and user-friendly alternative. Whether you're a developer testing a database or a learner exploring MongoDB, Fastmon provides a streamlined and efficient way to handle CRUD operations.
### Built With

**Frontend**: Developed using Vite, React, TypeScript, and styled with Tailwind CSS.

**Backend**: Powered by FastAPI with Uvicorn as the ASGI server.

## Getting Started

To use Fastmon, you'll need an accessible MongoDB server. You can refer to the links below on how to install it.

- [Docker setup](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-community-with-docker/)

- [Manual setup](https://www.mongodb.com/docs/manual/installation/)
### Installation

_To install, simply do the following steps: ._

**Clone the repository**
```sh
   git clone https://github.com/RaflyPutera/Fastmon.git
   ```
**Backend setup**
1. Go into the Fastmon directory and create a python virtual environment to run the service.
```sh
   cd fastmon/service
   ```

2. Install the python requirements
```sh
   pip install -r requirements.txt
   ```
3. Run service, it will be running on the default port :8885.
```sh
   python start_server.py
   ```
**Frontend setup**

Install the modules and run the application
```sh
   npm install
   npm run dev
   ```

After completing these steps you can try using Fastmon on the default address ```localhost:5555```
## License

Distributed under the MIT License. See [MIT License](https://opensource.org/licenses/MIT) for more information.
