import { isSubscription } from './utils'
import { SubscriptionLike } from 'rxjs'

export type SubscriptionOrEventListener =
  | SubscriptionLike
  | { ref: HTMLElement; eventProp: string }

export type RegisterFn = (sub: SubscriptionOrEventListener) => void

export function registry(): { register: RegisterFn; destroy: VoidFunction } {
  const subs: SubscriptionOrEventListener[] = []

  return {
    register(sub: SubscriptionOrEventListener) {
      subs.push(sub)
    },
    destroy() {
      subs.forEach((sub) => {
        if (isSubscription(sub)) {
          sub.unsubscribe()
        } else if (sub.ref && sub.eventProp) {
          // @ts-expect-error
          sub.ref[sub.eventProp] = null
        }
      })
    },
  }
}
