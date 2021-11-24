import { action, computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import PropertiesBase from 'ember-inspector/components/object-inspector/properties-base';

const findMixin = function (mixins, property) {
  return mixins.find((m) => {
    return m.properties.includes(property);
  });
};

export default PropertiesBase.extend({
  port: service(),

  tagName: '',

  calculate: action(function (property) {
    const mixin = findMixin(get(this, 'model.mixins'), property);

    this.port.send('objectInspector:calculate', {
      objectId: this.model.objectId,
      mixinIndex: get(this, 'model.mixins').indexOf(mixin),
      property: property.name,
    });
  }),

  flatPropertyList: computed('customFilter', 'model.mixins', function () {
    const props = get(this, 'model.mixins').map(function (mixin) {
      return mixin.properties.filter(function (p) {
        let shoulApplyCustomFilter = this.customFilter
          ? p.name.toLowerCase().indexOf(this.customFilter.toLowerCase()) > -1
          : true;
        return !p.hasOwnProperty('overridden') && shoulApplyCustomFilter;
      }, this);
    }, this);

    return props.flat();
  }),
});
