import { Ref } from '@vue/composition-api'

export type MaybeRef<T> = T | Ref<T>
export type MaybeReadonlyRef<T> = T | Readonly<T>
