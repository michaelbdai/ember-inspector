/**
  A tree structure for assembling a list of render calls so they can be grouped and displayed nicely afterwards.

  @class ProfileNode
**/
import Ember from '../utils/ember';

const { get, guidFor } = Ember;

const ProfileNode = function (start, payload, parent, now, shouldHighlightRender) {
  let name;
  this.start = start;
  this.timestamp = now || Date.now();
  this.shouldHighlightRender = shouldHighlightRender;

  if (payload) {
    if (payload.template) {
      name = payload.template;
    } else if (payload.view) {
      const view = payload.view;
      name = get(view, 'instrumentDisplay') || get(view, '_debugContainerKey');
      if (name) {
        name = name.replace(/^view:/, '');
      }
      const elementId = get(view, 'elementId');
      if (elementId && this.shouldHighlightRender) {
        const numberStr = elementId.substring(5);
        const number = parseInt(numberStr)
        if (number) {
          const element = document.getElementById(elementId);
          if (element) {
          const outline = element.style.outline;
            element.style.outline  = '0.5px solid red';
            setTimeout(()=> {
              element.style.outline  = outline && 'none';
            }, 1000)
          }
        }
      }
      this.viewGuid = guidFor(view);
    }

    if (!name && payload.object) {
      name = payload.object
        .toString()
        .replace(/:?:ember\d+>$/, '')
        .replace(/^</, '');
      if (!this.viewGuid) {
        const match = name.match(/:(ember\d+)>$/);
        if (match && match.length > 1) {
          this.viewGuid = match[1];
        }
      }
    }
  }

  this.name = name || 'Unknown view';

  if (parent) {
    this.parent = parent;
  }
  this.children = [];
};

ProfileNode.prototype = {
  finish(timestamp) {
    this.time = timestamp - this.start;
    this.calcDuration();

    // Once we attach to our parent, we remove that reference
    // to avoid a graph cycle when serializing:
    if (this.parent) {
      this.parent.children.push(this);
      this.parent = null;
    }
  },

  calcDuration() {
    this.duration = Math.round(this.time * 100) / 100;
  },
};

export default ProfileNode;
