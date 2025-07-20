docker run \
  --env-file .env \
  -v ./config/clerk_key.pem:/app/config/clerk_key.pem \
  -p 5050:5050 \
  tagvault-backend:latest
