const jwt = require("jsonwebtoken");

const JWT_SECRET = "seu_segredo";

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.usuarioId = decoded.id; // 🔥 ESSENCIAL
    next();

  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};