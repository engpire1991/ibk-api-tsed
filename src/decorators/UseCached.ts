import { decoratorTypeOf, DecoratorTypes, getConstructor } from "@tsed/core";
import { CacheHandler } from "../classes/CacheHandler";
import { isEmpty } from "../utils/Basic";

export function UseCached(...dependers: Function[]): Function {
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) => {
    // get the type of the decorator based on how it is used
    const type = decoratorTypeOf([target, propertyKey, descriptor]);

    // throw error i decorator type is not method
    if (type != DecoratorTypes.METHOD) throw new Error("UseCached is only supported on methods");

    // get constructor
    const targetConstructor = getConstructor(target);

    // prepare unique name
    const name = `${targetConstructor.name}-${propertyKey}`;

    // initiate the cache
    if (!dependers.includes(targetConstructor)) dependers.push(targetConstructor);

    // initiate the entity cache
    CacheHandler.initCache(name, dependers);

    // update the function to return Cached data if any exists
    const original = descriptor.value as Function;
    descriptor.value = function (...args: any[]) {
      // get cache args based on args
      const cacheArgs = args.filter(a => ['string', 'number', 'boolean'].includes(typeof a));

      // check if cache exists
      const cached = CacheHandler.getCache(name, cacheArgs);

      // return cached items if found
      if (!isEmpty(cached)) return cached;

      // cached data not found, lets get and set
      // call the original function
      const ret = original.apply(this, args);
      if (!(ret instanceof Promise)) {
        // function is not a promise, so we can dirrectly set the cache
        CacheHandler.setCache(name, ret, cacheArgs);
        return ret;
      }

      // function returns Promise, so we will handle it as such
      return new Promise((resolve, reject) => {
        ret.then(d => {
          // set the result to cache if it was not empty
          if (!isEmpty(d)) CacheHandler.setCache(name, d, cacheArgs);

          // resolve the value
          resolve(d);
        })
        .catch(err => reject(err));
      });
    }
    return descriptor;
  }
}