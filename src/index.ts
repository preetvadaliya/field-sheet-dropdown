/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/naming-convention */
import {BlockSvg, DropDownDiv, Field, FieldDropdown, fieldRegistry, Menu, MenuItem, MenuOption, UnattachedFieldError} from 'blockly';
import * as Blockly from 'blockly';

export interface FieldSheetDropdownJSON {value: string; key: string; parentFieldName: string}

/**
 * Create a new FieldSheetDropdown
 */
export class FieldSheetDropdown extends Field {
  key: string;
  parentFieldName: string;
  private arrow: SVGTSpanElement|null = null;
  private svgArrow: SVGElement|null = null;
  protected menu: Menu|null = null;
  private selectedOption?: MenuOption;
  private selectedMenuItem: MenuItem|null = null;

  /**
   * @param value initial value.
   * @param key Google Cloud Platform API key.
   * @param parentFieldName A parent field name.
   */
  constructor(value: string, key: string, parentFieldName: string) {
    super(value, undefined, {});
    this.key = key;
    this.parentFieldName = parentFieldName;
    this.SERIALIZABLE = true;
    this.CURSOR = 'pointer';
  }

  /**
   * @param options JSON object contains the data.
   * @param options.key Google Cloud Platform API key.
   * @param options.parentFieldName A parent field name.
   * @param options.value initial value.
   * @returns new field
   */
  static fromJson(options: FieldSheetDropdownJSON): Field {
    return new this(options.value, options.key, options.parentFieldName);
  }

  /**
   * @param fieldElement XML element contains field data.
   * @returns updated XML element.
   */
  override toXml(fieldElement: Element): Element {
    fieldElement.setAttribute('key', this.key);
    fieldElement.setAttribute('parentFieldName', this.parentFieldName);
    fieldElement.textContent = this.getValue();
    return fieldElement;
  }

  /**
   * @param fieldElement XML element contains field data.
   */
  override fromXml(fieldElement: Element): void {
    this.key = fieldElement.getAttribute('key');
    this.parentFieldName = fieldElement.getAttribute('parentFieldName');
    this.setValue(fieldElement.textContent);
  }

  /**
   * @returns JSON state of field.
   */
  override saveState() {
    return {
      key: this.key,
      parentFieldName: this.parentFieldName,
      value: this.getValue(),
    };
  }

  /**
   * @param state JSON state of field.
   */
  override loadState(state: FieldSheetDropdownJSON): void {
    this.key = state.key;
    this.parentFieldName = state.parentFieldName;
    this.setValue(state.value);
  }

  /**
   * Whether or not the dropdown should add a border rect.
   * @returns True if the dropdown field should add a border rect.
   */
  protected shouldAddBorderRect(): boolean {
    return !this.getConstants()?.FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW ||
      this.getConstants()?.FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW &&
      !this.getSourceBlock()?.isShadow();
  }

  /**
   * Create a field border rect element. Not to be overridden by subclasses.
   * Instead modify the result of the function inside initView, or create a
   * separate function to call.
   */
  protected createBorderRect(): void {
    this.borderRect_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.RECT,
        {
          'rx': this.getConstants()?.FIELD_BORDER_RECT_RADIUS,
          'ry': this.getConstants()?.FIELD_BORDER_RECT_RADIUS,
          'x': 0,
          'y': 0,
          'height': this.size_.height,
          'width': this.size_.width,
          'class': 'blocklyFieldRect',
        },
        this.fieldGroup_);
  }

  /**
   * Create a field text element. Not to be overridden by subclasses. Instead
   * modify the result of the function inside initView, or create a separate
   * function to call.
   */
  protected createTextElement(): void {
    this.textElement_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.TEXT,
        {'class': 'blocklyText'},
        this.fieldGroup_
    );
    if (this.getConstants()?.FIELD_TEXT_BASELINE_CENTER) {
      this.textElement_.setAttribute('dominant-baseline', 'central');
    }
    this.textContent_ = document.createTextNode('');
    this.textElement_.appendChild(this.textContent_);
  }

  /**
   * Create text arrow.
   */
  protected createTextArrow(): void {
    this.arrow = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.TSPAN, {},
        this.textElement_
    );
    this.arrow?.appendChild(document.createTextNode(
        this.getSourceBlock()?.RTL ? FieldDropdown.ARROW_CHAR + ' ' :
                                     ' ' + FieldDropdown.ARROW_CHAR));
    if (this.getSourceBlock()?.RTL) {
      this.getTextElement().insertBefore(this.arrow, this.textContent_);
    } else {
      this.getTextElement().appendChild(this.arrow);
    }
  }

  /**
   * Create SVG arrow.
   */
  protected createSVGArrow(): void {
    this.svgArrow = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.IMAGE, {
          'height': this.getConstants()?.FIELD_DROPDOWN_SVG_ARROW_SIZE + 'px',
          'width': this.getConstants()?.FIELD_DROPDOWN_SVG_ARROW_SIZE + 'px',
        },
        this.fieldGroup_);
    this.svgArrow?.setAttributeNS(
        Blockly.utils.dom.XLINK_NS, 'xlink:href',
        this.getConstants()?.FIELD_DROPDOWN_SVG_ARROW_DATAURI);
  }

  /**
   * Change the color of block based on state.
   */
  override applyColour() {
    const style = (this.sourceBlock_ as BlockSvg).style;
    if (this.borderRect_) {
      this.borderRect_.setAttribute('stroke', style.colourTertiary);
      if (this.menu) {
        this.borderRect_.setAttribute('fill', style.colourTertiary);
      } else {
        this.borderRect_.setAttribute('fill', 'transparent');
      }
    }
    if (this.sourceBlock_ && this.arrow) {
      if (this.sourceBlock_.isShadow()) {
        this.arrow.style.fill = style.colourSecondary;
      } else {
        this.arrow.style.fill = style.colourPrimary;
      }
    }
  }

  /**
   * Create the block UI for this dropdown.
   */
  override initView(): void {
    if (this.shouldAddBorderRect()) {
      this.createBorderRect();
    } else {
      this.clickTarget_ = (this.sourceBlock_ as BlockSvg).getSvgRoot();
    }
    this.createTextElement();
    if (this.getConstants()?.FIELD_DROPDOWN_SVG_ARROW) {
      this.createSVGArrow();
    } else {
      this.createTextArrow();
    }
    if (this.borderRect_) {
      Blockly.utils.dom.addClass(this.borderRect_, 'blocklyDropdownRect');
    }
  }

  /**
   * Generate 2D options array.
   * @param sheetUrl spreadsheet url.
   */
  private async getOptions(sheetUrl: string) {
    const newSheetId = /\/spreadsheets\/d\/([\w-]+)/.exec(sheetUrl)?.[1] || '';
    const options = [];
    if (newSheetId === '') {
      options.push([' ', ' ']);
    } else {
      const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + newSheetId + '?key=' + this.key;
      try {
        const response = await fetch(url);
        const data = await response.json();
        const sheets = data.sheets;
        Array.from(sheets).forEach((sheet: any) => {
          options.push([sheet.properties.title, sheet.properties.title]);
        });
      } catch {
        options.push([' ', ' ']);
      }
    }
    return options;
  }

  /**
   * Show editor when user click on field.
   * @param e mouse event obj.
   */
  protected override async showEditor_(e?: MouseEvent) {
    const block = this.getSourceBlock();
    if (!block) {
      throw new UnattachedFieldError();
    }
    await this.dropdownCreate();
    if (e && typeof e.clientX === 'number') {
      this.menu!.openingCoords = new Blockly.utils.Coordinate(
          e.clientX, e.clientY);
    } else {
      this.menu!.openingCoords = null;
    }
    DropDownDiv.clearContent();
    const menuElement = this.menu?.render(DropDownDiv.getContentDiv());
    Blockly.utils.dom.addClass(menuElement, 'blocklyDropdownMenu');
    if (this.getConstants()!.FIELD_DROPDOWN_COLOURED_DIV) {
      const primaryColour =
          block.isShadow() ? block.getParent()!.getColour() : block.getColour();
      const borderColour = block.isShadow() ?
          (block.getParent() as BlockSvg).style.colourTertiary :
          (this.sourceBlock_ as BlockSvg).style.colourTertiary;
      DropDownDiv.setColour(primaryColour, borderColour);
    }
    DropDownDiv.showPositionedByField(this, this.dropdownDispose.bind(this));
    this.menu?.focus();
    if (this.selectedMenuItem) {
      this.menu?.setHighlighted(this.selectedMenuItem);
      Blockly.utils.style.scrollIntoContainerView(
          this.selectedMenuItem.getElement()!, DropDownDiv.getContentDiv(),
          true);
    }
    this.applyColour();
  }

  /**
   * Dropdown dispose handler.
   */
  protected dropdownDispose() {
    if (this.menu) {
      this.menu.dispose();
    }
    this.menu = null;
    this.selectedMenuItem = null;
    this.applyColour();
  }

  /**
   * Create a dropdown.
   */
  private async dropdownCreate() {
    const block = this.getSourceBlock();
    if (!block) {
      throw new UnattachedFieldError();
    }
    const menu = new Menu();
    menu.setRole(Blockly.utils.aria.Role.LISTBOX);
    this.menu = menu;
    this.selectedMenuItem = null;
    const sheetUrl = block.getFieldValue(this.parentFieldName) || '';
    const options = await this.getOptions(sheetUrl);
    options.forEach((item)=>{
      const [label, value] = item;
      const menuItem = new MenuItem(label, value);
      menuItem.setRole(Blockly.utils.aria.Role.OPTION);
      menuItem.setRightToLeft(block.RTL);
      menuItem.setCheckable(true);
      menu.addChild(menuItem);
      menuItem.setChecked(value === this.value_);
      if (value === this.value_) {
        this.selectedMenuItem = menuItem;
      }
      menuItem.onAction(this.onItemSelected, this);
    });
  }

  /**
   * MenuItem selection event handler.
   * @param menuItem selected item.
   */
  private onItemSelected(menuItem: MenuItem) {
    DropDownDiv.hideIfOwner(this, true);
    this.setValue(menuItem.getValue());
  }
}

fieldRegistry.register('field_sheet_dropdown', FieldSheetDropdown);
