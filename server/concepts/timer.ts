import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface TimerDoc extends BaseDoc {
  time: Date;
}

export default class TimerConcept {
  public readonly timers = new DocCollection<TimerDoc>("timers");

  async create() {
    const _id = await this.timers.createOne({ time: new Date() });
    return { msg: "Timer successfully created!", timer: await this.timers.readOne({ _id }) };
  }

  async getTimeById(_id: ObjectId) {
    console.log(_id);
    const timer = await this.timers.readOne({ _id });
    if (!timer) {
      throw new NotFoundError("Timer does not exist!");
    }
    const currTime = new Date();
    return { msg: "Time successfully found!", time: (currTime.getTime() - timer.time.getTime()) / 1000 };
  }

  async getTimers() {
    return await this.timers.readMany({});
  }

  async delete(_id: ObjectId) {
    await this.timers.deleteOne({ _id });
    return { msg: "Timer successfully deleted!" };
  }
}
