import { EventEmitter } from "stream";
import { DeepPartial, DeleteResult, FindConditions, InsertResult, ObjectLiteral, ObjectType, Repository, SelectQueryBuilder, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { isEmpty } from "../utils/Basic";
import QueryTransaction from "../utils/QueryTransaction";

class Events extends EventEmitter { }

export abstract class RepositoryExtender<Entity extends ObjectLiteral> extends Repository<Entity> {

  protected events = new Events();

  protected repoManager(queryTransaction?: QueryTransaction): Repository<Entity> {
    return this.customRepo(this.target, queryTransaction);
  }

  protected customRepo<T>(repo: ObjectType<T> | string, queryTransaction?: QueryTransaction): Repository<T> {
    if (queryTransaction) {
      return queryTransaction.manager.getRepository(repo);
    }
    return this.manager.connection.getRepository(repo);
  }

  protected queryBuilder(alias: string, queryTransaction?: QueryTransaction): SelectQueryBuilder<Entity> {
    return this.repoManager(queryTransaction).createQueryBuilder(alias);
  }

  public async saveOrUpdate(entity: DeepPartial<Entity> & Entity): Promise<Entity>;
  public async saveOrUpdate(entity: DeepPartial<Entity> & Entity, saveOnly?: (keyof Entity)[], queryTransaction?: QueryTransaction): Promise<Entity>;
  public async saveOrUpdate(entity: DeepPartial<Entity> & Entity, queryTransaction?: QueryTransaction): Promise<Entity>;
  public async saveOrUpdate(entity: DeepPartial<Entity> & Entity, saveOnly?: (keyof Entity)[] | QueryTransaction, queryTransaction?: QueryTransaction): Promise<Entity> {
    let event: 'update' | 'new' | undefined;
    let mainKey: string | number | undefined;
    let args: any[] = [];
    if (saveOnly instanceof QueryTransaction){
      queryTransaction = saveOnly;
      saveOnly = undefined;
    }

    try {
      mainKey = this.getId(entity);
      // throw error if primary key is not set and pure update is requested
      if (!mainKey && !isEmpty(saveOnly)) throw new Error('primary key not set in object');

      if (!mainKey || !saveOnly) {
        // handle as save
        const hasId = this.hasId(entity);
        const res = await this.repoManager(queryTransaction).save(entity);
        if (hasId) {
          // entity had an id so this was an update 
          event = 'update';
          args = [mainKey, res, entity['userId']];
        } else if (res) {
          // entity had no id and we received data from DB, so this must be an insert
          event = 'new';
          const forArg = JSON.parse(JSON.stringify(res));

          // delete origs if set
          if (forArg.origs) delete forArg.origs;

          args = [forArg, entity['userId']];
          mainKey = this.repoManager(queryTransaction).getId(res);
        }
        return res;
      }

      // don't do anything if no update keys were provided
      if (saveOnly.length < 1) return entity;

      const save: QueryDeepPartialEntity<Entity> = {};
      // set save keys as the ones provided by user in saveOnly
      saveOnly.forEach(key => save[key] = entity[key]);

      // run the update
      await this.repoManager(queryTransaction).update(mainKey, save);

      // all good, lets update original values in our entity
      event = 'update';
      args = [mainKey, save, entity['userId']];
      return entity;
    } catch (err) {
      event = undefined;
      mainKey = undefined;
      throw err;
    } finally {
      if (event && mainKey) {
        if (queryTransaction instanceof QueryTransaction && queryTransaction.isActive) {
          queryTransaction.onCommited(() => {
            this.events.emit(event as string, ...args);
          });
        } else {
          this.events.emit(event, ...args);
        }
      }
    }
  }

  public async insertMany(entity: (DeepPartial<Entity> & Entity)[], queryTransaction?: QueryTransaction): Promise<InsertResult> {
    // make base manager save
    const results = await this.repoManager(queryTransaction).insert(entity);
    return results;
  }

  public async update(mainKey: number | string | FindConditions<Entity>, params: Partial<Entity>, queryTransaction?: QueryTransaction): Promise<UpdateResult> {
    let event = 'update';
    let args: any[] = [];
    let hadError = false;
    try {
      const res = await this.repoManager(queryTransaction).update(mainKey, params);
      args = [mainKey, params, params['userId']];
      return res;
    } catch (err) {
      hadError = true;
      args = [];
      throw err;
    } finally {
      if (!hadError) {
        if (queryTransaction instanceof QueryTransaction && queryTransaction.isActive) {
          queryTransaction.onCommited(() => {
            this.events.emit(event, ...args);
          });
        } else {
          this.events.emit(event, ...args);
        }
      }
    }
  }

  public async removeEntity(entity: DeepPartial<Entity> & Entity, queryTransaction?: QueryTransaction): Promise<Entity> {
    let mainKey: string | number | undefined;
    let event: 'delete' | undefined;
    let args: any[] | undefined;

    try {
      mainKey = this.repoManager(queryTransaction).getId(entity);

      // throw error if primary key is not set
      if (!mainKey) throw new Error('primary key not set in object');

      const result = await this.repoManager(queryTransaction).remove(entity);
      args = [mainKey, entity, entity['userId']];
      return result;
    } catch (err) {
      mainKey = undefined;
      args = undefined;
      throw err;
    } finally {
      if (event && args) {
        if (queryTransaction instanceof QueryTransaction && queryTransaction.isActive) {
          queryTransaction.onCommited(() => {
            this.events.emit(event as string, ...args as any[]);
          });
        } else {
          this.events.emit(event, ...args);
        }
      }
    }
  }

  public delete(mainKey: string | number, queryTransaction?: QueryTransaction): Promise<DeleteResult> {
    if (!mainKey) throw new Error('primary key not set in object');
    
    let hasError = false;

    try {
      return this.repoManager(queryTransaction).delete(mainKey);
    } catch (err) {
      hasError = true;
      throw err;
    } finally {
      if (!hasError) {
        if (queryTransaction instanceof QueryTransaction && queryTransaction.isActive) {
          queryTransaction.onCommited(() => {
            this.events.emit('delete', mainKey);
          });
        } else {
          this.events.emit('delete', mainKey);
        }
      }
    }
  }

  // Event handlers
  protected onEvent(name: string, cb: (...args: any[]) => void, once?: boolean) {
    if (once) {
      this.events.once(name, cb);
    } else {
      this.events.on(name, cb);
    }
  }

  public onNew(cb: (entity?: DeepPartial<Entity>, userId?: number) => void, once?: boolean) {
    this.onEvent('new', cb, once);
  }

  public onUpdate(cb: (key?: any, changed?: Partial<Entity>, userId?: number) => void, once?: boolean) {
    this.onEvent('update', cb, once);
  }

  public onDelete(cb: (primKey: any, delted?: Partial<Entity>, userId?: number) => void, once?: boolean) {
    this.onEvent('delete', cb, once);
  }
}