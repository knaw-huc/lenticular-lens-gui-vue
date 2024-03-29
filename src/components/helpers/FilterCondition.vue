<template>
  <div class="border border-dark p-3 mt-3">
    <div class="row align-items-center justify-content-between m-0 mb-2">
      <div class="col p-0">
        <ets-property v-if="entityTypeSelection" :entity-type-selection="entityTypeSelection"
                      :property="condition.property" :singular="true" :show-info="false"
                      ref="propertyComponent"/>
        <property v-else :graphql-endpoint="graphqlEndpoint" :dataset-id="datasetId" :collection-id="collectionId"
                  :property="condition.property" :singular="true" :show-info="false"
                  ref="propertyComponent"/>
      </div>

      <div class="col-auto">
        <div class="row">
          <div class="col-auto">
            <button-delete @click="$emit('remove', index)" title="Delete this Filter Condition" class="pt-1 pr-0"/>
          </div>

          <div class="col-auto">
            <button-add v-on:click="$emit('add')" title="Add Filter Condition and Create Group"/>
          </div>
        </div>
      </div>
    </div>

    <div class="form-row align-items-center">
      <div class="col-3">
        <select-box :auto-height="false" v-model="condition.type" @input="onTypeSelection"
                    v-bind:class="{'is-invalid': errors.includes('condition')}">
          <option value="" disabled selected>Choose a filter type</option>
          <option v-for="key in filterFunctions.keys()" :value="key">
            {{ filterFunctions.get(key).label }}
          </option>
        </select-box>
      </div>

      <div v-if="selectedFilterFunction.hasOwnProperty('type') &&
                 (selectedFilterFunction.type === 'string' || selectedFilterFunction.type === 'date')"
           class="col-3">
        <input class="form-control form-control-sm" type="text" v-model="condition.value"
               placeholder="Enter a value" v-bind:class="{'is-invalid': errors.includes('value')}">
      </div>
      <div v-else-if="selectedFilterFunction.hasOwnProperty('type') && selectedFilterFunction.type === 'number'"
           class="col-1">
        <input class="form-control form-control-sm" type="number" v-model.number="condition.value"
               placeholder="Enter a value" v-bind:class="{'is-invalid': errors.includes('value')}">
      </div>

      <div v-if="selectedFilterFunction.hasOwnProperty('type') && selectedFilterFunction.type === 'date'"
           class="col-4 form-inline">
        <label>
          Date format
          <input class="form-control form-control-sm ml-2" v-model="condition.format" value="YYYY-MM-DD"
                 v-bind:class="{'is-invalid': errors.includes('format')}">
        </label>
      </div>
    </div>

    <div v-if="selectedFilterFunction.hasOwnProperty('help_text')" class="row">
      <small class="form-text text-muted pl-3">
        {{ selectedFilterFunction.help_text }}
      </small>
    </div>

    <div class="row" v-show="errors.includes('property') || hasConditionErrors">
      <div class="invalid-feedback pl-3"
           v-bind:class="{'is-invalid': errors.includes('property') || hasConditionErrors}">
        <template v-if="errors.includes('property')">
          Please select a property
        </template>

        <template v-if="errors.includes('property') && hasConditionErrors">
          <br/>
        </template>

        <template v-if="errors.includes('condition')">
          Please provide a filter type
        </template>
        <template v-else-if="errors.includes('value')">
          Please provide a value for the condition
        </template>
        <template v-else-if="errors.includes('format')">
          Please provide a date format
        </template>
      </div>
    </div>
  </div>
</template>

<script>
    import ValidationMixin from "@/mixins/ValidationMixin";

    export default {
        name: "FilterCondition",
        mixins: [ValidationMixin],
        props: {
            entityTypeSelection: Object,
            graphqlEndpoint: String,
            datasetId: String,
            collectionId: String,
            condition: Object,
            index: Number,
        },
        computed: {
            filterFunctions() {
                return this.$root.methods.filter_functions;
            },

            selectedFilterFunction() {
                if (this.filterFunctions.has(this.condition.type))
                    return this.filterFunctions.get(this.condition.type);

                return {label: ''};
            },

            hasConditionErrors() {
                return this.errors.includes('condition')
                    || this.errors.includes('value')
                    || this.errors.includes('format');
            },
        },
        methods: {
            validateFilterCondition() {
                const propertyValid = this.validateField('property',
                    this.$refs.propertyComponent.validateProperty());
                const conditionValid = this.validateField('condition', this.condition.type);

                let valueValid = this.validateField('value', true);
                if (this.selectedFilterFunction.hasOwnProperty('type'))
                    valueValid = this.validateField('value', this.condition.value);

                const formatValid = this.validateField('format', this.condition.format
                    || !this.selectedFilterFunction.hasOwnProperty('type')
                    || this.selectedFilterFunction.type !== 'date');

                return propertyValid && conditionValid && valueValid && formatValid;
            },

            onTypeSelection() {
                if (!this.condition.format &&
                    this.selectedFilterFunction.hasOwnProperty('type') &&
                    this.selectedFilterFunction.type === 'date')
                    this.condition.format = 'YYYY-MM-DD';
                else if (!this.selectedFilterFunction.hasOwnProperty('type') || this.condition.type !== 'date')
                    delete this.condition.format;

                if (this.selectedFilterFunction.hasOwnProperty('type') &&
                    (this.selectedFilterFunction.type === 'string' || this.selectedFilterFunction.type === 'date') &&
                    this.condition.value)
                    this.condition.value = String(this.condition.value);
                else if (this.selectedFilterFunction.hasOwnProperty('type') &&
                    this.selectedFilterFunction.type === 'number' &&
                    this.condition.value) {
                    if (!isNaN(parseInt(this.condition.value)))
                        this.condition.value = parseInt(this.condition.value);
                    else
                        delete this.condition.value;
                }
                else
                    delete this.condition.value;
            },
        },
    }
</script>
