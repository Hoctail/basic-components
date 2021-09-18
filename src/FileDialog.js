import React, { Component } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { plugin, metaElement, typePlugin } from '@hoc/plugins-core'

import { InputFile } from './InputFile'

const SFileDialog = styled.div`
`
/*
  FileDialog kept for compatibility. All the value is inside InputFile
*/

export const FileDialog = plugin('FileDialog', {
  inputFile: typePlugin(InputFile, p => p.create()),
}).actions(self => ({
  setOnFileObserver (cb) {
    self.inputfile.setOnFileObserver(cb)
  },
  onFileObserver (file) {
    self.inputFile.onFileObserver(file)
  },
})).views(self => ({
  get multiple () {
    return self.inputFile.multiple
  },
  get accept () {
    return self.inputFile.accept
  },
})).actions(self => ({
  openDialog () {
    self.inputFile.openDialog()
  },
  setMultiple (multiple) {
    self.inputFile.setAccept(multiple)
  },
  setAccept (accept) {
    self.inputFile.setAccept(accept)
  },
})).component(class FileDialogClass extends Component {
  static propTypes = { data: PropTypes.object }
  render () {
    const { data, ...restProps } = this.props
    const { inputFile } = data
    return (
      <SFileDialog {...restProps} >
        {metaElement(inputFile)}
      </SFileDialog>
    )
  }
})

export default FileDialog
