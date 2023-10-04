import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Counter, Feed, /*Friend,*/ Post, Timer, User, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  // A lot used for testing - will be deleted in final version
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, message: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, message, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.post("/counters")
  async createCounter() {
    const created = await Counter.create();
    return { msg: created.msg, counter: created.counter };
  }

  @Router.get("/counters/:_id")
  async getCount(_id: ObjectId) {
    const count = await Counter.getCountById(_id);
    return { msg: count.msg, counter: count.count };
  }

  @Router.delete("/counters/:_id")
  async deleteCounter(_id: ObjectId) {
    const count = await Counter.delete(_id);
    return { msg: count.msg };
  }

  @Router.get("/counters")
  async getCounters() {
    return await Counter.getCounters();
  }

  @Router.patch("/counters/:_id")
  async incCounters(_id: ObjectId, amount: number) {
    return await Counter.increment(_id, amount ? amount : 1);
  }

  @Router.post("/timers")
  async createTimer() {
    const created = await Timer.create();
    return { msg: created.msg, timer: created.timer };
  }

  @Router.get("/timers/:_id")
  async getTime(_id: ObjectId) {
    const time_ = await Timer.getTimeById(_id);
    return { msg: time_.msg, time: time_.time };
  }

  @Router.delete("/timers/:_id")
  async deleteTimer(_id: ObjectId) {
    return await Timer.delete(_id);
  }

  @Router.get("/timers")
  async getTimers() {
    return await Timer.getTimers();
  }

  @Router.post("/feed/owner:")
  async createFeed(owner: ObjectId) {
    const created = await Feed.create(owner);
    return created;
  }

  @Router.get("/feed/owner:")
  async getNext(owner: ObjectId) {
    const nextContent = Feed.getNext(owner);
    return nextContent;
  }

  @Router.patch("/feed/owner:")
  async expandFeed(owner: ObjectId, numItems: number) {
    const items: Array<ObjectId> = [];
    const posts = await Post.getPosts({});
    console.log(numItems);
    for (let i = 0; i < Number(numItems); i++) {
      items.push(posts[i]._id);
    }
    console.log(items);
    const expFeed = Feed.addToFeed(owner, items);
    return expFeed;
  }

  @Router.delete("/feed/owner:")
  async deleteFeed(owner: ObjectId) {
    return await Feed.delete(owner);
  }

  @Router.get("/feed")
  async getAllFeeds() {
    const nextContent = Feed.getFeeds();
    return nextContent;
  }
}

export default getExpressRouter(new Routes());
