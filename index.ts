import { Server } from "./lib/server";
import { Twitter } from "./lib/twitter/twitter";

async function main() {
  process.on("uncaughtException", (err)=>console.log(err));
  const server=new Server("http://localhost:3000")
  const client=new Twitter()
  await client.login()
  client.startTimer()  
} 

main()