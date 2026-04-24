import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({ url: "file:d:/Doc/database.db" });
  const rs = await client.execute("SELECT * FROM users");
  console.log(rs.rows);
  client.close();
}

main();
