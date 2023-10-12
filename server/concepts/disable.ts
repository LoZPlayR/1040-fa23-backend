import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface DisableDoc extends BaseDoc {
  disabled: ObjectId;
}

export default class DisableConcept {
  public readonly locks = new DocCollection<DisableDoc>("locks");

  async lock(concept: ObjectId) {
    console.log("Test2");
    const _id = await this.locks.createOne({ disabled: concept });
    console.log("test");
    return { msg: `${concept} successfully locked!`, lock: await this.locks.readOne({ _id }) };
  }

  async isLocked(concept: ObjectId) {
    const _id = await this.locks.readOne({ disabled: concept });
    let locked = true;

    if (!_id) {
      locked = false;
    }

    return { msg: `${concept} is${!locked ? "n't" : ""} locked!`, lockState: locked };
  }

  async unlock(concept: ObjectId) {
    const _id = await this.locks.deleteOne({ disabled: concept });
    if (!_id) {
      throw new NotFoundError("Object with that ID is not locked!");
    }
    return { msg: `${concept} was successfully unlocked!` };
  }
}
