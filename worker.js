export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /api/store - ดึงข้อมูลทั้งหมด
      if (path === "/api/store" && request.method === "GET") {
        const settings = await env.DB.prepare(
          "SELECT * FROM settings WHERE id = 1"
        ).first();

        const products = await env.DB.prepare(
          "SELECT * FROM products ORDER BY id"
        ).all();

        return new Response(
          JSON.stringify({
            settings: settings || {
              id: 1,
              name: "NEXORA",
              tagline: "DIGITAL STORE",
              bannerLabel: "WELCOME TO",
              announcement: "",
              footerNote: ""
            },
            products: products.results || []
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // POST /api/store - บันทึกข้อมูล
      if (path === "/api/store" && request.method === "POST") {
        const body = await request.json();
        const { settings, products } = body;

        // Update settings
        if (settings) {
          await env.DB.prepare(
            `UPDATE settings
             SET name = ?, tagline = ?, bannerLabel = ?, announcement = ?, footerNote = ?
             WHERE id = 1`
          ).bind(
            settings.name || "NEXORA",
            settings.tagline || "DIGITAL STORE",
            settings.bannerLabel || "WELCOME TO",
            settings.announcement || "",
            settings.footerNote || ""
          ).run();
        }

        // Replace products
        if (Array.isArray(products)) {
          await env.DB.prepare("DELETE FROM products").run();

          for (const product of products) {
            await env.DB.prepare(
              `INSERT INTO products
               (id, name, category, categoryLabel, desc, price, symbol, cover, imageUrl, badge)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
              product.id,
              product.name,
              product.category,
              product.categoryLabel,
              product.desc,
              product.price || 0,
              product.symbol,
              product.cover,
              product.imageUrl || "",
              product.badge
            ).run();
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: "บันทึกข้อมูลสำเร็จ" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // POST /api/login - ตรวจสอบตัวตน
      if (path === "/api/login" && request.method === "POST") {
        const body = await request.json();
        const { email, password } = body;

        // ตรวจสอบ credentials
        if (email === "admin" && password === "1234") {
          return new Response(
            JSON.stringify({
              success: true,
              user: {
                id: "admin",
                email: "admin",
                role: "admin"
              }
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ไม่พบ endpoint
      return new Response(
        JSON.stringify({ error: "Not Found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }
};
