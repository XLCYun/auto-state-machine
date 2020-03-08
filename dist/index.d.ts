import EventMan = require("@xlcyun/event-man");
export declare type AnyFunction<ArgumentArrayType extends any[] = any, ReturnType = any> = (...args: ArgumentArrayType) => ReturnType;
export interface ASMConfig {
    state: string;
    event?: EventMan;
    before?: AnyFunction;
    after?: AnyFunction;
    enter?: AnyFunction;
    leave?: AnyFunction;
    graph: State[];
}
export interface State {
    state: string;
    enter?: AnyFunction;
    leave?: AnyFunction;
    enterEvent?: string;
    leaveEvent?: string;
    to: Transition[];
}
export interface Transition {
    state: string;
    condition?: AnyFunction;
    before?: AnyFunction;
    after?: AnyFunction;
    beforeEvent?: string;
    afterEvent?: string;
}
declare type _Transition = Required<Transition>;
declare type _State = Omit<Required<State>, "to"> & {
    to: _Transition[];
};
declare type _ASMConfig = Omit<Required<ASMConfig>, "graph"> & {
    graph: _State[];
};
export declare class AutoStateMachine {
    config: _ASMConfig;
    state: _State;
    guard: Promise<any> | null;
    constructor(config: ASMConfig);
    private defaultBefore;
    private defaultAfter;
    private defaultEnter;
    private defaultLeave;
    private defaultCondition;
    private polyfillASMConfig;
    private polyfillStateConfig;
    private polyfillTransitionConfig;
    /**
     * Check if it's in a specific state
     * @param stateName state name to check
     * @return true if it is, else false
     */
    is(stateName: string): boolean;
    /**
     * Check if there is a unfinished pending transition
     */
    get isPending(): boolean;
    /**
     * (Getter) Return all states in a array
     */
    get allStates(): _State[];
    /**
     * (Getter) Get all states' name in a array
     */
    get allStateNames(): string[];
    /**
     * (Getter) Get all transitions
     */
    get allTransitions(): _Transition[];
    /**
     * (Getter) Get all next state's config object in a array
     */
    get nextStates(): _State[];
    /**
     * (Getter) Get names of next passible state to transit to in a array
     */
    get nextStateNames(): string[];
    /**
     * (Getter) Get all next transitions
     */
    get nextTransitions(): Required<Transition>[];
    /**
     * get next state config object by its name
     * @param name target next state
     * @return state config object if it's found, else null
     */
    getStateByName(name: string): _State | null;
    /**
     * Check if it can transit from the current state to a specific state,
     * will ignore the condition function
     * @param nextStateName next state name to check
     * @return return true if it can transit to, otherwise false.
     */
    mightGoTo(nextStateName: string): boolean;
    /**
     * Check if it can transit from the current state to a specific state,
     * by checking if the target next state IS a valid next state and condition
     * function return true.
     * @param nextStateName next state name to check
     * @return return true if it can transit to, otherwise false.
     */
    canGoTo(nextStateName: string): boolean | Promise<boolean>;
    /**
     * perform the transiting event life cycle
     * @param events events to fire
     * @param from from state
     * @param to target next state
     */
    private lifeCycle;
    /**
     * call by goto method, call hook functions by emit the event
     * if everything is fine, set to next stage
     * @param nextStateName next target state to transit to
     */
    private _goTo;
    /**
     * Transit to next state
     * @param nextStateName next target state to transit to
     * @param bypassCondition whether to bypass the condition function
     * @return true if successfully transit to the target state, else false.
     */
    goTo(nextStateName: string, bypassCondition?: boolean): boolean | Promise<boolean>;
    /**
     * Call by step method, find next first valid transition and perform it.
     */
    private _step;
    /**
     * Try step to next state by checking condition function
     * @return return true if step down successfully, otherwise false
     */
    step(): boolean | Promise<boolean>;
    /**
     * Step to next state recursively by checking the condition functions,
     * until no further valid state to step down.
     */
    waterfall(): true | Promise<true>;
}
export default AutoStateMachine;
