import EventMan = require("@xlcyun/event-man")
import PromiseOrphanage = require("@xlcyun/event-man/PromiseOrphanage")

export type AnyFunction<ArgumentArrayType extends any[] = any, ReturnType = any> = (
  ...args: ArgumentArrayType
) => ReturnType

// Config
export interface ASMConfig {
  // initial state
  state: string
  // EventMan, an event manager tool
  event?: EventMan
  // global before hook
  before?: AnyFunction
  // global after hook
  after?: AnyFunction
  // global enter hook
  enter?: AnyFunction
  // global leave hook
  leave?: AnyFunction
  // error hook function, call when error thrown when transiting
  // error?: AnyFunction
  // graph definition
  graph: State[]
}

// State config
export interface State {
  // state name
  state: string
  // enter hook for this state
  enter?: AnyFunction
  // leave hook for this state
  leave?: AnyFunction
  // fired event name when enter this state
  enterEvent?: string
  // fired event name when leave this state
  leaveEvent?: string
  // transitions that leave from this state
  to: Transition[]
}

export interface Transition {
  // this transition's target state
  state: string
  // return true to trigger this transition automatically when after enter current state
  condition?: AnyFunction
  // before hook for this transition
  before?: AnyFunction
  // after hook for this transition
  after?: AnyFunction
  // event name to fire before this transition start
  beforeEvent?: string
  // event name to fire after this transition finished
  afterEvent?: string
}

type _Transition = Required<Transition>
type _State = Omit<Required<State>, "to"> & {
  to: _Transition[]
}
type _ASMConfig = Omit<Required<ASMConfig>, "graph"> & {
  graph: _State[]
}

function upperCamelize(label: string): string {
  let result: string = ""
  let words = label.split(/[_-]/)
  for (let n = 0; n < words.length; n++) {
    result = result + words[n].charAt(0).toUpperCase() + words[n].substring(1)
  }
  return result
}

function isPromise(item: any): item is Promise<any> {
  return Promise.resolve(item) === item
}

export class AutoStateMachine {
  public config: _ASMConfig
  public state: _State
  public guard: Promise<any> | null

  constructor(config: ASMConfig) {
    this.config = this.polyfillASMConfig(config)
    this.guard = null

    // register hook
    this.config.event.on("before", this.config.before)
    this.config.event.on("after", this.config.after)
    this.config.event.on("enter", this.config.enter)
    this.config.event.on("leave", this.config.leave)
    // this.config.event.on("error", this.config.error)
    for (let s of this.config.graph) {
      this.config.event.on(s.enterEvent, s.enter)
      this.config.event.on(s.leaveEvent, s.leave)
      for (let t of s.to) {
        this.config.event.on(t.beforeEvent, t.before)
        this.config.event.on(t.afterEvent, t.after)
      }
    }

    let init = this.config.state
    for (let state of this.config.graph) {
      if (init === state.state) {
        this.state = state
        return
      }
    }
    throw new Error("Auto-State-Machine config error: cannot find initial state in state(graph) array")
  }

  private defaultBefore = () => true
  private defaultAfter = () => true
  private defaultEnter = () => true
  private defaultLeave = () => true
  private defaultCondition = () => false
  // private defaultError = (e: Error) => {
  //   throw e
  // }
  private polyfillASMConfig(config: ASMConfig): _ASMConfig {
    return {
      state: config.state,
      event: config.event || new EventMan(),
      before: config.before || this.defaultBefore,
      after: config.after || this.defaultAfter,
      enter: config.enter || this.defaultEnter,
      leave: config.leave || this.defaultLeave,
      // error: config.error || this.defaultError,
      graph: config.graph ? config.graph.map(e => this.polyfillStateConfig(e)) : []
    }
  }
  private polyfillStateConfig(state: State): _State {
    return {
      state: state.state,
      enter: state.enter || this.defaultEnter,
      leave: state.leave || this.defaultLeave,
      enterEvent: state.enterEvent || "enter" + upperCamelize(state.state),
      leaveEvent: state.leaveEvent || "leave" + upperCamelize(state.state),
      to: state.to === undefined ? [] : state.to.map(e => this.polyfillTransitionConfig(state.state, e))
    }
  }
  private polyfillTransitionConfig(from: string, trans: Transition): _Transition {
    return {
      state: trans.state,
      condition: trans.condition || this.defaultCondition,
      before: trans.before || this.defaultBefore,
      after: trans.after || this.defaultAfter,
      beforeEvent: trans.beforeEvent || "before" + upperCamelize(from) + "To" + upperCamelize(trans.state),
      afterEvent: trans.afterEvent || "after" + upperCamelize(from) + "To" + upperCamelize(trans.state)
    }
  }

  /**
   * Check if it's in a specific state
   * @param stateName state name to check
   * @return true if it is, else false
   */
  public is(stateName: string): boolean {
    return stateName === this.state.state
  }

  /**
   * Check if there is a unfinished pending transition
   */
  public get isPending(): boolean {
    return isPromise(this.guard)
  }

  /**
   * (Getter) Return all states in a array
   */
  public get allStates(): _State[] {
    return [...this.config.graph]
  }

  /**
   * (Getter) Get all states' name in a array
   */
  public get allStateNames(): string[] {
    return this.config.graph.map(e => e.state)
  }

  /**
   * (Getter) Get all transitions
   */
  public get allTransitions(): _Transition[] {
    let res = []
    for (let i of this.config.graph) for (let t of i.to) res.push(t)
    return res
  }

  /**
   * (Getter) Get all next state's config object in a array
   */
  public get nextStates(): _State[] {
    return this.nextStateNames.map(e => {
      let res = this.getStateByName(e)
      if (res === null) throw new Error(`State ${e} is not found in the config`)
      return res
    })
  }

  /**
   * (Getter) Get names of next passible state to transit to in a array
   */
  public get nextStateNames(): string[] {
    return this.state.to.map(e => e.state)
  }

  /**
   * (Getter) Get all next transitions
   */
  public get nextTransitions() {
    return [...this.state.to]
  }

  /**
   * get next state config object by its name
   * @param name target next state
   * @return state config object if it's found, else null
   */
  public getStateByName(name: string): _State | null {
    for (let i of this.allStates) if (i.state === name) return i
    return null
  }

  /**
   * Check if it can transit from the current state to a specific state,
   * will ignore the condition function
   * @param nextStateName next state name to check
   * @return return true if it can transit to, otherwise false.
   */
  public mightGoTo(nextStateName: string): boolean {
    return this.nextStateNames.includes(nextStateName)
  }

  /**
   * Check if it can transit from the current state to a specific state,
   * by checking if the target next state IS a valid next state and condition
   * function return true.
   * @param nextStateName next state name to check
   * @return return true if it can transit to, otherwise false.
   */
  public canGoTo(nextStateName: string): boolean | Promise<boolean> {
    if (this.mightGoTo(nextStateName) === false) return false
    let tran = null
    for (let t of this.nextTransitions)
      if (t.state === nextStateName) {
        tran = t
        break
      }
    if (tran === null) return false

    let conditionResult = tran.condition()
    if (isPromise(conditionResult)) {
      return new Promise(function(resolve, reject) {
        conditionResult.then((condition: any) => resolve(condition === true)).catch(reject)
      })
    } else return conditionResult === true
  }

  /**
   * perform the transiting event life cycle
   * @param events events to fire
   * @param from from state
   * @param to target next state
   */
  private lifeCycle(events: string[], from: _State, to: _State): boolean | Promise<boolean> {
    if (events.length === 0) return true
    let event: string = events.shift() as string

    // before fire 'enter' event
    if (event === "enter") this.state = to

    let res = this.config.event.emit(event, from, to)
    if (res.currentPromiseOrphanage.isRescued === false) {
      return new Promise((resolve, reject) =>
        res.once.then(() => resolve(this.lifeCycle(events, from, to))).catch(reject)
      )
    }
    return this.lifeCycle(events, from, to)
  }

  /**
   * call by goto method, call hook functions by emit the event
   * if everything is fine, set to next stage
   * @param nextStateName next target state to transit to
   */
  private _goTo(nextStateName: string): boolean | Promise<boolean> {
    let tran: null | _Transition = null
    for (let i of this.nextTransitions)
      if (i.state === nextStateName) {
        tran = i
        break
      }
    if (tran === null) return false
    let state = this.getStateByName(nextStateName)
    if (state === null) return false

    let events: string[] = [
      "before",
      tran.beforeEvent,
      this.state.leaveEvent,
      "leave",
      "enter",
      state.enterEvent,
      tran.afterEvent,
      "after"
    ]
    // pending guard exists
    if (this.isPending) throw new Error(`Cannot go to ${nextStateName}, another transition is pending.`)

    let res = this.lifeCycle(events, this.state, state)
    if (isPromise(res)) {
      // set pending guard
      this.guard = new Promise((resolve, reject) => {
        ;(res as Promise<any>)
          .then(result => {
            this.guard = null // dismiss pending guard
            resolve(result)
          })
          .catch(reject)
      })
      return this.guard
    } else return res
  }

  /**
   * Transit to next state
   * @param nextStateName next target state to transit to
   * @param bypassCondition whether to bypass the condition function
   * @return true if successfully transit to the target state, else false.
   */
  public goTo(nextStateName: string, bypassCondition: boolean = false): boolean | Promise<boolean> {
    if (this.mightGoTo(nextStateName) === false) return false
    if (bypassCondition === true) return this._goTo(nextStateName)
    let canGoTo = this.canGoTo(nextStateName)
    if (typeof canGoTo === "boolean") return canGoTo === true ? this._goTo(nextStateName) : false
    let promiseCanGoTo = canGoTo as Promise<boolean>
    return new Promise((resolve, reject) => {
      promiseCanGoTo.then(condition => resolve(condition === true ? this._goTo(nextStateName) : false)).catch(reject)
    })
  }

  /**
   * Call by step method, find next first valid transition and perform it.
   */
  private _step(testTrans: _Transition[]): boolean | Promise<boolean> {
    if (testTrans.length <= 0) return false
    let tran = testTrans.shift() as _Transition
    let res = tran.condition()
    if (isPromise(res))
      return new Promise((resolve, reject) =>
        res
          .then((condition: any) => resolve(condition === true ? this.goTo(tran.state, true) : this._step(testTrans)))
          .catch(reject)
      )
    else return res === true ? this.goTo(tran.state, true) : this._step(testTrans)
  }

  /**
   * Try step to next state by checking condition function
   * @return return true if step down successfully, otherwise false
   */
  public step(): boolean | Promise<boolean> {
    return this._step([...this.nextTransitions])
  }

  /**
   * Step to next state recursively by checking the condition functions,
   * until no further valid state to step down.
   */
  public waterfall(): true | Promise<true> {
    let res = this.step()
    if (isPromise(res))
      return new Promise((resolve, reject) =>
        (res as Promise<boolean>).then(stepRes => resolve(stepRes === true ? this.waterfall() : true)).catch(reject)
      )
    return res === true ? this.waterfall() : true
  }
}

export default AutoStateMachine
