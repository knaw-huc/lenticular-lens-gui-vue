<template>
  <sub-card size="sm" label="Method configuration">
    <div v-if="showMatchingConfig" class="config-group">
      <span v-if="showLabel" class="badge badge-secondary right">Method configuration</span>
      <condition-method :id="'method_' + id" :method="method" :config="condition.method.config" ref="methodConfig"/>
    </div>

    <div v-if="showSimMatchingConfig" class="config-group">
      <span v-if="showLabel" class="badge badge-secondary right">Similarity method configuration</span>

      <div class="form-group row">
        <label :for="'sim_method_' + id" class="col-sm-3 col-form-label">
          Apply similarity method
        </label>

        <div class="col-sm-3">
          <select :id="'sim_method_' + id" class="form-control form-control-sm"
                  v-bind:class="{'is-invalid': errors.includes('sim_method_name')}"
                  v-model="condition.sim_method.name" @change="$emit('sim-method-change', $event)">
            <option disabled selected value="">Select a similarity method</option>
            <option v-for="methodName in similarityMethods.keys()" :value="methodName">
              {{ similarityMethods.get(methodName).label }}
            </option>
          </select>
        </div>
      </div>

      <condition-method v-if="simMethod.items.size > 0" :id="'sim_method_' + id"
                        :method="simMethod" :config="condition.sim_method.config" ref="methodSimConfig"/>

      <div v-if="condition.sim_method.name" class="form-group row">
        <div class="col">
          <div class="form-check">
            <input class="form-check-input" type="checkbox"
                   :id="'method_sim_normalized_' + id" v-model="condition.sim_method.normalized">
            <label class="form-check-label" :for="'method_sim_normalized_' + id">
              Apply similarity method on normalized value?
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="applyListMatching" class="config-group">
      <span v-if="showLabel" class="badge badge-secondary right">List matching configuration</span>

      <div class="form-group row">
        <label :for="'list_links_threshold_' + id" class="col-sm-3 col-form-label">
          Minimum intersections
        </label>

        <div class="col-sm-1">
          <input :id="'list_links_threshold_' + id" class="form-control form-control-sm"
                 type="number" step="1"
                 v-model.number="condition.list_matching.threshold"
                 v-bind:class="{'is-invalid': errors.includes('links_threshold') || errors.includes('list_matching')}">
        </div>

        <div class="col-auto">
          <div class="form-check">
            <input class="form-check-input" type="radio" :id="'list_links_threshold_items_' + id"
                   v-model="condition.list_matching.is_percentage" :value="false">
            <label class="form-check-label" :for="'list_links_threshold_items_' + id">
              intersections
            </label>
          </div>
        </div>

        <div class="col-auto">
          <div class="form-check">
            <input class="form-check-input" type="radio" :id="'list_links_threshold_percentage_' + id"
                   v-model="condition.list_matching.is_percentage" :value="true">
            <label class="form-check-label" :for="'list_links_threshold_percentage_' + id">
              %
            </label>
          </div>
        </div>

        <div class="col-auto" v-show="errors.includes('links_threshold')">
          <div class="invalid-feedback inline-feedback"
               v-bind:class="{'is-invalid': errors.includes('links_threshold')}">
            Please specify a valid value
          </div>
        </div>
      </div>

      <div v-if="useFuzzyLogic" class="form-group row">
        <label :for="'s_norm_' + id" class="col-sm-3 col-form-label">
          T-norm
        </label>

        <div class="col-sm-3">
          <select :id="'t_norm_' + id" class="form-control form-control-sm" v-model="condition.fuzzy.t_norm">
            <option v-for="(description, key) in tNorms" :value="key">
              {{ description }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="useFuzzyLogic" class="form-group row">
        <label :for="'s_norm_' + id" class="col-sm-3 col-form-label">
          T-conorm
        </label>

        <div class="col-sm-3">
          <select :id="'s_norm' + id" class="form-control form-control-sm" v-model="condition.fuzzy.s_norm">
            <option v-for="(description, key) in sNorms" :value="key">
              {{ description }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="useFuzzyLogic" class="form-group row">
        <label :for="'threshold_' + id" class="col-sm-3 col-form-label">
          Threshold
        </label>

        <div class="col-sm-2">
          <range :id="'threshold_' + id" v-model.number="condition.fuzzy.threshold" :allow-zero="false"/>
        </div>
      </div>

      <div class="invalid-feedback mb-2" v-bind:class="{'is-invalid': errors.includes('list_matching')}">
        Please specify at least a minimum number of intersections
      </div>
    </div>

    <div v-else-if="useFuzzyLogic" class="config-group">
      <span v-if="showLabel" class="badge badge-secondary right">Fuzzy logic configuration</span>

      <div class="form-group row">
        <label :for="'s_norm_' + id" class="col-sm-3 col-form-label">
          T-conorm
        </label>

        <div class="col-sm-3">
          <select :id="'s_norm' + id" class="form-control form-control-sm" v-model="condition.fuzzy.s_norm">
            <option v-for="(description, key) in sNorms" :value="key">
              {{ description }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label :for="'threshold_' + id" class="col-sm-3 col-form-label">
          Threshold
        </label>

        <div class="col-sm-2">
          <range :id="'threshold_' + id" v-model.number="condition.fuzzy.threshold" :allow-zero="false"/>
        </div>
      </div>
    </div>
  </sub-card>
</template>

<script>
    import props from "@/utils/props";
    import ValidationMixin from "@/mixins/ValidationMixin";

    import ConditionMethod from "./ConditionMethod";

    export default {
        name: "ConditionConfiguration",
        components: {
            ConditionMethod,
        },
        mixins: [ValidationMixin],
        data() {
            return {
                tNorms: props.tNorms,
                sNorms: props.sNorms,
            };
        },
        props: {
            id: String,
            condition: Object,
            method: Object,
            simMethod: Object,
            useFuzzyLogic: Boolean,
            configureMatching: Boolean,
            applySimMethod: Boolean,
            applyListMatching: Boolean,
        },
        computed: {
            similarityMethods() {
                return Array.from(this.$root.methods.matching_methods.keys())
                    .filter(key => this.$root.methods.matching_methods.get(key).type === 'similarity')
                    .reduce((obj, key) => {
                        obj.set(key, this.$root.methods.matching_methods.get(key));
                        return obj;
                    }, new Map());
            },

            showMatchingConfig() {
                return this.configureMatching && this.method.items.size > 0;
            },

            showSimMatchingConfig() {
                return this.applySimMethod && this.method.items.size > 0 && this.method.type === 'normalizer';
            },

            showLabel() {
                let show = 0;

                if (this.showMatchingConfig)
                    show++;
                if (this.showSimMatchingConfig)
                    show++;
                if (this.applyListMatching || this.useFuzzyLogic)
                    show++;

                return show > 1;
            },
        },
        methods: {
            validateConditionConfiguration() {
                const simMethodNameValid = this.validateField('sim_method_name',
                    !(this.applySimMethod && this.method.items.size > 0
                        && this.method.type === 'normalizer') || this.condition.sim_method.name);

                const methodConfigValid = this.validateField('method_config',
                    this.$refs.methodConfig ? this.$refs.methodConfig.validateConditionMethod() : true);
                const methodSimConfigValid = this.validateField('method_sim_config',
                    this.$refs.methodSimConfig ? this.$refs.methodSimConfig.validateConditionMethod() : true);

                const listMatchingValid = this.validateField('list_matching',
                    !this.applyListMatching || (this.condition.list_matching.threshold >= 0
                    && (!this.condition.list_matching.is_percentage || this.condition.list_matching.threshold <= 100)));

                return simMethodNameValid && methodConfigValid && methodSimConfigValid && listMatchingValid;
            },
        },
    };
</script>
