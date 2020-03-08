# auto-state-machine

A finite state machine that supports transiting state automatically.

# 中文文档

## 状态图配置

```ts
{
  before: function,
  after: function,
  enter: function,
  leave: function,
  state: string,
  event: EventMan,
  graph: [{
    state: string,
    enter: function,
    leave: function,
    // enterEvent?: string,
    // leaveEvent?: string,
    to: [
      {
        state: string,
        condition: function,
        before: function,
        after: function,
        // beforeEvent?: string,
        // afterEvent?: string
      },
    ]
  }]
}
```

## 状态机流程

### 状态转移过程

```mermaid
graph LR
  A1[状态A1] --> beforeAll([全局before动作钩子]) -.-> beforeA12B([before动作A1到B钩子])  -.-> leaveA1([leave状态A1钩子]) -.-> leave([leave全局钩子])
  A2[状态A2] --> beforeAll([全局before动作钩子]) -.-> beforeA22B([before动作A2到B钩子])  -.-> leaveA2([leave状态A2钩子]) -.-> leave([leave全局钩子])
  leave([leave全局钩子]) --> B[状态B] --> enter([enter全局钩子])
  enter([enter全局钩子]) -.-> enterB([enter状态B钩子])
  enter([enter全局钩子]) -.-> enterB1([enter状态B钩子]) -.-> afterA22B([after动作A2到B钩子]) -.-> afterAll([全局after钩子])
  enterB([enter状态B钩子]) -.-> afterA12B([after动作A1到B钩子]) -.-> afterAll([全局after钩子])
  afterAll --> autoflow{{尝试自动转移}}
  autoflow --> conditionB2C[B到C的条件函数] -.-> C
  autoflow --> conditionB2D[B到D的条件函数] -.-> D

```
