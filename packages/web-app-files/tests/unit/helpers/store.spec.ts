import { cloneStateObject } from '../../../src/helpers/store'

describe('cloneStateObject', () => {
  it('clones object', () => {
    const og = { id: '1', frozen: 'value' }
    const cloned = cloneStateObject(og)

    cloned.frozen = 'updated'

    expect(og.id).toBe('1')
    expect(og.frozen).toBe('value')
    expect(cloned.id).toBe('1')
    expect(cloned.frozen).toBe('updated')
  })
})
