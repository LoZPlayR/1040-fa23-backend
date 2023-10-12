import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Counter, Disable, Feed, Post, Timer, User, WebSession } from "./app";
import { PostDoc } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
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
    await Timer.delete(user);
    await Counter.delete(user);
    await Feed.delete(user);
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
  async createPost(session: WebSessionDoc, content: string, message: string) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, message);
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

  // Combine with Timer in a 'get stats' function
  // @Router.get("/counters/:owner")
  // async getCount(owner: ObjectId) {
  //   const count = await Counter.getCountByOwner(owner);
  //   return { msg: count.msg, counter: count.count };
  // }

  // Delete Counters with Timers
  // @Router.delete("/counters/:owner")
  // async deleteCounter(owner: ObjectId) {
  //   const count = await Counter.delete(owner);
  //   return { msg: count.msg };
  // }

  // No need to get all counter vals at once
  // @Router.get("/counters")
  // async getCounters() {
  //   return await Counter.getCounters();
  // }

  // Counter and timer always reset together - no reason to separate the functions
  // @Router.patch("/counters/:_id")
  // async incCounters(owner: ObjectId, amount: number) {
  //   return await Counter.increment(owner, amount ? amount : 1);
  // }

  // Timer gets created with feed
  // @Router.post("/timers")
  // async createTimer() {
  //   const created = await Timer.create();
  //   return { msg: created.msg, timer: created.timer };
  // }

  // Sync with counter in a 'get stats' function
  // @Router.get("/timers/:owner")
  // async getTime(owner: ObjectId) {
  //   return Timer.getTimeByOwner(owner);
  // }

  // Delete Timer with feed.
  // @Router.delete("/timers/:owner")
  // async deleteTimer(owner: ObjectId) {
  //   return await Timer.delete(owner);
  // }

  // No need to get all timer values
  // @Router.get("/timers")
  // async getTimers() {
  //   return await Timer.getTimers();
  // }

  @Router.post("/feed")
  async createFeed(session: WebSessionDoc) {
    const owner = WebSession.getUser(session);
    const created = await Feed.create(owner);
    await Counter.create(owner);
    await Timer.create(owner);
    return created;
  }

  @Router.patch("/feed")
  async getNext(session: WebSessionDoc) {
    const owner = WebSession.getUser(session);
    await Feed.isNonempty(owner);
    const nextContent = await Feed.getNext(owner);
    await Counter.increment(owner, 1);
    return nextContent;
  }

  @Router.patch("/feed/queue")
  async expandFeed(session: WebSessionDoc, numItems: number) {
    const owner = WebSession.getUser(session);
    const items: Array<ObjectId> = [];
    const seen = (await Feed.getSeenContent(owner)).seen;
    const posts = await Post.getPosts({ _id: { $nin: seen } });

    for (let i = 0; i < Number(numItems); i++) {
      if (posts.length === 0) {
        break;
      }
      const ind = Math.floor(Math.random() * posts.length);
      items.push(posts[ind]._id);
      posts.splice(ind, 1);
    }

    const expFeed = Feed.addToFeed(owner, items);
    return expFeed;
  }

  @Router.get("/feed/stats")
  async getStats(session: WebSessionDoc) {
    const owner = WebSession.getUser(session);
    const count = await Counter.getCountByOwner(owner);
    const time = await Timer.getTimeByOwner(owner);
    return { msg: "Stats computed successfully!", count: count.count, time: time.time };
  }

  @Router.patch("/feed/stats")
  async resetStats(session: WebSessionDoc) {
    const owner = WebSession.getUser(session);
    await Counter.resetByOwner(owner);
    await Timer.resetByOwner(owner);
    return { msg: "Successfully reset stats! " };
  }

  // Delete Feed with User
  // @Router.delete("/feed/owner:")
  // async deleteFeed(owner: ObjectId) {
  //   return await Feed.delete(owner);
  // }

  // No need to get all feeds
  // @Router.get("/feed")
  // async getAllFeeds() {
  //   const nextContent = Feed.getFeeds();
  //   return nextContent;
  // }

  @Router.post("/disable/:_id")
  async disableObject(_id: ObjectId) {
    const locked = await Disable.lock(_id);
    return locked;
  }

  @Router.delete("/disable/:_id")
  async enableObject(_id: ObjectId) {
    const unlocked = await Disable.unlock(_id);
    return unlocked;
  }

  @Router.get("/disable/:_id")
  async checkObject(_id: ObjectId) {
    const lockState = await Disable.isLocked(_id);
    return lockState;
  }
}

export default getExpressRouter(new Routes());
