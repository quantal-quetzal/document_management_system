const express = require("express");
const fileUpload = require("express-fileupload");
const service = require("./service");
const stream = require("stream");
var mime = require("mime-types");

const PORT = process.env.PORT || 8000;
const app = express();

app.use(fileUpload());

app.get("/", (req, res) =>
  res.send(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Upload Document</title>
</head>
<body>
<form method="POST" action="/upload" enctype="multipart/form-data">
    <input name="document" type="file" />
    <input type="submit" value="Send">
</form>
</body>
</html>
`
  )
);

app.listen(PORT, () => {
  console.log(`⚡️ Server is running at https://localhost:${PORT}`);
});

app.post("/upload", async (req, res) => {
  const doc = req.files.document;
  console.log(doc);
  const documentId = await service.upload(doc);
  res.send({ documentId, url: "http://localhost:8000/document/" + documentId });
});

app.get("/document/:documentId", async (req, res) => {
  const documentId = req.params.documentId;
  res.send(await service.getDocumentById(documentId));
});

app.get("/document/:documentId/file", async (req, res) => {
  const documentId = req.params.documentId;
  const file = await service.getDocumentFileById(documentId);
  const extension = mime.extension(file.doc.mimetype);

  var readStream = new stream.PassThrough();
  readStream.end(file.file);

  res.set(
    "Content-disposition",
    "attachment; filename=" + documentId + "." + extension
  );
  res.set("Content-Type", file.doc.mimetype);

  readStream.pipe(res);
});
