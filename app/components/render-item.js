
import { get } from '@ember/object';
import Component from '@glimmer/component';
import { isNone, isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import escapeRegExp from 'ember-inspector/utils/escape-reg-exp';

export default class RenderItem extends Component {
  constructor() {
    super(...arguments);
    elementId = get(this, 'args.model.elementId')
    if (elementId && this.args.shouldHighlightRender) {
      debugger;
      const numberStr = elementId.substring(5);
      const number = parseInt(numberStr)
      if (number) {
        const element = document.getElementById(elementId);
        if (element) {
        const border = element.style.border;
          element.style.border  = '0.5px solid red';
          setTimeout(()=> {
            element.style.border  = border && 'none';
          }, 1000)
        }
      }
    }
  }
  get searchMatch() {
    const { search } = this.args;
    if (isEmpty(search)) {
      return true;
    }
    const name = get(this, 'args.model.name');
    const regExp = new RegExp(escapeRegExp(search.toLowerCase()));
    return !!name.toLowerCase().match(regExp);
  }

  get nodeStyle() {
    let style = '';
    if (!this.searchMatch) {
      style = 'opacity: 0.5;';
    }
    return htmlSafe(style);
  }

  get level() {
    let parentLevel = get(this, 'args.target.level');
    if (isNone(parentLevel)) {
      parentLevel = -1;
    }
    return parentLevel + 1;
  }

  get nameStyle() {
    return htmlSafe(`padding-left: ${+this.level * 20 + 5}px;`);
  }

  get hasChildren() {
    return get(this.args, 'model.children.length') > 0
  }

  get readableTime() {
    const d = new Date(get(this.args, 'model.timestamp'));
    const ms = d.getMilliseconds();
    const seconds = d.getSeconds();
    const minutes =
      d.getMinutes().toString().length === 1
        ? `0${d.getMinutes()}`
        : d.getMinutes();
    const hours =
      d.getHours().toString().length === 1 ? `0${d.getHours()}` : d.getHours();

    return `${hours}:${minutes}:${seconds}:${ms}`;
  }

}
