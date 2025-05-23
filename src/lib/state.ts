import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs'

export class State<T> extends BehaviorSubject<T> {
  constructor(initialVal: T) {
    super(initialVal)
  }

  set(newValOrFn: T | ((prevState: T) => T)) {
    if (isSetFn<T>(newValOrFn)) {
      const returnedVal = newValOrFn(this.value)
      this.next(returnedVal)
    } else {
      this.next(newValOrFn)
    }
  }

  derive<NewType>(deriveFn: (currentVal: T) => NewType): Observable<NewType> {
    return this.pipe(map(deriveFn))
  }

  map<NewType, ArrayType = T extends Array<any> ? T[number] : never>(
      eachFn: (val: ArrayType, index: number, array: Array<ArrayType>) => NewType,
  ): Observable<Array<NewType>> {
    if (Array.isArray(this.value)) {
      return this.derive((currentVal) =>
          (currentVal as Array<ArrayType>).map(eachFn),
      )
    } else {
      throw new Error('Tried to call each() on something that is not an array!')
    }
  }
}

export function state$<T>(initialVal: T): State<T> {
  return new State(initialVal)
}

// TODO: could improve with more generics for each value in Deps
export function derive$<NewType>(
  deriveFn: (...vals: any[]) => NewType,
  deps: Observable<any>[],
): Observable<NewType> {
  return combineLatest(deps).pipe(map((vals) => deriveFn(...vals)))
}

// See https://github.com/microsoft/TypeScript/issues/37663 on why `typeof x === 'function'` won't narrow x to a callable
function isSetFn<T>(value: unknown): value is (arg: T) => T {
  return typeof value === 'function'
}
