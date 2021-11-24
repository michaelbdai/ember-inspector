import { action, computed, get } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  isExpanded: computed('mixin.{expand,properties.length}', function () {
    return (
      get(this, 'mixin.expand') && get(this, 'mixin.properties.length') > 0
    );
  }),

  toggle: action(function () {
    this.toggleProperty('mixin.expand');
  }),
});
