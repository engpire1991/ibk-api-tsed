
import { EventEmitter } from "events";
import { getConnection, QueryRunner } from "typeorm";

interface QueryRunnerExtended extends QueryRunner {
  onCreated?: (cb: () => void) => void;
  onStarted?: (cb: () => void) => void;
  onCommited?: (cb: () => void) => void;
  onRollbacked?: (cb: () => void) => void;
  onReleased?: (cb: () => void) => void;
}

class Events extends EventEmitter { }

export default class QueryTransaction {
  private eventSubscriber = new Events();
  public queryRunner: QueryRunnerExtended;

  constructor(connectionName?: string) {
    this.queryRunner = getConnection(connectionName).createQueryRunner();

    // add required event functions
    this.queryRunner.onCreated = this.onCreated.bind(this);
    this.queryRunner.onStarted = this.onStarted.bind(this);
    this.queryRunner.onCommited = this.onCommited.bind(this);
    this.queryRunner.onRollbacked = this.onRollbacked.bind(this);
    this.queryRunner.onReleased = this.onReleased.bind(this);

    this.eventSubscriber.emit('created');
  }

  public get manager() {
    return this.queryRunner.manager;
  }

  public async start(strict = true): Promise<void> {
    if (strict) {
      if (!this.queryRunner) {
        throw new Error('Query Runner not created');
      }
      if (this.queryRunner.isTransactionActive) {
        throw new Error('Transaction already started. Commit existing transaction before starting a new one');
      }
    }

    if (this.isActive) {
      return;
    }
    await this.queryRunner.startTransaction();
    this.eventSubscriber.emit('started');

  }

  public async commit(strict = true): Promise<void> {
    if (strict) {
      if (!this.queryRunner) {
        throw new Error('Query Runner not created');
      }
      if (!this.queryRunner.isTransactionActive) {
        throw new Error('Transaction was not started. Start a transaction before commiting');
      }
    }

    if (!this.isActive) {
      return;
    }

    await this.queryRunner.commitTransaction();
    this.eventSubscriber.emit('commited');

  }

  public async rollback(strict = true): Promise<void> {
    if (!this.queryRunner && strict) {
      throw new Error('Query Runner not created');
    }
    if (!this.queryRunner.isTransactionActive && strict) {
      throw new Error('Transaction was not started . Start a transaction before rolling it back');
    }
    if (!this.isActive) {
      return;
    }
    await this.queryRunner.rollbackTransaction();
    this.eventSubscriber.emit('rollbacked');

  }

  public async release(strict?: boolean): Promise<void> {
    if (!this.queryRunner && strict) {
      throw new Error('Query Runner not created');
    }
    if (this.queryRunner.isReleased && strict) {
      throw new Error('QueryRunner already released.');
    }
    if (!this.queryRunner || this.queryRunner.isReleased) {
      return;
    }
    await this.queryRunner.release();
    this.eventSubscriber.emit('released');
  }

  public get isActive(): boolean {
    return this.queryRunner && this.queryRunner.isTransactionActive;
  }

  public get isReleased(): boolean {
    return this.queryRunner && this.queryRunner.isReleased;
  }

  public onCreated(cb: () => void): void {
    this.eventSubscriber.once('created', cb);
  }

  public onStarted(cb: () => void): void {
    this.eventSubscriber.once('started', cb);
  }

  public onCommited(cb: () => void): void {
    this.eventSubscriber.once('commited', cb);
  }

  public onRollbacked(cb: () => void): void {
    this.eventSubscriber.once('rollbacked', cb);
  }

  public onReleased(cb: () => void): void {
    this.eventSubscriber.once('released', cb);
  }
}