import 'pinia';

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?:
      | boolean
      | {
          storage?: string;
          paths?: string[];
          serializer?: {
            serialize: (value: any) => string;
            deserialize: (value: string) => any;
          };
        };
  }
}
