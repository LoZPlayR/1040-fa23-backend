import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface TimerDoc extends BaseDoc {
  time: Date;
  owner: ObjectId;
}

export default class TimerConcept {
  public readonly timers = new DocCollection<TimerDoc>("timers");

  async create(owner: ObjectId) {
    const _id = await this.timers.createOne({ time: new Date(), owner: owner });
    return { msg: "Timer successfully created!", timer: await this.timers.readOne({ _id }) };
  }

  async getTimeById(_id: ObjectId) {
    const timer = await this.timers.readOne({ _id });
    if (!timer) {
      throw new NotFoundError("Timer does not exist!");
    }
    const currTime = new Date();
    return { msg: "Time successfully found!", time: (currTime.getTime() - timer.time.getTime()) / 1000 };
  }

  async getTimeByOwner(owner: ObjectId) {
    const timer = await this.timers.readOne({ owner });
    if (!timer) {
      throw new NotFoundError("Timer does not exist!");
    }
    const currTime = new Date();
    return { msg: "Time successfully found!", time: (currTime.getTime() - timer.time.getTime()) / 1000 };
  }

  async getTimers() {
    return await this.timers.readMany({});
  }

  async resetByOwner(owner: ObjectId) {
    const timer = await this.timers.updateOne({ owner }, { time: new Date() });
    return { msg: "Timer successfully reset", timer: timer };
  }

  async delete(owner: ObjectId) {
    await this.timers.deleteOne({ owner });
    return { msg: "Timer successfully deleted!" };
  }
}
