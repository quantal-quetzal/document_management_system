# document_management_system

## Spin up database

```
docker-compose up -d
```

## Run server

```
cd backend
yarn dev
```

## First steps

1. Go to http://localhost:8000
2. Upload an image file with text (like a screenshot of a PDF)
3. Follow the link in the response. Retry after a few seconds if the URL is not available, yet
4. Append `/file` to download the uploaded file again
