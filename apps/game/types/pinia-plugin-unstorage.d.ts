import 'pinia'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?:
      | boolean
      | {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          storage?: string
          paths?: string[]
          serializer?: {
            serialize: (value: any) => string
            deserialize: (value: string) => any
          }
        }
=======
=======
>>>>>>> Stashed changes
        storage?: string
        paths?: string[]
        serializer?: {
          serialize: (value: any) => string
          deserialize: (value: string) => any
        }
      }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  }
}
