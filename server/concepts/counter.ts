import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface CounterDoc extends BaseDoc {
  count: number;
}

export default class CounterConcept {
  public readonly counters = new DocCollection<CounterDoc>("counters");

  async create() {
    const _id = await this.counters.createOne({ count: 0 });
    return { msg: "Counter successfully created!", counter: await this.counters.readOne({ _id }) };
  }

  async getCountById(_id: ObjectId) {
    const counter = await this.counters.readOne({ _id });
    if (!counter) {
      throw new NotFoundError("Counter does not exist!");
    }
    return { msg: "Count successfully found!", count: counter.count };
  }

  async getCounters() {
    return await this.counters.readMany({});
  }

  async delete(_id: ObjectId) {
    await this.counters.deleteOne({ _id });
    return { msg: "Counter successfully deleted!" };
  }

  async increment(_id: ObjectId, amount: number) {
    const currCounter = await this.counters.readOne({ _id });
    if (!currCounter) {
      throw new NotFoundError("Counter not found! :(");
    }

    const currCount = Number(currCounter.count);

    const updateDoc = {
      count: currCount + Number(amount),
    };

    await this.counters.updateOne({ _id }, updateDoc);

    return { msg: "Counter successfully incremented!" };
  }
}
