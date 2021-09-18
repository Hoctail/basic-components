import React from 'react'
import PropTypes from 'prop-types'
import { types } from 'mobx-state-tree'
import { plugin } from '@hoc/plugins-core'

export const InputFile = plugin('InputFile', {
  id: types.identifier,
  accept: '*/*',
  multiple: true,
  defaultEvents: {
    onChange: 'InputFile.Changed',
  },
}).actions(self => ({
  setAccept (accept) {
    self.accept = accept
  },
  setMultiple (multiple) {
    self.multiple = multiple
  },
  openDialog () {
    // reset input val if upload the same file twice
    self.element.value = null
    self.element.click()
  },
})).actions(self => {
  let _fileObserver
  function setOnFileObserver (cb) {
    _fileObserver = cb
    self.onDestroy(() => {
      _fileObserver = null
    })
  }
  function onFileObserver (file) {
    if (_fileObserver) return _fileObserver(file)
  }
  return { setOnFileObserver, onFileObserver }
}).component(class InputFile extends React.Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { accept, multiple } = data
    return (
      <form style={{ display: 'none' }}>
        <input {...restProps}
          type='file'
          accept={accept}
          style={{ display: 'none' }}
          multiple={multiple}
        />
      </form>
    )
  }
}).events({
  Changed: ({ self, event }) => {
    Object.values(event.target.files).map(file => {
      self.onFileObserver(file)
    })
  },
})

export default InputFile
