import {
  TwitterOpenApi,
  TwitterOpenApiClient,
} from "twitter-openapi-typescript";
import { env } from "../util";
import { login } from "./login";
import { ActivityType, Client, EmbedBuilder } from "discord.js";
import { runAI } from "../ai/api";

export class Twitter {
  private client: TwitterOpenApiClient | null = null;
  private interval = 7 * 60 * 60 * 1000;
  private timer: NodeJS.Timeout | null = null;
  constructor() { }
  public async login() {
    return getApiClientFromEmailAndPassword(
      // env("email"),
      // env("user"),
      // env("password"),
      "",
      "",
      "",
      () => env("code")
    ).then(client => {
      this.client = client
    })
  }
  public async getTweets(userid: string) {
    if (this.client === null) { return; }
    const user = await this.getUser(userid)
    if (!user?.user) { return undefined }
    return (await this.client.getTweetApi().getUserTweets({ "userId": user.user.restId, "count": 10 })).data.data
  }
  public async getUser(userid: string) {
    if (this.client === null) {
      return undefined;
    }
    if (userid.match(/^[0-9]+$/) !== null) {
      const data = (await this.client.getUserApi().getUserByRestId({ "userId": userid })).data
      return data
    } else if (userid.match(/^[a-zA-Z0-9_]+$/) !== null) {
      return (await this.client.getUserApi().getUserByScreenName({ "screenName": userid })).data
    }
  }
  public async startTimer() {
    const exec = async () => {
      console.log("exec")
      const tweets = (await this.client?.getTweetApi().getHomeTimeline({ "count": 20 }))?.data.data
      if (!tweets) { return; }
      for await (const i of tweets.keys()) {
        if(i<18){continue}
        if(i>20){return;}
        const tweet = tweets[i]
        const text = tweet?.tweet.legacy?.fullText
        console.log(text)
        if (!text) { continue; }
        if (text.length < 20) { continue; }
        await new Promise(resolve => setTimeout(resolve, 20*60*1000))
        const res = (await runAI(text))
        const reply = res.content?.slice(0, 200)
        console.log(reply, res.error)
        if (!reply) { continue; }
        if (res?.error) { continue; }
        await this.client?.getPostApi().postCreateTweet({
          "tweetText": `${tweet.tweet.legacy?.entities.urls[0].url}\n${reply}`,
        })
        await new Promise(resolve => setTimeout(resolve, 30000))
      }
      console.log("exec2")
      const tweets2 = (await this.client?.getTweetApi().getHomeTimeline({ "count": 30 }))?.data.data
      if (!tweets2) { return; }
      const res2 = await runAI(tweets2.map((tweet) => tweet.tweet.legacy?.fullText).join("\n"))
      const reply2 = res2.content?.slice(0, 200)
      if (!reply2) { return; }
      if (res2?.error) { return; }
      await this.client?.getPostApi().postCreateTweet({
        "tweetText": reply2,
      })
    }
    exec()
    this.timer = setInterval(exec, this.interval);
  }
  public reloadTimer() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    this.startTimer();
  }
}

const getApiClientFromEmailAndPassword = async (
  email: string,
  username: string,
  password: string,
  authorization?: () => string
) => {
  const api = new TwitterOpenApi();
  //const rclient = await login(email, username, password, authorization);
  return api.getClientFromCookies(
    //rclient.cookie
    // rclient.cookie.ct0 ??
    // (() => {
    //   throw new Error("ct0 is null");
    // })(),
    // rclient.cookie.auth_token ??
    // (() => {
    //   throw new Error("auth_token is null");
    // })()
    {
      "ct0": process.env.CT0 ?? "",
      "auth_token": process.env.AUTH_TOKEN ?? "",
    }
  );
};
