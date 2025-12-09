import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "projeto_bd",
  password: "senha",
  port: 5432,
});

pool.connect()
  .then(() => console.log("✅ Conectado ao PostgreSQL"))
  .catch(err => console.error("❌ Erro de conexão:", err));

export default pool;
