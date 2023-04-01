import * as localForage from "localforage";
import { defaultStoreKey } from "./constants";

export default class OpenLoginStore {
  // eslint-disable-next-line no-use-before-define
  private static instance: OpenLoginStore;

  private internalStore = this.createInternalStore();

  private constructor(private currentStoreKey: string = defaultStoreKey) {}

  public static getInstance(storeNamespace: string, _ignoredStorageKey: "session" | "local" = "local"): OpenLoginStore {
    if (!this.instance) {
      const finalStoreKey = storeNamespace ? `${defaultStoreKey}_${storeNamespace}` : defaultStoreKey;
      this.instance = new this(finalStoreKey);
    }
    return this.instance;
  }

  public async getStore(): Promise<Record<string, unknown>> {
    const allKeys = await this.internalStore.keys();
    const entries = await Promise.all(
      allKeys.map(async (key) => {
        return [key, await this.internalStore.getItem(key)];
      })
    );

    return Object.fromEntries(entries);
  }

  public async get<T>(key: string): Promise<T> {
    return this.internalStore.getItem(this.currentStoreKey);
  }

  public set<T>(key: string, value: T): void {
    this.internalStore.setItem(key, value);
  }

  public async clearStore() {
    await this.internalStore.clear();
    this.internalStore = this.createInternalStore();
  }

  private createInternalStore(): LocalForage {
    return localForage.createInstance({
      storeName: this.currentStoreKey,
    });
  }
}
