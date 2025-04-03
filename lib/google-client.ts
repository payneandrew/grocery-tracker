import vision from "@google-cloud/vision";

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);

export const googleClient = new vision.ImageAnnotatorClient({
  credentials,
  projectId: credentials.project_id,
});
