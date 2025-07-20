# <img src="https://github.com/user-attachments/assets/b338fe5c-6533-423c-ad21-39f2d0c14f78" height="50" />
TagVault. A personalized space to effortlessly organize your thoughts, files, and ideas.

## Tech Stack

### Frontend
- React
- Clerk
- Axios

### Backend
- Express
- Prisma
- Azure Storage Blob

### Deployment
- Frontend on Azure Storage Blob
- Backend on Azure VM

## Run Locally

#### Install Node + Dependencies
```sh
cd frontend
npm install
cd ../backend
npm install
```
#### Create .env files and config for backend
##### env file
###### Frontend
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SERVER_URL=http://localhost:5050
```
###### Backend

AZURE env isn't needed if you don't care about files.
As of now, azure blob is needed if you want to store files.
- will change later
```env
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database_name>
PERMITTED_ORIGIN=http://localhost:5173
CLERK_WEBHOOK_SECRET=''
CLERK_PEM_FILE=<name>
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_SUBSCRIPTION_ID=
AZURE_STORAGE_ACCOUNT_NAME=
AZURE_STORAGE_CONTAINER_NAME=
```
#### backend/config/CLERK_PEM_FILE
```sh
cd backend/config
touch <name>
```
then add the clerk public key in the config file.
###### ex. touch clerk_key.pem

---
#### Run Frontend & backend
Use command below in frontend and backend to run development part.
```sh
npm run dev
```
---
#### Dockerize backend and run if wanted.
Build the docker image
```sh
docker build -t tagvault-backend .
```
Run docker image
```sh
docker run \
  --env-file .env \
  -v ./config/<name>:/app/config/<name> \
  -p 5050:5050 \
  tagvault-backend:latest
```
