<template>
  <div class="spec-info shadow border p-2" v-bind:class="styleClass">
    <p class="absolute-handle-right font-italic smaller border rounded bg-opacity pointer m-0 px-2"
       v-bind:class="borderStyleClass" @click="visible = !visible">
      <fa-icon icon="chevron-down" size="xs" :class="visible ? null : 'collapsed'"></fa-icon>
      {{ visible ? 'Close' : 'Open' }}
    </p>

    <b-collapse v-model="visible">
      <template v-for="(conditionProperties, etsId) in condition.sources.properties">
        <div v-for="prop in conditionProperties" class="row align-items-center mx-2">
          <div class="col-auto p-0">
            <ets-property :entity-type-selection="$root.getEntityTypeSelectionById(etsId)"
                          :property="prop.property" :read-only="true" :small="true"/>
          </div>

          <div class="col-auto px-2 font-weight-bold" v-if="prop.transformers && prop.transformers.length > 0">
            with transformer
            <span v-html="transformersHumanReadable(prop.transformers)"/>
          </div>
        </div>

        <div v-if="condition.sources.transformers.length > 0" class="row align-items-center mx-2">
          All having transformers
          <span v-html="transformersHumanReadable(condition.sources.transformers)"/>
        </div>
      </template>

      <p class="font-weight-bold mx-0 my-1">against</p>

      <template v-for="(conditionProperties, etsId) in condition.targets.properties">
        <div v-for="prop in conditionProperties" class="row align-items-center mx-2">
          <div class="col-auto p-0">
            <ets-property :entity-type-selection="$root.getEntityTypeSelectionById(etsId)"
                          :property="prop.property" :read-only="true" :small="true"/>
          </div>

          <div class="col-auto font-weight-bold" v-if="prop.transformers && prop.transformers.length > 0">
            with transformer
            <span v-html="transformersHumanReadable(prop.transformers)"/>
          </div>
        </div>

        <div v-if="condition.targets.transformers.length > 0" class="row align-items-center mx-2">
          All having transformers
          <span v-html="transformersHumanReadable(condition.targets.transformers)"/>
        </div>
      </template>

      <div v-if="condition.method.name === 'INTERMEDIATE'" class="font-weight-bold mx-0 mt-1 mb-0">
        using <span class="text-secondary">{{ method.label }}</span> where

        <div class="row align-items-center m-0">
          <div class="col-auto pr-1">
            <span class="text-secondary">Source</span> =
          </div>

          <div class="col-auto p-0">
            <ets-property
                :entity-type-selection="$root.getEntityTypeSelectionById(condition.method.config.entity_type_selection)"
                :property="condition.method.config.intermediate_source" :read-only="true" :small="true"/>
          </div>
        </div>

        <div class="row align-items-center m-0">
          <div class="col-auto pr-1">
            <span class="text-secondary">Target</span> =
          </div>

          <div class="col-auto p-0">
            <ets-property
                :entity-type-selection="$root.getEntityTypeSelectionById(condition.method.config.entity_type_selection)"
                :property="condition.method.config.intermediate_target" :read-only="true" :small="true"/>
          </div>
        </div>
      </div>

      <p v-else class="font-weight-bold mx-0 mt-1 mb-0" v-html="conditionHumanReadable"/>
    </b-collapse>
  </div>
</template>

<script>
    import props from "@/utils/props";

    export default {
        name: "LinksetSpecConditionInfo",
        data() {
            return {
                tNorms: props.tNorms,
                tConorms: props.tConorms,
                visible: true,
            };
        },
        props: {
            condition: Object,
            usingFuzzyLogic: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            styleClass() {
                const styleClass = [];

                if (this.$parent.$parent.styleClass.includes('bg-primary-light'))
                    styleClass.push('bg-secondary-light', 'border-secondary');
                else
                    styleClass.push('bg-primary-light', 'border-primary');

                return styleClass;
            },

            borderStyleClass() {
                if (this.$parent.$parent.styleClass.includes('bg-primary-light'))
                    return 'border-primary';

                return 'border-secondary';
            },

            matchingMethods() {
                return this.$root.methods.matching_methods;
            },

            transformers() {
                return this.$root.methods.transformers;
            },

            method() {
                if (this.condition.method.name && this.matchingMethods.hasOwnProperty(this.condition.method.name))
                    return this.matchingMethods[this.condition.method.name];

                return {label: '', items: {}};
            },

            simMethod() {
                if (this.condition.sim_method.name && this.matchingMethods.hasOwnProperty(this.condition.sim_method.name))
                    return this.matchingMethods[this.condition.sim_method.name];

                return {label: '', items: {}};
            },

            methodValuePropsHumanReadable() {
                return this.methodConfigHumanReadable(this.method.items, this.condition.method.config);
            },

            simMethodValuePropsHumanReadable() {
                return this.methodConfigHumanReadable(this.simMethod.items, this.condition.sim_method.config);
            },

            conditionHumanReadable() {
                let html = `using <span class="text-secondary">${this.method.label}</span>`;
                if (Object.keys(this.method.items).length > 0)
                    html += ` [ ${this.methodValuePropsHumanReadable} ]`;

                if (this.simMethod.label) {
                    if (!this.condition.sim_method.normalized)
                        html += ' not';

                    html += ` normalized with <span class="text-secondary">${this.simMethod.label}</span>`;
                    if (Object.keys(this.simMethod.items).length > 0)
                        html += ` [ ${this.simMethodValuePropsHumanReadable} ]`;
                }

                if (this.condition.list_matching.threshold > 0) {
                    let threshold = this.condition.list_matching.threshold;
                    threshold += this.condition.list_matching.is_percentage ? ' %' : 'links';

                    html += ' and list matching enabled with a minimum threshold of';
                    html += ` <span class="text-secondary">${threshold}</span>`;

                    if (this.usingFuzzyLogic) {
                        html += ' using a t-norm of';
                        html += ` <span class="text-secondary">${this.tNorms[this.condition.fuzzy.t_norm]}</span>`;

                        html += ' and a t-conorm of';
                        html += ` <span class="text-secondary">${this.tConorms[this.condition.fuzzy.t_conorm]}</span>`;

                        if (this.condition.fuzzy.threshold > 0) {
                            html += ' having a threshold of';
                            html += ` <span class="text-secondary">${this.condition.fuzzy.threshold}</span>`;
                        }
                    }
                }
                else if (this.usingFuzzyLogic) {
                    html += ' using a t-conorm of';
                    html += ` <span class="text-secondary">${this.tConorms[this.condition.fuzzy.t_conorm]}</span>`;

                    if (this.condition.fuzzy.threshold > 0) {
                        html += ' having a threshold of';
                        html += ` <span class="text-secondary">${this.condition.fuzzy.threshold}</span>`;
                    }
                }

                return html;
            },
        },
        methods: {
            methodConfigHumanReadable(items, config) {
                return Object.entries(items)
                    .filter(([key]) => !['entity_type_selection', 'property'].includes(key))
                    .map(([key, item]) => {
                        const value = (item.type === 'choices') ? item.choices[config[key]] : config[key];
                        if (item.label)
                            return `<span class="text-secondary">${item.label}</span> = `
                                + `<span class="text-secondary">${value}</span>`;

                        return `<span class="text-secondary">${value}</span>`;
                    }).join(' and ');
            },

            transformersHumanReadable(transformers) {
                return transformers.map(transformer => {
                    const info = this.transformers[transformer.name];
                    const params = Object.entries(info.items).map(([key, item]) =>
                        `<span class="text-secondary">${item.label}</span> = ` +
                        `<span class="text-secondary">${transformer.parameters[key]}</span>`
                    ).join(' and ');

                    if (!info.items || info.items.length === 0)
                        return `<span class="text-secondary">${info.label}</span>`;

                    return `<span class="text-secondary">${info.label}</span> [ ${params} ]`;
                }).join(' and ');
            },
        },
    }
</script>