import serverless from 'serverless-http';
import app, { connectDB } from '../app.js';

const handle = serverless(app);

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false; // jangan tunggu koneksi Mongo yang tetap terbuka
  await connectDB();
  return handle(event, context);
};
