const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "appointments.db");

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:["'self'"],
      scriptSrc:["'self'"],
      styleSrc:["'self'","'unsafe-inline'"],
      imgSrc:["'self'","https:","data:"],
      connectSrc:["'self'"],
      fontSrc:["'self'","https:","data:"],
      objectSrc:["'none'"],
      baseUri:["'self'"],
      formAction:["'self'"],
      frameAncestors:["'none'"],
      upgradeInsecureRequests:[]
    }
  },
  referrerPolicy:{policy:"strict-origin-when-cross-origin"}
}));

app.use(express.json({limit:"20kb"}));
app.use(express.urlencoded({extended:false, limit:"20kb"}));

const appointmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders:"draft-8",
  legacyHeaders:false,
  message:{error:"Muitas tentativas. Aguarde alguns minutos e tente novamente."}
});

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date,time);
`);

const appointmentSchema = z.object({
  name:z.string().trim().min(2).max(80),
  phone:z.string().trim().min(8).max(25).regex(/^[0-9+() .-]+$/),
  email:z.string().trim().max(160).email().optional().or(z.literal("")),
  service:z.enum([
    "Manicure clássica","Pedicure","Esmaltação em gel",
    "Alongamento em gel","Blindagem","Nail art personalizada"
  ]),
  date:z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  time:z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/),
  notes:z.string().trim().max(400).optional().or(z.literal("")),
  website:z.string().max(0).optional().or(z.literal(""))
});

const insert = db.prepare(`
  INSERT INTO appointments(name,phone,email,service,date,time,notes)
  VALUES(@name,@phone,@email,@service,@date,@time,@notes)
`);

app.post("/api/appointments", appointmentLimiter, (req,res)=>{
  const parsed = appointmentSchema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:"Confira os campos do formulário."});

  const data = parsed.data;
  if(data.website) return res.status(400).json({error:"Solicitação inválida."});

  const requested = new Date(`${data.date}T${data.time}:00`);
  if(Number.isNaN(requested.getTime()) || requested < new Date()){
    return res.status(400).json({error:"Escolha uma data e horário futuros."});
  }

  const exists = db.prepare("SELECT id FROM appointments WHERE date=? AND time=?").get(data.date,data.time);
  if(exists) return res.status(409).json({error:"Esse horário já foi solicitado. Escolha outro horário."});

  insert.run({
    ...data,
    email:data.email || null,
    notes:data.notes || null
  });

  res.status(201).json({ok:true,message:"Pedido de agendamento recebido! Em breve confirmaremos seu horário."});
});

let reviewsCache = { expires:0, data:null };
app.get("/api/reviews", async (req,res)=>{
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if(!key || !placeId) return res.status(503).json({configured:false, message:"Avaliações Google ainda não configuradas."});
  if(reviewsCache.data && Date.now() < reviewsCache.expires) return res.json(reviewsCache.data);
  try{
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,{
      headers:{
        "X-Goog-Api-Key":key,
        "X-Goog-FieldMask":"id,displayName,rating,userRatingCount,reviews,googleMapsUri"
      }
    });
    if(!response.ok) return res.status(502).json({configured:true,error:"Não foi possível consultar as avaliações agora."});
    const place = await response.json();
    const data = {
      configured:true,
      name:place.displayName?.text || "Grazi Nails",
      rating:place.rating || null,
      count:place.userRatingCount || 0,
      mapsUrl:place.googleMapsUri || "",
      reviews:(place.reviews || []).map(r=>({
        author:r.authorAttribution?.displayName || "Cliente Google",
        photo:r.authorAttribution?.photoUri || "",
        rating:r.rating || 0,
        text:r.text?.text || "",
        relativeTime:r.relativePublishTimeDescription || ""
      }))
    };
    reviewsCache={data,expires:Date.now()+5*60*1000};
    res.json(data);
  }catch(error){
    res.status(502).json({configured:true,error:"Falha temporária ao consultar o Google."});
  }
});

app.get("/api/health",(req,res)=>res.json({ok:true}));

app.use(express.static(path.join(__dirname,"..","public"), {
  extensions:["html"],
  maxAge:"1h"
}));

app.use((req,res)=>res.status(404).sendFile(path.join(__dirname,"..","public","404.html")));

app.listen(PORT,HOST,()=>console.log(`Grazi Nails online em http://localhost:${PORT}`));
