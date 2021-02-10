const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const Tesseract = require("tesseract.js");

const uri =
  process.env.DATABASE_CONNECTION_STRING || "mongodb://localhost:27017";
const uploadDir = process.env.UPLOAD_DIR || "uploadDir";

const upload = async (uploadedFile) => {
  const documentId = uuidv4();
  uploadWork(documentId, uploadedFile);
  return documentId;
};

const uploadWork = async (documentId, uploadedFile) => {
  if (uploadedFile.mimetype.startsWith("image/")) {
    const {
      data: { text },
    } = await Tesseract.recognize(uploadedFile.data, "deu", {
      logger: (m) => console.log(m),
    });

    const recognizedText = text.replace(/\n/g, " ");

    await fs.writeFile(uploadDir + "/" + documentId, uploadedFile.data);

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("local");
    const documentCollection = db.collection("documents");
    await documentCollection.insertOne({
      _id: documentId,
      mimetype: uploadedFile.mimetype,
      originalName: uploadedFile.name,
      recognizedText,
    });

    await client.close();
  } else {
    throw new Error("unsupported file type (" + doc.mimetype + ")");
  }
};

const getDocumentById = async (documentId) => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("local");
  const documentCollection = db.collection("documents");
  const doc = await documentCollection.findOne({
    _id: documentId,
  });

  await client.close();

  return doc;
};

const getDocumentFileById = async (documentId) => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("local");
  const documentCollection = db.collection("documents");
  const doc = await documentCollection.findOne({
    _id: documentId,
  });

  await client.close();

  if (doc) {
    return {
      file: await fs.readFile(uploadDir + "/" + documentId),
      doc,
    };
  }

  return null;
};

module.exports = {
  upload,
  getDocumentById,
  getDocumentFileById,
};
