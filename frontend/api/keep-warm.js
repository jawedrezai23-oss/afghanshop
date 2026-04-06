export default function handler(req, res) {
  // Dieser Endpunkt macht nichts anderes, als "OK" zu sagen,
  // damit der Server kurz hochfährt.
  console.log("Wake up, AfghanShop! Cron-Job ausgeführt.");
  
  res.status(200).json({ 
    success: true, 
    message: "Server is warm!",
    timestamp: new Date().toISOString() 
  });
}