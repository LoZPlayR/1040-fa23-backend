import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface FeedDoc extends BaseDoc {
  owner: ObjectId;
  seen: Array<ObjectId>;
  available: Array<ObjectId>;
}

export default class FeedConcept {
  public readonly feeds = new DocCollection<FeedDoc>("content");

  async create(owner: ObjectId) {
    const _id = await this.feeds.createOne({ owner, seen: new Array<ObjectId>(), available: new Array<ObjectId>() });
    return { msg: "Feed successfully created!", feed: await this.feeds.readOne({ _id }) };
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
    if (!feed) {
      throw new NotFoundError(`User ${owner} does not have a feed!`);
    }
    let count = 0;
    for (const OID of ids) {
      if (!feed.seen.includes(OID) && !feed.available.includes(OID)) {
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
}
