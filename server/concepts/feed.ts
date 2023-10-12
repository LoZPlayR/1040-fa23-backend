import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export class FeedEmptyError extends NotAllowedError {
  constructor() {
    super("This feed is empty");
  }
}

export interface FeedDoc extends BaseDoc {
  owner: ObjectId;
  seen: Array<ObjectId>;
  available: Array<ObjectId>;
}

export default class FeedConcept {
  public readonly feeds = new DocCollection<FeedDoc>("feeds");

  async create(owner: ObjectId) {
    const feedExists = await this.feeds.readOne({ owner });

    if (feedExists !== null) {
      throw new NotAllowedError("Feed for this Owner already exists!");
    }

    const _id = await this.feeds.createOne({ owner, seen: new Array<ObjectId>(), available: new Array<ObjectId>() });
    return { msg: "Feed successfully created!", feed: await this.feeds.readOne({ _id }) };
  }

  async getSeenContent(owner: ObjectId) {
    const feed = await this.feeds.readOne({ owner });
    if (feed === null) {
      throw new NotFoundError(`No feed with owner ${owner}`);
    }
    return { msg: "Feed found!", seen: feed.seen };
  }

  async getNext(owner: ObjectId) {
    const feed = await this.feeds.readOne({ owner });
    if (!feed) {
      throw new NotFoundError(`User ${owner} does not have a feed!`);
    }
    // Get some element from available
    const contentID: ObjectId | undefined = feed.available.pop();

    if (!contentID) {
      throw new NotFoundError(`User ${owner} is out of content!`);
    }

    // Add element to seen
    feed.seen.push(contentID);

    await this.feeds.updateOne({ owner }, feed);

    return { msg: "Content found!", _id: contentID };
  }

  async addToFeed(owner: ObjectId, ids: Array<ObjectId>) {
    const feed = await this.feeds.readOne({ owner });
    if (feed === null) {
      throw new NotFoundError(`User ${owner} does not have a feed!`);
    }
    let count = 0;
    for (const OID of ids) {
      const inSeen = feed.seen.reduce((seen, nextVal) => seen || OID.equals(nextVal), false);
      const inAvailable = feed.available.reduce((seen, nextVal) => seen || OID.equals(nextVal), false);
      if (!inSeen && !inAvailable) {
        count += 1;
        feed.available.push(OID);
      }
    }
    await this.feeds.updateOne({ owner }, feed);
    return { msg: `Added ${count} items to feed!` };
  }

  async delete(owner: ObjectId) {
    await this.feeds.deleteOne({ owner });
    return { msg: "Deleted Feed successfully!" };
  }

  async getFeeds() {
    return await this.feeds.readMany({});
  }

  async isNonempty(owner: ObjectId) {
    const feed = await this.feeds.readOne({ owner });

    if (feed === null) {
      throw new NotFoundError(`User ${owner} does not have a feed!`);
    }

    if (feed.available.length === 0) {
      throw new FeedEmptyError();
    }

    return { msg: `Feed has ${feed.available.length} items left!`, count: feed.available.length };
  }
}
