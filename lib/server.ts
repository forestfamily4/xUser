import express from "express";
import axios from "axios";

export class Server {
  private app: express.Express;
  private now: number;
  constructor(private host: string) {
    this.app = express();
    this.now = new Date().getTime();
    this.app.get("/", (req, res) => {
      res.send("ok");
    });
  }
  public start() {
    const port = process.env.PORT || 4000
    this.app.listen(port).on("listening", () => {
      console.log(`server started on ${port}`);
    })
  }
}
