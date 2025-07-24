import { formidable } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = formidable({ multiples: false });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).json({ error: 'Error parsing the form data' });
      }

      const uploadedFile = files.file; // "file" is the key in formData

      if (!uploadedFile) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Read file as buffer (optional)
      const fileContent = fs.readFileSync(uploadedFile.filepath);
      console.log("Uploaded file name:", uploadedFile.originalFilename);

      // Do something with the fileContent (like generating a quiz)

      res.status(200).json({ message: 'File uploaded successfully' });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
