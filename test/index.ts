/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Field test.
 */

import * as Blockly from 'blockly';
import {createPlayground} from '@blockly/dev-tools';
import {FieldSheetDropdown} from '../src';

Blockly.Blocks['spreadsheet'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('Spreadsheet URL')
        .appendField(new Blockly.FieldTextInput('https://docs.google.com/spreadsheets/d/12LoIvwJEOF068sZXI54NprVaRbf6wgKqC4KyaLz2I0Y/edit#gid=0'), 'URL');
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('Sheet')
        .appendField(new FieldSheetDropdown(
            'Select Sheet',
            'AIzaSyDrYxlx95xMF1ciRx-eVq4cpPBYTsw9o6Y',
            'URL'), 'SHEET');
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

const toolbox = document.getElementById('toolbox');

/**
 * Create a workspace.
 * @param blocklyDiv The blockly container div.
 * @param options The Blockly options.
 * @returns The created workspace.
 */
function createWorkspace(blocklyDiv: HTMLElement,
    options: Blockly.BlocklyOptions): Blockly.WorkspaceSvg {
  const workspace = Blockly.inject(blocklyDiv, options);
  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox,
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
