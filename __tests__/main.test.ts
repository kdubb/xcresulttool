// import {wait} from '../src/wait'
import * as cp from 'child_process'
import * as path from 'path'
import * as process from 'process'
import {expect, test} from '@jest/globals'

test('throws invalid number', async () => {
  const input = parseInt('foo', 10)
  // await expect(wait(input)).rejects.toThrow('milliseconds not a number')
})

// test('wait 500 ms', async () => {
//   const start = new Date()
//   await wait(500)
//   const end = new Date()
//   var delta = Math.abs(end.getTime() - start.getTime())
//   expect(delta).toBeGreaterThan(450)
// })

// test('test runs', () => {
//   process.env['INPUT_XCRESULT'] = '__tests__/results.xcresult'
//   const np = process.execPath
//   const ip = path.join(__dirname, '..', 'lib', 'main.js')
//   const options: cp.ExecFileSyncOptions = {
//     env: process.env
//   }
//   console.log(cp.execFileSync(np, [ip], options).toString())
// })