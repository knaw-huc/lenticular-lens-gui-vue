<template>
  <div>
    <div v-for="([key, item], idx) in method.items.entries()"
         v-if="item.type !== 'property' || config[item.entity_type_selection_key] !== undefined" class="form-group row">
      <label v-if="showLabel(item)" :for="id + idx" class="col-sm-3 col-form-label">{{ item.label }}</label>

      <div v-if="item.type === 'number'" class="col-sm-2">
        <input :id="id + idx" class="form-control form-control-sm" type="number"
               :step="item.step || 1" :min="item.min_value" :max="item.max_value" v-model.number="config[key]"
               v-bind:class="{'is-invalid': errors.includes(`method_config_${key}`)}">

        <div class="invalid-feedback" v-show="errors.includes(`method_config_${key}`)">
          Please specify a valid value
        </div>
      </div>

      <div v-else-if="item.type === 'range'" class="col-sm-2">
        <range :id="id + idx" :step="item.step" :min="item.min_value" :max="item.max_value" v-model.number="config[key]"
               v-bind:class="{'is-invalid': errors.includes(`method_config_${key}`)}"/>

        <div class="invalid-feedback" v-show="errors.includes(`method_config_${key}`)">
          Please specify a valid value
        </div>
      </div>

      <div v-else-if="item.type === 'string'" class="col-sm-3">
        <input :id="id + idx" class="form-control form-control-sm" type="text" v-model="config[key]"
               v-bind:class="{'is-invalid': errors.includes(`method_config_${key}`)}">

        <div class="invalid-feedback" v-show="errors.includes(`method_config_${key}`)">
          Please specify a valid value
        </div>
      </div>

      <div v-else-if="item.type === 'choices'" class="col-sm-3">
        <select :id="id + idx" class="form-control form-control-sm h-auto" v-model="config[key]"
                v-bind:class="{'is-invalid': errors.includes(`method_config_${key}`)}">
          <option disabled selected value="">Select an option</option>
          <option v-for="(choiceLabel, choiceValue) in item.choices" :value="choiceValue">
            {{ choiceLabel }}
          </option>
        </select>

        <div class="invalid-feedback" v-show="errors.includes(`method_config_${key}`)">
          Please specify a valid value
        </div>
      </div>

      <div v-else-if="item.type === 'boolean'" class="col">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" :id="id + idx" v-model="config[key]"
                 v-bind:class="{'is-invalid': errors.includes(`method_config_${key}`)}">

          <label class="form-check-label" :for="id + idx">
            {{ item.label }}
          </label>

          <div class="invalid-feedback" v-show="errors.includes(`method_config_${key}`)">
            Please specify a valid value
          </div>
        </div>
      </div>

      <div v-else-if="item.type === 'entity_type_selection'" class="col-sm-6">
        <select :id="id + idx" class="form-control form-control-sm h-auto" v-model="config[key]"
                v-bind:class="{'is-invalid': errors.includes(`method_config_${key}`)}">
          <option disabled selected value="">Choose an entity-type selection</option>
          <option v-for="ets in $root.entityTypeSelections" :value.number="ets.id">
            {{ ets.label }}
          </option>
        </select>

        <div class="invalid-feedback" v-show="errors.includes(`method_config_${key}`)">
          Please specify an entity-type selection
        </div>
      </div>

      <div v-else-if="item.type === 'property'" class="col-sm align-items-center m-0 mb-1">
        <div class="row m-0" v-for="(prop, idx) in config[key]" :key="idx">
          <ets-property :property="prop" :allow-delete="idx > 0" :show-info="false" :ref="key"
                        :entity-type-selection="$root.getEntityTypeSelectionById(config[item.entity_type_selection_key])"
                        @clone="config[key].push([''])"
                        @delete="config[key].splice(idx, 1)"/>
        </div>

        <div class="invalid-feedback" v-show="errors.includes(`method_config_${key}`)">
          Please specify a property
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    import ValidationMixin from "@/mixins/ValidationMixin";

    export default {
        name: "ConditionMethod",
        mixins: [ValidationMixin],
        props: ['id', 'method', 'config'],
        methods: {
            validateConditionMethod() {
                let methodValueValid = true;

                this.errors = this.errors.filter(err => !err.startsWith('method_config_'));
                this.method.items.forEach((valueItem, key) => {
                    const value = this.config[key];

                    const valueValid = !this.isInvalidMinValue(valueItem, value)
                        && !this.isInvalidMinExclValue(valueItem, value)
                        && !this.isInvalidMaxValue(valueItem, value)
                        && !this.isInvalidMaxExclValue(valueItem, value)
                        && !this.isInvalidChoices(valueItem, value)
                        && !this.isInvalidEntityTypeSelection(valueItem, value)
                        && !this.isInvalidProperty(valueItem, value);

                    if (!this.validateField(`method_config_${key}`, valueValid))
                        methodValueValid = false;
                });

                return methodValueValid;
            },

            isInvalidMinValue(valueItem, value) {
                return (valueItem.type === 'number' || valueItem.type === 'range')
                    && valueItem.hasOwnProperty('min_value')
                    && (isNaN(parseFloat(value)) || (parseFloat(value) < valueItem.min_value));
            },

            isInvalidMinExclValue(valueItem, value) {
                return (valueItem.type === 'number' || valueItem.type === 'range')
                    && valueItem.hasOwnProperty('min_excl_value')
                    && (isNaN(parseFloat(value)) || (parseFloat(value) <= valueItem.min_excl_value));
            },

            isInvalidMaxValue(valueItem, value) {
                return (valueItem.type === 'number' || valueItem.type === 'range')
                    && valueItem.hasOwnProperty('max_value')
                    && (isNaN(parseFloat(value)) || (parseFloat(value) > valueItem.max_value));
            },

            isInvalidMaxExclValue(valueItem, value) {
                return (valueItem.type === 'number' || valueItem.type === 'range')
                    && valueItem.hasOwnProperty('max_excl_value')
                    && (isNaN(parseFloat(value)) || (parseFloat(value) >= valueItem.max_excl_value));
            },

            isInvalidChoices(valueItem, value) {
                return valueItem.type === 'choices' && !Object.keys(valueItem.choices).includes(value);
            },

            isInvalidEntityTypeSelection(valueItem, value) {
                return valueItem.type === 'entity_type_selection' && isNaN(value);
            },

            isInvalidProperty(valueItem, value) {
                return valueItem.type === 'property' && (!value || value.length === 0)
                    && !this.$refs[valuekey].validateProperty();
            },

            showLabel(item) {
                return item.label && item.type !== 'boolean' && (item.type !== 'property'
                    || this.config[item.entity_type_selection_key] !== undefined);
            },
        },
    };
</script>