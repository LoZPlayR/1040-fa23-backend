import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface CounterDoc extends BaseDoc {
  count: number;
  owner: ObjectId;
}

export default class CounterConcept {
  public readonly counters = new DocCollection<CounterDoc>("counters");

  async create(owner: ObjectId) {
    const _id = await this.counters.createOne({ count: 0, owner: owner });
    return { msg: "Counter successfully created!", counter: await this.counters.readOne({ _id }) };
  }

  async getCountById(_id: ObjectId) {
    const counter = await this.counters.readOne({ _id });
    if (!counter) {
      throw new NotFoundError("Counter does not exist!");
    }
    return { msg: "Count successfully found!", count: counter.count };
  }

  async getCountByOwner(owner: ObjectId) {
    const counter = await this.counters.readOne({ owner });
    if (!counter) {
      throw new NotFoundError("Counter does not exist!");
    }
    return { msg: "Count successfully found!", count: counter.count };
  }

  async getCounters() {
    return await this.counters.readMany({});
  }

  async delete(owner: ObjectId) {
    await this.counters.deleteOne({ owner });
    return { msg: "Counter successfully deleted!" };
  }

  async increment(owner: ObjectId, amount: number) {
    const currCounter = await this.counters.readOne({ owner });
    if (!currCounter) {
      throw new NotFoundError("Counter not found! :(");
    }

    const currCount = Number(currCounter.count);

    const updateDoc = {
      count: currCount + Number(amount),
    };

    await this.counters.updateOne({ owner }, updateDoc);

    return { msg: "Counter successfully incremented!" };
  }

  async resetByOwner(owner: ObjectId) {
    const count = await this.counters.updateOne({ owner }, { count: 0 });
    return count;
  }
}
