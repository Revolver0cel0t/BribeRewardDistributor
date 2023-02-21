import * as admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const serviceAccount = {
  type: process.env.NEXT_PUBLIC_SERVICE_TYPE,
  project_id: process.env.NEXT_PUBLIC_SERVICE_PROJECT_ID,
  private_key_id: process.env.NEXT_PUBLIC_SERVICE_PRIVATE_KEY_ID,
  private_key: process.env.NEXT_PUBLIC_SERVICE_PRIVATE_KEY,
  client_email: process.env.NEXT_PUBLIC_SERVICE_CLIENT_EMAIL,
  client_id: process.env.NEXT_PUBLIC_SERVICE_CLIENT_ID,
  auth_uri: process.env.NEXT_PUBLIC_SERVICE_AUTH_URI,
  token_uri: process.env.NEXT_PUBLIC_SERVICE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.NEXT_PUBLIC_SERVICE_AUTH_CERT_URL,
  client_x509_cert_url: process.env.NEXT_PUBLIC_SERVICE_CLIENT_CERT_URL,
};

export { admin, serviceAccount };
