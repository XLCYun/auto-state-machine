import { expect } from "chai"
import AutoStateMachine from ".."
import EventMan = require("@xlcyun/event-man")
import { ASMConfig } from ".."

describe("contructor", function() {
  it("will polyfill hook function, event in ASMConfig", function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: []
        }
      ]
    })
    expect(asm.config.after).to.be.a("function")
    expect(asm.config.before).to.be.a("function")
    expect(asm.config.enter).to.be.a("function")
    expect(asm.config.leave).to.be.a("function")
    expect(asm.config.event).to.be.instanceOf(EventMan)
  })

  it("will polyfill hook function and event name in State config object", function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: []
        }
      ]
    })
    let stateA = asm.config.graph[0]
    expect(stateA.enter).to.be.a("function")
    expect(stateA.leave).to.be.a("function")
    expect(stateA.enterEvent).to.be.a("string")
    expect(stateA.leaveEvent).to.be.a("string")
  })

  it("will polyfill hook function and event name and condition function in Transition config object", function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [{ state: "B" }]
        },
        {
          state: "B",
          to: []
        }
      ]
    })

    let tran = asm.config.graph[0].to[0]
    expect(tran.after).to.be.a("function")
    expect(tran.before).to.be.a("function")
    expect(tran.afterEvent).to.be.a("string")
    expect(tran.beforeEvent).to.be.a("string")
    expect(tran.condition).to.be.a("function")
  })

  it("default polyfilled condition function will return false", function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [{ state: "B" }]
        },
        {
          state: "B",
          to: []
        }
      ]
    })
    expect(asm.config.graph[0].to[0].condition()).to.equal(false)
  })

  it("Cannot find initial state, throw error", function() {
    expect(() => {
      new AutoStateMachine({
        state: "A",
        graph: []
      })
    }).to.throw()
  })

  it("Will set `state` property to the corresponding initial State", function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: []
        }
      ]
    })
    expect(asm.state.state).to.equal("A")
  })

  it("will register global before function", function() {
    let test = false
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [] }], before: () => (test = true) })
    expect(asm.config.event.events["before"]).is.not.undefined
    asm.config.event.emit("before")
    expect(test).to.be.true
  })

  it("will register global after function", function() {
    let test = false
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [] }], after: () => (test = true) })
    expect(asm.config.event.events["after"]).is.not.undefined
    asm.config.event.emit("after")
    expect(test).to.be.true
  })

  it("will register global enter function", function() {
    let test = false
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [] }], enter: () => (test = true) })
    expect(asm.config.event.events["enter"]).is.not.undefined
    asm.config.event.emit("enter")
    expect(test).to.be.true
  })

  it("will register global leave function", function() {
    let test = false
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [] }], leave: () => (test = true) })
    expect(asm.config.event.events["leave"]).is.not.undefined
    asm.config.event.emit("leave")
    expect(test).to.be.true
  })

  it("will register State's enter hook function", function() {
    let test = false
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [], enter: () => (test = true) }] })
    expect(asm.config.event.events["enterA"]).is.not.undefined
    asm.config.event.emit("enterA")
    expect(test).to.be.true
  })

  it("will register State's enter hook function by the given `enterEvent` event name", function() {
    let test = false
    let asm = new AutoStateMachine({
      state: "A",
      graph: [{ state: "A", to: [], enter: () => (test = true), enterEvent: "enterAEvent" }]
    })
    expect(asm.config.event.events["enterAEvent"]).is.not.undefined
    asm.config.event.emit("enterAEvent")
    expect(test).to.be.true
  })

  it("will register State's leave hook function", function() {
    let test = false
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [], leave: () => (test = true) }] })
    expect(asm.config.event.events["leaveA"]).is.not.undefined
    asm.config.event.emit("leaveA")
    expect(test).to.be.true
  })

  it("will register State's leave hook function by the given `leaveEvent` event name", function() {
    let test = false
    let asm = new AutoStateMachine({
      state: "A",
      graph: [{ state: "A", to: [], leave: () => (test = true), leaveEvent: "leaveAEvent" }]
    })
    expect(asm.config.event.events["leaveAEvent"]).is.not.undefined
    asm.config.event.emit("leaveAEvent")
    expect(test).to.be.true
  })

  it("will register Transition's before hook function", function() {
    let test = false
    let asm = new AutoStateMachine({
      state: "A",
      graph: [{ state: "A", to: [{ state: "B", before: () => (test = true) }] }]
    })
    expect(asm.config.event.events["beforeAToB"]).is.not.undefined
    asm.config.event.emit("beforeAToB")
    expect(test).to.be.true
  })

  it("will register Transition's before hook function by the given `beforeEvent` event name", function() {
    let test = false
    let asm = new AutoStateMachine({
      state: "A",
      graph: [{ state: "A", to: [{ state: "B", before: () => (test = true), beforeEvent: "beforeA2BEvent" }] }]
    })
    expect(asm.config.event.events["beforeA2BEvent"]).is.not.undefined
    asm.config.event.emit("beforeA2BEvent")
    expect(test).to.be.true
  })

  it("will register Transition's after hook function", function() {
    let test = false
    let asm = new AutoStateMachine({
      state: "A",
      graph: [{ state: "A", to: [{ state: "B", after: () => (test = true) }] }]
    })
    expect(asm.config.event.events["afterAToB"]).is.not.undefined
    asm.config.event.emit("afterAToB")
    expect(test).to.be.true
  })

  it("will register Transition's after hook function by the given `afterEvent` event name", function() {
    let test = false
    let asm = new AutoStateMachine({
      state: "A",
      graph: [{ state: "A", to: [{ state: "B", after: () => (test = true), afterEvent: "afterA2BEvent" }] }]
    })
    expect(asm.config.event.events["afterA2BEvent"]).is.not.undefined
    asm.config.event.emit("afterA2BEvent")
    expect(test).to.be.true
  })
})

describe("is", function() {
  it("return true if given state name is the name of the current state", function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: []
        }
      ]
    })
    expect(asm.is("A")).to.be.true
    expect(asm.is("B")).to.be.false
  })
})

describe("allStates", function() {
  it("return all States", function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: []
        },
        {
          state: "B",
          to: []
        },
        {
          state: "C",
          to: []
        }
      ]
    })
    let states = asm.allStates
    expect(states)
      .to.be.an("array")
      .to.have.lengthOf(3)
    expect(states[0].state).to.equal("A")
    expect(states[1].state).to.equal("B")
    expect(states[2].state).to.equal("C")
  })
})

describe("allStateNames", function() {
  it("return all states' name", function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: []
        },
        {
          state: "B",
          to: []
        },
        {
          state: "C",
          to: []
        }
      ]
    })
    let names = asm.allStateNames
    expect(names)
      .to.be.an("array")
      .to.have.lengthOf(3)
    expect(names[0]).to.equal("A")
    expect(names[1]).to.equal("B")
    expect(names[2]).to.equal("C")
  })
})

describe("allTransitions", function() {
  it("return all transitions", function() {
    // A -> B, A-> C, B-> C, C -> A
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [{ state: "B" }, { state: "C" }]
        },
        {
          state: "B",
          to: [{ state: "C" }]
        },
        {
          state: "C",
          to: [{ state: "A" }]
        }
      ]
    })
    let trans = asm.allTransitions
    expect(trans)
      .to.be.an("array")
      .to.have.lengthOf(4)
    expect(trans[0].state).equal("B")
    expect(trans[1].state).equal("C")
    expect(trans[2].state).equal("C")
    expect(trans[3].state).equal("A")
  })
})

describe("nextStates", function() {
  // A -> B, A-> C, B-> C, C -> A, A->D
  let asm: AutoStateMachine
  beforeEach(() => {
    asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [{ state: "B" }, { state: "C" }, { state: "D" }]
        },
        {
          state: "B",
          to: [{ state: "C" }]
        },
        {
          state: "C",
          to: [{ state: "A" }]
        },
        {
          state: "D",
          to: []
        }
      ]
    })
  })

  it("A->B, A->C, A->D, will return B, C, D", function() {
    let nexts = asm.nextStates
    expect(nexts)
      .to.be.an("array")
      .to.have.lengthOf(3)
    let names = nexts.map(e => e.state)
    expect(names.includes("B")).to.be.true
    expect(names.includes("C")).to.be.true
    expect(names.includes("D")).to.be.true
    // return State, not Transition
    expect(nexts[0].enter).to.be.a("function")
    expect(nexts[0].leave).to.be.a("function")
  })

  it("B->C, will return C", function() {
    for (let i of asm.config.graph)
      if (i.state === "B") {
        asm.state = i
        break
      }
    let nexts = asm.nextStates
    expect(nexts)
      .to.be.an("array")
      .to.have.lengthOf(1)
    let names = nexts.map(e => e.state)
    expect(names[0]).to.equal("C")
    // return State, not Transition
    expect(nexts[0].enter).to.be.a("function")
    expect(nexts[0].leave).to.be.a("function")
  })

  it("C->A, will return A", function() {
    for (let i of asm.config.graph)
      if (i.state === "C") {
        asm.state = i
        break
      }
    let nexts = asm.nextStates
    expect(nexts)
      .to.be.an("array")
      .to.have.lengthOf(1)
    let names = nexts.map(e => e.state)
    expect(names[0]).to.equal("A")
    // return State, not Transition
    expect(nexts[0].enter).to.be.a("function")
    expect(nexts[0].leave).to.be.a("function")
  })
})

describe("nextStateNames", function() {
  // A -> B, A-> C, B-> C, C -> A, A->D
  let asm: AutoStateMachine
  beforeEach(() => {
    asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [{ state: "B" }, { state: "C" }, { state: "D" }]
        },
        {
          state: "B",
          to: [{ state: "C" }]
        },
        {
          state: "C",
          to: [{ state: "A" }]
        },
        {
          state: "D",
          to: []
        }
      ]
    })
  })

  it("A->B, A->C, A->D, will return ['B', 'C', 'D']", function() {
    let names = asm.nextStateNames
    expect(names)
      .to.be.an("array")
      .to.have.lengthOf(3)
    expect(names.includes("B")).to.be.true
    expect(names.includes("C")).to.be.true
    expect(names.includes("D")).to.be.true
  })

  it("B->C, will return C", function() {
    for (let i of asm.config.graph)
      if (i.state === "B") {
        asm.state = i
        break
      }
    let names = asm.nextStateNames
    expect(names)
      .to.be.an("array")
      .to.have.lengthOf(1)
    expect(names[0]).to.equal("C")
  })

  it("C->A, will return A", function() {
    for (let i of asm.config.graph)
      if (i.state === "C") {
        asm.state = i
        break
      }
    let names = asm.nextStateNames
    expect(names)
      .to.be.an("array")
      .to.have.lengthOf(1)
    expect(names[0]).to.equal("A")
  })
})

describe("nextTransitions", function() {
  // A -> B, A-> C, B-> C, C -> A, A->D
  let asm: AutoStateMachine
  beforeEach(() => {
    asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [{ state: "B" }, { state: "C" }, { state: "D" }]
        },
        {
          state: "B",
          to: [{ state: "C" }]
        },
        {
          state: "C",
          to: [{ state: "A" }]
        },
        {
          state: "D",
          to: []
        }
      ]
    })
  })
  it("A->B, A->C, A->D, will return transitions to B, C, D", function() {
    let trans = asm.nextTransitions
    expect(trans)
      .to.be.an("array")
      .to.have.lengthOf(3)
    let names = trans.map(e => e.state)
    expect(names.includes("B")).to.be.true
    expect(names.includes("C")).to.be.true
    expect(names.includes("D")).to.be.true
    // return Transitions, not State
    expect(trans[0].before).to.be.a("function")
    expect(trans[0].after).to.be.a("function")
  })

  it("B->C, will return C", function() {
    for (let i of asm.config.graph)
      if (i.state === "B") {
        asm.state = i
        break
      }
    let trans = asm.nextTransitions
    expect(trans)
      .to.be.an("array")
      .to.have.lengthOf(1)
    let names = trans.map(e => e.state)
    expect(names[0]).to.equal("C")
    // return Transitions, not State
    expect(trans[0].before).to.be.a("function")
    expect(trans[0].after).to.be.a("function")
  })

  it("C->A, will return A", function() {
    for (let i of asm.config.graph)
      if (i.state === "C") {
        asm.state = i
        break
      }
    let trans = asm.nextTransitions
    expect(trans)
      .to.be.an("array")
      .to.have.lengthOf(1)
    let names = trans.map(e => e.state)
    expect(names[0]).to.equal("A")
    // return Transitions, not State
    expect(trans[0].before).to.be.a("function")
    expect(trans[0].after).to.be.a("function")
  })
})

describe("getStateByName", function() {
  // A -> B, A-> C, B-> C, C -> A, A->D
  let asm: AutoStateMachine
  beforeEach(() => {
    asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [{ state: "B" }, { state: "C" }, { state: "D" }]
        },
        {
          state: "B",
          to: [{ state: "C" }]
        },
        {
          state: "C",
          to: [{ state: "A" }]
        },
        {
          state: "D",
          to: []
        }
      ]
    })
  })

  it("return null if no corresponding State exists", function() {
    let state = asm.getStateByName("notExistsStateName")
    expect(state).to.be.null
  })

  it("return State if corresponding state exists", function() {
    let state = asm.getStateByName("A")
    expect(state).to.not.be.null
    //@ts-ignore
    expect(state.state).to.be.equal("A")
    // return State, not transition
    // @ts-ignore
    expect(state.enter).to.be.a("function")
    // @ts-ignore
    expect(state.leave).to.be.a("function")
  })
})

describe("mightGoTo", function() {
  // A-> C, B-> C, C -> A, A->D
  let asm: AutoStateMachine
  beforeEach(() => {
    asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [{ state: "C" }, { state: "D" }]
        },
        {
          state: "B",
          to: [{ state: "C" }]
        },
        {
          state: "C",
          to: [{ state: "A" }]
        },
        {
          state: "D",
          to: []
        }
      ]
    })
  })

  it("If given state is not exists, return false", function() {
    expect(asm.mightGoTo("notExistsStateName")).to.be.false
  })
  it("If given state exists, return but not possible next state, return false", function() {
    // A cannot go to B
    expect(asm.mightGoTo("B")).to.be.false
  })
  it("If given state exists and is next possible state, return true", function() {
    // A mighi go to C is true
    expect(asm.mightGoTo("C")).to.be.true
  })
  it("If given state exists and is next possible state, will not call condition function", function() {
    asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [
            {
              state: "B",
              condition: () => {
                throw new Error("Will not call condition function, when use mightToGo")
              }
            }
          ]
        },
        { state: "B", to: [] }
      ]
    })
    expect(() => asm.mightGoTo("B")).does.not.throw()
  })
})

describe("canGoTo", function() {
  // A-> C, B-> C, C -> A, A->D
  let asm: AutoStateMachine
  beforeEach(() => {
    asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [{ state: "C" }, { state: "D" }]
        },
        {
          state: "B",
          to: [{ state: "C" }]
        },
        {
          state: "C",
          to: [{ state: "A" }]
        },
        {
          state: "D",
          to: []
        }
      ]
    })
  })

  it("If given state is not exists, return false", function() {
    expect(asm.canGoTo("notExistsStateName")).to.be.false
  })
  it("If given state exists, return but not possible next state, return false", function() {
    // A cannot go to B
    expect(asm.canGoTo("B")).to.be.false
  })
  it("If given state exists and is next possible state, will call condition function", function() {
    asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [
            {
              state: "B",
              condition: () => {
                throw new Error("Will not call condition function, when use mightToGo")
              }
            }
          ]
        },
        { state: "B", to: [] }
      ]
    })
    expect(() => asm.canGoTo("B")).to.throw()
  })

  it("If given state exists and is next possible state, condition function return true, will return true", function() {
    asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [
            {
              state: "B",
              condition: () => true
            }
          ]
        },
        { state: "B", to: [] }
      ]
    })
    expect(asm.canGoTo("B")).to.be.true
  })

  it("If given state exists and is next possible state, condition function return anything but true, will return false", function() {
    let config: ASMConfig = {
      state: "A",
      graph: [
        {
          state: "A",
          to: [
            {
              state: "B",
              condition: () => 1
            }
          ]
        },
        { state: "B", to: [] }
      ]
    }
    asm = new AutoStateMachine(config)
    expect(asm.canGoTo("B")).to.be.false

    config.graph[0].to[0].condition = () => "true"
    asm = new AutoStateMachine(config)
    expect(asm.canGoTo("B")).to.be.false
  })

  it("condition function can be async, will return a Promise, which will resolve to a boolean result", async function() {
    let config: ASMConfig = {
      state: "A",
      graph: [
        {
          state: "A",
          to: [
            {
              state: "B",
              condition: async () => "condition"
            }
          ]
        },
        { state: "B", to: [] }
      ]
    }
    asm = new AutoStateMachine(config)
    let res = asm.canGoTo("B")
    expect(res).to.be.a("promise")
    let realRes = await res
    expect(realRes).to.be.false
  })

  it("condition function can be async, will return a Promise, which reject with Error if it throw Error", async function() {
    let config: ASMConfig = {
      state: "A",
      graph: [
        {
          state: "A",
          to: [
            {
              state: "B",
              condition: async () => {
                throw new Error("condition function throw error")
              }
            }
          ]
        },
        { state: "B", to: [] }
      ]
    }
    asm = new AutoStateMachine(config)
    let res = asm.canGoTo("B")
    expect(res).to.be.a("promise")
    try {
      await res
      throw new Error("condition will throw error, this will never be exectuted")
    } catch (e) {}
  })
})

describe("lifeCycle", function() {
  it("Will emit events one by one, sync listener", function() {
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [] }] })
    let container: string[] = []
    asm.config.event.on("A", () => container.push("A"))
    asm.config.event.on("B", () => container.push("B"))
    asm.config.event.on("C", () => container.push("C"))
    asm.config.event.on("D", () => container.push("D"))
    asm.config.event.on("E", () => container.push("E"))
    let events = ["A", "B", "C", "D", "E"]
    // @ts-ignore
    asm.lifeCycle(events, asm.config.graph[0], asm.config.graph[0])
    expect(container).to.deep.equal(["A", "B", "C", "D", "E"])
  })

  it("Will emit events one by one, async and sync listener", async function() {
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [] }] })
    let container: string[] = []
    asm.config.event.on("A", () => {
      return new Promise(resolve => {
        setTimeout(() => {
          container.push("A")
          resolve()
        }, 200)
      })
    })
    asm.config.event.on("B", async () => container.push("B"))
    asm.config.event.on("C", () => container.push("C"))
    asm.config.event.on("D", async () => container.push("D"))
    asm.config.event.on("E", () => container.push("E"))
    let events = ["A", "B", "C", "D", "E"]
    // @ts-ignore
    let result = asm.lifeCycle(events, asm.config.graph[0], asm.config.graph[0])
    expect(result).to.be.a("promise")
    await result
    expect(container).to.deep.equal(["A", "B", "C", "D", "E"])
  })

  it("Will throw error when listener throw an error, sync listener", function() {
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [] }] })
    asm.config.event.on("A", () => {})
    asm.config.event.on("B", () => {})
    asm.config.event.on("C", () => {})
    asm.config.event.on("D", () => {})
    asm.config.event.on("E", () => {
      throw new Error("lifeCycle's event listener throw error")
    })
    let events = ["A", "B", "C", "D", "E"]
    // @ts-ignore
    expect(() => asm.lifeCycle(events, asm.config.graph[0], asm.config.graph[0])).to.throw()
  })

  it("Will throw error when listener throw an error, sync and async listener", async function() {
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [] }] })
    asm.config.event.on("A", async () => {})
    asm.config.event.on("B", () => {})
    asm.config.event.on("C", async () => {})
    asm.config.event.on("D", () => {})
    asm.config.event.on("E", async () => {
      throw new Error("lifeCycle's event listener throw error")
    })
    let events = ["A", "B", "C", "D", "E"]
    try {
      // @ts-ignore
      await asm.lifeCycle(events, asm.config.graph[0], asm.config.graph[0])
      throw new Error("This throw statement should never be executed")
    } catch (e) {}
  })
})

describe("_goTo", function() {
  it("If the given next state name is invalid, directly return false", function() {
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [] }] })
    // @ts-ignore
    expect(asm._goTo("notExistsState")).to.be.false
  })
  it("If the given next state name is valid, but its corresponding State is not exists in graph, directly return false", function() {
    // A->B, but B not exists
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [{ state: "B" }] }] })
    // @ts-ignore
    expect(asm._goTo("B")).to.be.false
  })
  it("trigger transiting life cycle, sync hook functions", function() {
    let orderCheck = {
      before: 0,
      beforeAToB: 0,
      leaveA: 0,
      leave: 0,
      enter: 0,
      enterB: 0,
      afterAToB: 0,
      after: 0
    }
    let order = 0
    let check = {
      before: false,
      beforeAToB: false,
      leaveA: false,
      leave: false,
      enter: false,
      enterB: false,
      afterAToB: false,
      after: false
    }
    let asm = new AutoStateMachine({
      state: "A",
      before: () => {
        check.before = true
        order++
        orderCheck.before = order
      },
      after: () => {
        check.after = true
        order++
        orderCheck.after = order
      },
      enter: () => {
        check.enter = true
        order++
        orderCheck.enter = order
      },
      leave: () => {
        check.leave = true
        order++
        orderCheck.leave = order
      },
      graph: [
        {
          state: "A",
          enter: () => {
            throw new Error("A->B, A's enter hoook will not be executed")
          },
          leave: () => {
            check.leaveA = true
            order++
            orderCheck.leaveA = order
          },
          to: [
            {
              state: "B",
              before: () => {
                check.beforeAToB = true
                order++
                orderCheck.beforeAToB = order
              },
              after: () => {
                check.afterAToB = true
                order++
                orderCheck.afterAToB = order
              }
            }
          ]
        },
        {
          state: "B",
          to: [],
          enter: () => {
            check.enterB = true
            order++
            orderCheck.enterB = order
          }
        }
      ]
    })
    // @ts-ignore
    asm._goTo("B")
    expect(orderCheck).to.deep.equal({
      before: 1,
      beforeAToB: 2,
      leaveA: 3,
      leave: 4,
      enter: 5,
      enterB: 6,
      afterAToB: 7,
      after: 8
    })
    expect(check).to.deep.equal({
      before: true,
      beforeAToB: true,
      leaveA: true,
      leave: true,
      enter: true,
      enterB: true,
      afterAToB: true,
      after: true
    })
  })

  it("trigger transiting life cycle, mixed async and sync hook functions", async function() {
    let orderCheck = {
      before: 0,
      beforeAToB: 0,
      leaveA: 0,
      leave: 0,
      enter: 0,
      enterB: 0,
      afterAToB: 0,
      after: 0
    }
    let order = 0
    let check = {
      before: false,
      beforeAToB: false,
      leaveA: false,
      leave: false,
      enter: false,
      enterB: false,
      afterAToB: false,
      after: false
    }
    let asm = new AutoStateMachine({
      state: "A",
      before: async () => {
        check.before = true
        order++
        orderCheck.before = order
      },
      after: () => {
        check.after = true
        order++
        orderCheck.after = order
      },
      enter: async () => {
        check.enter = true
        order++
        orderCheck.enter = order
      },
      leave: () => {
        check.leave = true
        order++
        orderCheck.leave = order
      },
      graph: [
        {
          state: "A",
          enter: () => {
            throw new Error("A->B, A's enter hoook will not be executed")
          },
          leave: async () => {
            check.leaveA = true
            order++
            orderCheck.leaveA = order
          },
          to: [
            {
              state: "B",
              before: async () => {
                check.beforeAToB = true
                order++
                orderCheck.beforeAToB = order
              },
              after: () => {
                check.afterAToB = true
                order++
                orderCheck.afterAToB = order
              }
            }
          ]
        },
        {
          state: "B",
          to: [],
          enter: async () => {
            check.enterB = true
            order++
            orderCheck.enterB = order
          }
        }
      ]
    })
    // @ts-ignore
    let res = asm._goTo("B")
    expect(res).to.be.a("promise")
    await res
    expect(orderCheck).to.deep.equal({
      before: 1,
      beforeAToB: 2,
      leaveA: 3,
      leave: 4,
      enter: 5,
      enterB: 6,
      afterAToB: 7,
      after: 8
    })
    expect(check).to.deep.equal({
      before: true,
      beforeAToB: true,
      leaveA: true,
      leave: true,
      enter: true,
      enterB: true,
      afterAToB: true,
      after: true
    })
  })

  it("before `enter` global hook, current state is the old state, in and after `enter`, it is the new state", function() {
    let test: boolean[] = []
    let asm = new AutoStateMachine({
      state: "A",
      before: () => {
        test.push(asm.state.state === "A")
      },
      after: () => {
        test.push(asm.state.state === "B")
      },
      enter: () => {
        test.push(asm.state.state === "B")
      },
      leave: () => {
        test.push(asm.state.state === "A")
      },
      graph: [
        {
          state: "A",
          enter: () => {
            throw new Error("A->B, A's enter hoook will not be executed")
          },
          leave: () => {
            test.push(asm.state.state === "A")
          },
          to: [
            {
              state: "B",
              before: () => {
                test.push(asm.state.state === "A")
              },
              after: () => {
                test.push(asm.state.state === "B")
              }
            }
          ]
        },
        {
          state: "B",
          to: [],
          enter: () => {
            test.push(asm.state.state === "B")
          }
        }
      ]
    })
    // @ts-ignore
    asm._goTo("B")
    // 8 true
    expect(test).has.lengthOf(8)
    expect(test.filter(e => e)).has.lengthOf(8)
  })
})

describe("goTo", function() {
  it("If next state name is invalid, directly return false", function() {
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [] }] })
    expect(asm.goTo("notExistsState")).to.be.false
  })
  it("If next state name is valid, but no corresponding State can found in graph, return false", function() {
    let asm = new AutoStateMachine({ state: "A", graph: [{ state: "A", to: [{ state: "B" }] }] })
    expect(asm.goTo("B")).to.be.false
  })
  it("bypassCondition arg is true, will ignore condition function", function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        { state: "A", to: [{ state: "B", condition: async () => false }] },
        { state: "B", to: [] }
      ]
    })
    expect(asm.goTo("B", true)).to.be.true
  })
  it("bypassCondition arg is false, will not ignore condition function", function() {
    let conditionIsCalled = false
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [
            {
              state: "B",
              condition: () => {
                conditionIsCalled = true
                return true
              }
            }
          ]
        },
        { state: "B", to: [] }
      ]
    })
    expect(asm.goTo("B", false)).to.be.true
    expect(asm.state.state).to.equal("B")
    expect(conditionIsCalled).to.be.true
  })
  it("bypassCondition arg is false, condition not return true will stop go to next state", function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [
            {
              state: "B",
              condition: () => "true"
            }
          ]
        },
        { state: "B", to: [] }
      ]
    })
    let res = asm.goTo("B", false)
    expect(res).to.be.false
    expect(asm.state.state).to.equal("A")
  })
  it("bypassCondition arg is false, condition function can be async", async function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [
            {
              state: "B",
              condition: async () => "true"
            }
          ]
        },
        { state: "B", to: [] }
      ]
    })
    let result = asm.goTo("B", false)
    expect(result).to.be.a("promise")
    let realResult = await result
    expect(realResult).to.be.false
    expect(asm.state.state).to.equal("A")
  })
  it("condition is sync, and return true, will transit to target state", function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [
            {
              state: "B",
              condition: () => true
            }
          ]
        },
        { state: "B", to: [] }
      ]
    })
    asm.goTo("B")
    expect(asm.state.state).to.equal("B")
  })
  it("condition is async, and return true, will transit to target state", async function() {
    let asm = new AutoStateMachine({
      state: "A",
      graph: [
        {
          state: "A",
          to: [
            {
              state: "B",
              condition: async () => true
            }
          ]
        },
        { state: "B", to: [] }
      ]
    })
    await asm.goTo("B")
    expect(asm.state.state).to.equal("B")
  })
})

describe("_step", function() {
  let config: ASMConfig
  let asm: AutoStateMachine
  beforeEach(() => {
    config = {
      state: "A",
      graph: [
        {
          state: "A",
          to: [
            {
              state: "B",
              condition: () => true
            },
            {
              state: "C",
              condition: () => true
            },
            {
              state: "D",
              condition: () => true
            }
          ]
        },
        { state: "B", to: [] },
        { state: "C", to: [] },
        { state: "D", to: [] }
      ]
    }
    asm = new AutoStateMachine(config)
  })
  it("A-can->B, A-can->C, A-can->D, will step to B, for B is the first valid transition", function() {
    // @ts-ignore
    expect(asm._step([...asm.config.graph[0].to])).to.be.true
    expect(asm.state.state).to.equal("B")
  })
  it("A-cannot->B, A-can->C, A-can->D, will step to C, for C is the first valid transition", function() {
    config.graph[0].to[0].condition = () => false
    asm = new AutoStateMachine(config)
    // @ts-ignore
    expect(asm._step([...asm.config.graph[0].to])).to.be.true
    expect(asm.state.state).to.equal("C")
  })
  it("A-cannot->B, A-cannot->C, A-can->D, will step to D, for D is the first valid transition", function() {
    config.graph[0].to[0].condition = () => false
    config.graph[0].to[1].condition = () => false
    asm = new AutoStateMachine(config)
    // @ts-ignore
    expect(asm._step([...asm.config.graph[0].to])).to.be.true
    expect(asm.state.state).to.equal("D")
  })
  it("A-cannot->B, A-cannot->C, A-cannot->D, will return false, for there is no valid transition", function() {
    config.graph[0].to[0].condition = () => false
    config.graph[0].to[1].condition = () => false
    config.graph[0].to[2].condition = () => false
    asm = new AutoStateMachine(config)
    // @ts-ignore
    expect(asm._step([...asm.config.graph[0].to])).to.be.false
  })
  it("A-cannot->B, A-can->C, A-async can->D, will step to C synchronously", function() {
    config.graph[0].to[0].condition = () => false
    config.graph[0].to[1].condition = () => true
    config.graph[0].to[2].condition = async () => true
    asm = new AutoStateMachine(config)
    // @ts-ignore
    expect(asm._step([...asm.config.graph[0].to])).to.be.true
    expect(asm.state.state).to.equal("C")
  })
  it("A-cannot->B, A-async can->C, A-can->D, will step to C asynchronously", async function() {
    config.graph[0].to[0].condition = () => false
    config.graph[0].to[1].condition = async () => true
    config.graph[0].to[2].condition = () => true
    asm = new AutoStateMachine(config)
    // @ts-ignore
    let res = asm._step([...asm.config.graph[0].to])
    expect(res).to.be.a("promise")
    let real = await res
    expect(real).to.be.true
    expect(asm.state.state).to.equal("C")
  })
})

describe("step", function() {
  it("see _step method test", () => {})
})

describe("waterfall", function() {
  let config: ASMConfig
  let asm: AutoStateMachine
  beforeEach(() => {
    config = {
      state: "A",
      graph: [
        { state: "A", to: [{ state: "B" }, { state: "C" }, { state: "D" }] },
        { state: "B", to: [{ state: "E" }, { state: "F" }] },
        { state: "C", to: [{ state: "G" }] },
        { state: "D", to: [{ state: "H" }, { state: "I" }] },
        { state: "E", to: [{ state: "F" }, { state: "G" }] },
        { state: "F", to: [{ state: "H" }, { state: "G" }] },
        { state: "G", to: [{ state: "H" }] },
        { state: "H", to: [{ state: "I" }] },
        { state: "I", to: [] }
      ]
    }
    asm = new AutoStateMachine(config)
  })

  it("no valid path, stay put", function() {
    asm.waterfall()
    expect(asm.state.state).to.equal("A")
  })
  it("one valid path, A -> B -> F", function() {
    config.graph[0].to[0].condition = () => true
    config.graph[1].to[1].condition = () => true
    asm = new AutoStateMachine(config)
    asm.waterfall()
    expect(asm.state.state).to.equal("F")
  })
  it("one valid path, mixed async condition function", async function() {
    config.graph[0].to[0].condition = () => true
    config.graph[1].to[1].condition = async () => true
    asm = new AutoStateMachine(config)
    let res = asm.waterfall()
    expect(res).to.be.a("promise")
    await res
    expect(asm.state.state).to.equal("F")
  })
  it("multiple valid path, A->B->F->H->I, A->B->E->F->G will fall step by step by the order of the valid transition, that is, A->B->F->H->, for F->H will be valid tested before F->G", function() {
    let A = config.graph[0]
    let B = config.graph[1]
    let E = config.graph[4]
    let F = config.graph[5]
    let H = config.graph[7]
    A.to[0].condition = () => true // A -> B
    B.to[1].condition = () => true // B -> F
    F.to[0].condition = () => true // F -> H
    H.to[0].condition = () => true // H -> I

    B.to[0].condition = () => true // B -> E
    E.to[0].condition = () => true // E -> F
    F.to[1].condition = () => true // F -> G
    asm = new AutoStateMachine(config)
    asm.waterfall()
    expect(asm.state.state).to.equal("I")
  })
  it("multiple valid path, mixed async and sync condition function, A->B->F->H->I, A->B->E->F->G will fall step by step by the order of the valid transition, that is, A->B->F->H->, for F->H will be valid tested before F->G", async function() {
    let A = config.graph[0]
    let B = config.graph[1]
    let E = config.graph[4]
    let F = config.graph[5]
    let H = config.graph[7]
    A.to[0].condition = () => true // A -> B
    B.to[1].condition = async () => true // B -> F
    F.to[0].condition = async () => true // F -> H
    H.to[0].condition = () => true // H -> I

    B.to[0].condition = async () => true // B -> E
    E.to[0].condition = async () => true // E -> F
    F.to[1].condition = () => true // F -> G
    asm = new AutoStateMachine(config)
    let res = asm.waterfall()
    expect(res).to.be.a("promise")
    await res
    expect(asm.state.state).to.equal("I")
  })
})

describe("isPending", function() {
  let config: ASMConfig
  let asm: AutoStateMachine
  beforeEach(() => {
    config = {
      state: "A",
      graph: [
        { state: "A", to: [{ state: "B" }, { state: "C" }, { state: "D" }] },
        { state: "B", to: [{ state: "E" }, { state: "F" }] },
        { state: "C", to: [{ state: "G" }] },
        { state: "D", to: [{ state: "H" }, { state: "I" }] },
        { state: "E", to: [{ state: "F" }, { state: "G" }] },
        { state: "F", to: [{ state: "H" }, { state: "G" }] },
        { state: "G", to: [{ state: "H" }] },
        { state: "H", to: [{ state: "I" }] },
        { state: "I", to: [] }
      ]
    }
    asm = new AutoStateMachine(config)
  })

  it("After constructed, asm is not pending by default", function() {
    expect(asm.isPending).to.be.false
  })

  it("Transition is all the way sync, will not be isPending", function() {
    let A = config.graph[0]
    let B = config.graph[1]
    let F = config.graph[5]
    let H = config.graph[7]
    A.to[0].condition = () => true // A -> B
    B.to[1].condition = () => true // B -> F
    F.to[0].condition = () => true // F -> H
    H.to[0].condition = () => true // H -> I
    asm = new AutoStateMachine(config)
    asm.waterfall()
    expect(asm.isPending).to.be.false
  })

  it("In async transition, will be in pending before it finished", function() {
    let A = config.graph[0]
    let B = config.graph[1]
    let F = config.graph[5]
    let H = config.graph[7]
    A.to[0].condition = () => true // A -> B
    B.to[1].condition = () => true // B -> F
    F.to[0].condition = () => true // F -> H
    H.to[0].condition = () => true // H -> I

    // F -> H, beforeFToH is async function
    F.to[0].before = () => {
      return new Promise(resolve => setTimeout(resolve, 500))
    }
    asm = new AutoStateMachine(config)
    expect(asm.waterfall()).to.be.a("promise")
    expect(asm.isPending).to.be.true
  })

  it("In async transition, will not be pending after it's finished", async function() {
    let A = config.graph[0]
    let B = config.graph[1]
    let F = config.graph[5]
    let H = config.graph[7]
    A.to[0].condition = () => true // A -> B
    B.to[1].condition = () => true // B -> F
    F.to[0].condition = () => true // F -> H
    H.to[0].condition = () => true // H -> I

    // F -> H, beforeFToH is async function
    F.to[0].before = () => {
      return new Promise(resolve => setTimeout(resolve, 50))
    }
    asm = new AutoStateMachine(config)
    expect(asm.waterfall()).to.be.a("promise")
    expect(asm.isPending).to.be.true
    await asm.guard
    expect(asm.isPending).to.be.false
  })
})

it("`this` of the hook functions will bind to the auth-state-machine instance", function() {
  let check = {
    before: false,
    beforeAToB: false,
    leaveA: false,
    leave: false,
    enter: false,
    enterB: false,
    afterAToB: false,
    after: false,
    condition: false
  }
  let asm = new AutoStateMachine({
    state: "A",
    before: function() {
      check.before = this === asm
    },
    after: function() {
      check.after = this === asm
    },
    enter: function() {
      check.enter = this === asm
    },
    leave: function() {
      check.leave = this === asm
    },
    graph: [
      {
        state: "A",
        enter: function() {
          throw new Error("A->B, A's enter hoook will not be executed")
        },
        leave: function() {
          check.leaveA = this === asm
        },
        to: [
          {
            state: "B",
            before: function() {
              check.beforeAToB = this === asm
            },
            after: function() {
              check.afterAToB = this === asm
            },
            condition: function() {
              check.condition = this === asm
              return true
            }
          }
        ]
      },
      {
        state: "B",
        to: [],
        enter: function() {
          check.enterB = this === asm
        }
      }
    ]
  })
  asm.goTo("B", false)
  expect(check).to.deep.equal({
    before: true,
    beforeAToB: true,
    leaveA: true,
    leave: true,
    enter: true,
    enterB: true,
    afterAToB: true,
    after: true,
    condition: true
  })
})
