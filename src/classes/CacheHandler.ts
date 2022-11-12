
import { deepClone } from "@tsed/core";
import { getMetadataArgsStorage } from "typeorm";
import { isEmpty } from "../utils/Basic";

export class CacheHandler {
  /** The cache object */
  private static cache: { [key: string]: { [key: string]: any } } = {};
  /** Object holding dependancies for each cache entry */
  private static dependancies: { [key: string]: Set<string> } = {};
  /** Object holding needed relations for each cache entry*/
  private static related: { [key: string]: Set<string> } = {};
  /** Object holding timeouts for caches */
  private static timeouts: { [name: string]: { [argsName: string]: any } } = {};

  public static initCache(name: string, dependsOn: Function[]) {
    // initiate the CacheHandler
    this.init();

    // set the cache object
    this.cache[name] = {};

    // set the cache timeouts
    this.timeouts[name] = {};

    // add the entity to dependancies of all entitiess it depends on
    for (let dep of dependsOn) {
      // create an empty Set if it was not done yet
      if (!this.dependancies[dep.name]) this.dependancies[dep.name] = new Set<string>();
      // add the dependancy
      this.dependancies[dep.name].add(name);
    }
  }

  public static setCache(name: string, value: any, args?: any[]): void {
    // throw an error if cache was not initialized
    if (!this.cache[name]) throw `cache ${name} not initialized`;

    // set the cache as a deep clone of the received value
    this.cache[name][this.argsToName(args)] = deepClone(value);

    // update the timeout for the cache
    this.updateTimeout(name, args);
  }

  public static getCache(name: string, args?: any[]): any {
    // return undefined if no cache was found
    if (!this.cache[name]) return undefined;

    // get a deep clone of the cache
    const result = deepClone(this.cache[name][this.argsToName(args)]);

    // update the timeout as the cached data was requested
    this.updateTimeout(name, args);

    // return the cached data
    return result;
  }

  public static onChange(entity: string, isDelete?: boolean, entitiesRan: string[] = []) {
    // Do nothing if the entity was already handled
    if (entitiesRan.includes(entity)) return;

    // add entity to already completed ones
    entitiesRan.push(entity);

    // get all entities that depend on the changed entity
    const dependers = this.dependancies[entity];
    if (!isEmpty(dependers)) {
      for (const depender of dependers) {
        // clear any cache set
        if (this.cache[depender]) this.cache[depender] = {};

        // clear any timeouts set
        for (const argsName in this.timeouts[depender]) clearTimeout(this.timeouts[depender][argsName]);
      }
    }

    // run the function for all related entities if this was a delete 
    if (isDelete && !isEmpty(this.related[entity])) this.related[entity].forEach(r => this.onChange(r, isDelete, entitiesRan));
  }

  private static argsToName(args?: any[]): string {
    // return default if no args were provided
    if (!args || isEmpty(args)) return 'default';

    // return all args provided joined by underscore
    return args.join('_');
  }

  /** Was the  cache handler already initiated */
  private static initiated: boolean = false;
  public static init() {
    // do nothing if CacheHandler was already initiated
    if (this.initiated) return;

    // set initiated to true so that we dont get overriden data
    this.initiated = true;

    for (const rel of getMetadataArgsStorage().relations) {
      // skip if entity has no onDelete, no onUpdate and no cascades set
      if (isEmpty(rel.options.onDelete) && isEmpty(rel.options.onUpdate) && isEmpty(rel.options.cascade)) continue;

      // get the name of the entity. relation can be retrieved from type where it is either a string or a function returning the entity
      const name = (typeof rel.type == "string") ? rel.type : ((rel.type as Function)()).name;

      // get target name
      const target = typeof rel.target == "string" ? rel.target : rel.target.name;

      // ignore dirrect parent child relations
      if (target == name) continue;

      // set relation as empty set if it was not set already
      if (!this.related[name]) this.related[name] = new Set<string>();
      
      // add the entry to the relations
      this.related[name].add(target);
    }
  }

  private static updateTimeout(name: string, args?: any[]) {
    const nameArgs = this.argsToName(args);
    // clear any previous timeout if set
    if (this.timeouts[name][nameArgs]) clearTimeout(this.timeouts[name][nameArgs]);

    // set new timeout for cache removal in 1 hour ( 60 * 60 * 100 )
    this.timeouts[name][nameArgs] = setTimeout(() => delete this.cache[name][nameArgs], 3600000);
  }
}