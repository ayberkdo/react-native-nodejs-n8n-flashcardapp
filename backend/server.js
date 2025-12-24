import 'dotenv/config';
import app from "./src/app.js";

const PORT = 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Backend aktif: http://${HOST}:${PORT}`);
});
