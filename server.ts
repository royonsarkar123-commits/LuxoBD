import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import SSLCommerzPayment from "sslcommerz-lts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // SSLCommerz Configuration
  const store_id = process.env.SSLCOMMERZ_STORE_ID || "test_store_id";
  const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || "test_store_password";
  const is_live = process.env.SSLCOMMERZ_IS_LIVE === "true";

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // SSLCommerz Initialization
  app.post("/api/payment/init", async (req, res) => {
    const { total_amount, cus_name, cus_email, cus_add1, cus_city, cus_postcode, cus_country, cus_phone, shipping_method, product_name, product_category, product_profile } = req.body;

    const tran_id = `TRAN_${Date.now()}`;
    const data = {
      total_amount: total_amount,
      currency: "BDT",
      tran_id: tran_id,
      success_url: `${process.env.APP_URL}/api/payment/success?tran_id=${tran_id}`,
      fail_url: `${process.env.APP_URL}/api/payment/fail?tran_id=${tran_id}`,
      cancel_url: `${process.env.APP_URL}/api/payment/cancel?tran_id=${tran_id}`,
      ipn_url: `${process.env.APP_URL}/api/payment/ipn`,
      shipping_method: shipping_method || "Courier",
      product_name: product_name || "Luxury Item",
      product_category: product_category || "Fashion",
      product_profile: product_profile || "general",
      cus_name: cus_name,
      cus_email: cus_email,
      cus_add1: cus_add1,
      cus_city: cus_city,
      cus_postcode: cus_postcode || "1000",
      cus_country: cus_country || "Bangladesh",
      cus_phone: cus_phone,
      ship_name: cus_name,
      ship_add1: cus_add1,
      ship_city: cus_city,
      ship_state: cus_city,
      ship_postcode: cus_postcode || "1000",
      ship_country: cus_country || "Bangladesh",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    sslcz.init(data).then((apiResponse: any) => {
      let GatewayPageURL = apiResponse.GatewayPageURL;
      res.send({ url: GatewayPageURL, tran_id: tran_id });
    }).catch((error: any) => {
      console.error("SSLCommerz Init Error:", error);
      res.status(500).send({ error: "Payment initialization failed" });
    });
  });

  // Payment Callbacks
  app.post("/api/payment/success", (req, res) => {
    const { tran_id } = req.query;
    // In a real app, you would update the order status in Firestore here
    // But since we are client-side focused, we redirect back to the app with the status
    res.redirect(`/checkout/success?tran_id=${tran_id}`);
  });

  app.post("/api/payment/fail", (req, res) => {
    const { tran_id } = req.query;
    res.redirect(`/checkout/fail?tran_id=${tran_id}`);
  });

  app.post("/api/payment/cancel", (req, res) => {
    const { tran_id } = req.query;
    res.redirect(`/checkout/cancel?tran_id=${tran_id}`);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
