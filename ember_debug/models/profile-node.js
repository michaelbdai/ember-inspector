/**
  A tree structure for assembling a list of render calls so they can be grouped and displayed nicely afterwards.

  @class ProfileNode
**/
import Ember from '../utils/ember';

const { get, guidFor } = Ember;

function findRoots({ first, last, parent }) {

  debugger;
  const roots = [];
  const closest = parent.childNodes;
  if (first.node === last.node)
    return [first.node];

  let start = null;
  let end = null;
  for (let i = 0; i < closest.length; i++) {
    if (closest.item(i) === first.node)
      start = i;
    else if (closest.item(i) === last.node)
      end = i;
  }

  if (start === null || end === null)
    return [];


  for (let i = start; i <= end; i++)
    roots.push(closest.item(i));


  return roots.filter((el) => {
      if (el.nodeType === 3) {
          if (el.nodeValue.trim() === '') {
              return false;
          }
      }
      return el;
  })
}

const ProfileNode = function (start, payload, parent, now) {
  let name;
  this.start = start;
  this.timestamp = now || Date.now();

  if (payload) {
    if (payload.template) {
      name = payload.template;
    } else if (payload.view) {
      const view = payload.view;
      const symbols = Object.getOwnPropertySymbols(view)
      const bounds = view[symbols.find(sym => sym.description === "BOUNDS")]
      this.elements = findRoots(bounds);
      name = get(view, 'instrumentDisplay') || get(view, '_debugContainerKey');
      if (name) {
        name = name.replace(/^view:/, '');
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
